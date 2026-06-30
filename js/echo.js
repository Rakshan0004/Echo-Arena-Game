/**
 * echo.js — Replaying Ghost Characters (Echoes)
 * 
 * Defines the Echo class, which replays the recorded inputs of previous rounds:
 *  - Echo — stores a physics state compatible with simulatePhysics(), allowing deterministic replication.
 *  - update() — steps the current input index and re-runs simulatePhysics().
 *  - render() — draws the echo character with a ghostly purple/violet color scheme,
 *    swaying antenna, pulsing core, glowing visor, motion trail, afterimages, and surrounding particles.
 */
const ECHO_COLORS = [
    '#8b5cf6', // purple
    '#a855f7', // violet
    '#c084fc', // lavender
    '#d946ef', // fuchsia
    '#f472b6', // pink
];

class Echo {
    constructor(recording, spawnX, spawnY, echoIndex) {
        this.recording = recording;
        this.currentFrame = 0;
        this.echoIndex = echoIndex;
        this.color = ECHO_COLORS[echoIndex % ECHO_COLORS.length];
        this.finished = false;
        
        // Physics state (same shape as Player for simulatePhysics)
        this.x = spawnX;
        this.y = spawnY;
        this.w = 32;
        this.h = 38;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.wasOnGround = false;
        this.onWallLeft = false;
        this.onWallRight = false;
        this.facing = 1;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.squashX = 1;
        this.squashY = 1;
        
        // Trail for rendering
        this.trailPositions = [];
        
        // Afterimage particles
        this.afterImages = [];
    }
    
    update(level) {
        if (this.finished) return;
        
        if (this.currentFrame >= this.recording.length) {
            this.finished = true;
            return;
        }
        
        // Get recorded input for this frame
        const input = this.recording[this.currentFrame];
        this.currentFrame++;
        
        // Use the SAME shared physics as the player — deterministic replay
        simulatePhysics(this, input, level);
        
        // Trail
        this.trailPositions.push({ x: this.x, y: this.y });
        if (this.trailPositions.length > 12) {
            this.trailPositions.shift();
        }
        
        // Randomly emit echo trail particles for extra juice
        if (typeof game !== 'undefined' && game.particles && Math.random() < 0.3) {
            game.particles.emit('echoTrail', this.x + this.w/2, this.y + this.h/2, { color: this.color });
        }
        
        // Afterimage every 4 frames
        if (this.currentFrame % 4 === 0) {
            this.afterImages.push({ x: this.x, y: this.y, alpha: 0.4, life: 20 });
        }
        // Update afterimages
        for (let i = this.afterImages.length - 1; i >= 0; i--) {
            this.afterImages[i].life--;
            this.afterImages[i].alpha *= 0.92;
            if (this.afterImages[i].life <= 0) {
                this.afterImages.splice(i, 1);
            }
        }
    }
    
    // Stub for shared physics callbacks
    emitJumpParticles() {}
    emitWallJumpParticles() {}
    emitLandParticles() {}
    
    restart() {
        this.currentFrame = 0;
        this.finished = false;
        this.x = this.recording.length > 0 ? this.x : 0; // Will be reset by caller
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.wasOnGround = false;
        this.onWallLeft = false;
        this.onWallRight = false;
        this.trailPositions = [];
        this.afterImages = [];
    }
    
    render(ctx, frameCount) {
        if (this.finished && this.afterImages.length === 0) return;
        
        const color = this.color;
        
        // Render afterimages first (behind echo)
        for (const img of this.afterImages) {
            ctx.save();
            ctx.globalAlpha = img.alpha * 0.3;
            ctx.fillStyle = color;
            drawRoundedRect(ctx, img.x, img.y, this.w, this.h, 6);
            ctx.fill();
            ctx.restore();
        }
        
        if (this.finished) return;
        
        // Motion trail — soft glowing line
        if (this.trailPositions.length > 1) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            for (let i = 1; i < this.trailPositions.length; i++) {
                const alpha = (i / this.trailPositions.length) * 0.3;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(this.trailPositions[i-1].x + this.w/2, this.trailPositions[i-1].y + this.h/2);
                ctx.lineTo(this.trailPositions[i].x + this.w/2, this.trailPositions[i].y + this.h/2);
                ctx.stroke();
            }
            ctx.restore();
        }
        
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.scale(this.squashX * this.facing, this.squashY);
        
