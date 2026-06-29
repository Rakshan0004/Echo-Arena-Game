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
        this.w = 28;
        this.h = 36;
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
        
        // Outer glow — larger and more prominent
        const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 55);
        outerGlow.addColorStop(0, hexToRgba(color, 0.15));
        outerGlow.addColorStop(0.5, hexToRgba(color, 0.05));
        outerGlow.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 55, 0, Math.PI * 2);
        ctx.fill();
        
        // Body — semi-transparent with glow
        ctx.globalAlpha = 0.6;
        const bodyGrad = ctx.createLinearGradient(0, -18, 0, 18);
        bodyGrad.addColorStop(0, hexToRgba(color, 0.4));
        bodyGrad.addColorStop(1, hexToRgba(color, 0.15));
        ctx.fillStyle = bodyGrad;
        drawRoundedRect(ctx, -14, -18, 28, 36, 6);
        ctx.fill();
        
        // Neon outline — the ghost's signature look
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -14, -18, 28, 36, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Visor — echo color
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        drawRoundedRect(ctx, -9, -13, 18, 6, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Echo number indicator — small text
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('#' + (this.echoIndex + 1), 0, 8);
        ctx.textAlign = 'start';
        
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