        const pulse = 0.85 + Math.sin(frameCount * 0.12) * 0.15;
        
        // Outer glow — larger and more prominent
        const outerGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 70);
        outerGlow.addColorStop(0, hexToRgba(color, 0.2 * pulse));
        outerGlow.addColorStop(0.4, hexToRgba(color, 0.08 * pulse));
        outerGlow.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // Antenna — ghostly, swaying
        const antennaSway = Math.sin(frameCount * 0.08 + this.echoIndex) * 1.5;
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = hexToRgba(color, 0.7);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -19);
        ctx.lineTo(antennaSway, -27);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12 * pulse;
        ctx.beginPath();
        ctx.arc(antennaSway, -27, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        // Body — semi-transparent with richer gradient (matches player structure)
        ctx.globalAlpha = 0.55;
        const bodyGrad = ctx.createLinearGradient(-16, -19, 16, 19);
        bodyGrad.addColorStop(0, hexToRgba(color, 0.45));
        bodyGrad.addColorStop(0.55, hexToRgba(color, 0.2));
        bodyGrad.addColorStop(1, hexToRgba(color, 0.1));
        ctx.fillStyle = bodyGrad;
        drawRoundedRect(ctx, -16, -19, 32, 38, 8);
        ctx.fill();
        
        // Top sheen — ghostly gloss
        ctx.globalAlpha = 0.3;
        const sheen = ctx.createLinearGradient(0, -19, 0, -4);
        sheen.addColorStop(0, hexToRgba('#ffffff', 0.15));
        sheen.addColorStop(1, hexToRgba('#ffffff', 0));
        ctx.fillStyle = sheen;
        drawRoundedRect(ctx, -16, -19, 32, 15, 8);
        ctx.fill();
        
        // Neon outline — the ghost's signature look with glow
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -16, -19, 32, 38, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Chest energy core — echo color, pulsing
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = hexToRgba(color, 0.9);
        ctx.shadowColor = color;
        ctx.shadowBlur = 14 * pulse;
        ctx.beginPath();
        ctx.arc(0, 7, 3.2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Visor — glowing eye matching player shape
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = hexToRgba('#ffffff', 0.7);
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        drawRoundedRect(ctx, -10, -14, 20, 8, 4);
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Iris — tracking eye like the player
        const irisX = clampValue((this.vx || 0) * 0.4, -3, 3);
        const irisY = clampValue((this.vy || 0) * 0.15, -1.5, 1.5);
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(irisX, -10 + irisY, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Legs — ghostly, semi-transparent, matching player idle stance
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = hexToRgba(color, 0.25);
        ctx.strokeStyle = hexToRgba(color, 0.5);
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, -6, 14, 5, 6, 2);
        ctx.fill(); ctx.stroke();
        drawRoundedRect(ctx, 2, 14, 5, 6, 2);
        ctx.fill(); ctx.stroke();
        
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Floating particles around echo
        ctx.save();
        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
            const angle = (frameCount * 0.02) + (i * Math.PI * 2 / particleCount) + (this.echoIndex * 1.5);
            const radius = 22 + Math.sin(frameCount * 0.05 + i) * 6;
            const px = this.x + this.w/2 + Math.cos(angle) * radius;
            const py = this.y + this.h/2 + Math.sin(angle) * radius;
            const size = 1.5 + Math.sin(frameCount * 0.08 + i * 2) * 0.5;
            ctx.globalAlpha = 0.4 + Math.sin(frameCount * 0.06 + i) * 0.2;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
