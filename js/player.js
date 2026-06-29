class Player {
    constructor(spawnX, spawnY) {
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
        this.dead = false;
        this.deathTimer = 0;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.animState = 'idle';
        this.animFrame = 0;
        this.squashX = 1;
        this.squashY = 1;
        this.recording = [];
        this.isRecording = true;
        this.trailPositions = [];
    }
    
    update(level, inputManager) {
        if (this.dead) {
            if (this.deathTimer > 0) this.deathTimer--;
            return;
        }
        
        const inputSnapshot = {
            left: inputManager.left(),
            right: inputManager.right(),
            jump: inputManager.jump(),
            jumpHeld: inputManager.jumpHeld()
        };
        
        if (this.isRecording) {
            this.recording.push(inputSnapshot);
        }
        
        // Pass entity, input, level to shared physics
        simulatePhysics(this, inputSnapshot, level);
        
        // Update animation state
        if (this.dead) {
            this.animState = 'dead';
        } else if ((this.onWallLeft || this.onWallRight) && !this.onGround) {
            this.animState = 'wallSlide';
        } else if (this.vy < 0) {
            this.animState = 'jump';
        } else if (!this.onGround) {
            this.animState = 'fall';
        } else if (Math.abs(this.vx) > 0.5) {
            this.animState = 'run';
        } else {
            this.animState = 'idle';
        }
        
        this.animFrame++;
        
        // Trail
        this.trailPositions.push({x: this.x, y: this.y});
        if (this.trailPositions.length > 8) {
            this.trailPositions.shift();
        }
        
        // Death check (basic for Sprint 2)
        if (this.y > CANVAS.HEIGHT * 2) {
            this.die(); // Fall off bottom of world
        }
    }
    
    die() {
        if (this.dead) return;
        this.dead = true;
        this.deathTimer = 60;
        if (typeof game !== 'undefined' && game.audio) {
            // game.audio.play('death');
        }
        if (typeof game !== 'undefined' && game.camera) {
            game.camera.shake(5, 12);
        }
        // Emit particles
        if (typeof game !== 'undefined' && game.particles) {
            // game.particles.emitDeath(...)
        }
    }
    
    emitJumpParticles() {
        // Will hook up in Sprint 6
    }
    
    emitWallJumpParticles() {
        // Will hook up in Sprint 6
    }
    
    emitLandParticles() {
        // Will hook up in Sprint 6
    }
    
    getRecording() {
        return [...this.recording];
    }
    
    render(ctx, frameCount) {
        if (this.dead && this.deathTimer > 0) {
            ctx.save();
            ctx.globalAlpha = this.deathTimer / 60;
            ctx.fillStyle = COLORS.NEON_CYAN;
            ctx.shadowColor = COLORS.NEON_CYAN;
            ctx.shadowBlur = 20;
            drawRoundedRect(ctx, this.x, this.y, this.w, this.h, 6);
            ctx.fill();
            ctx.restore();
            return;
        } else if (this.dead) {
            return;
        }
        
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.scale(this.squashX * this.facing, this.squashY);
        
        // Motion trail — glowing cyan shapes that fade
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (i / this.trailPositions.length) * 0.2;
            ctx.fillStyle = hexToRgba(COLORS.NEON_CYAN, alpha);
            const sizeMod = 0.3 + (i / this.trailPositions.length) * 0.7;
            const relX = pos.x - this.x;
            const relY = pos.y - this.y;
            drawRoundedRect(ctx, relX - (this.w * sizeMod)/2, relY - (this.h * sizeMod)/2, this.w * sizeMod, this.h * sizeMod, 4);
            ctx.fill();
        }
        
        // Outer glow — strong ambient light
        const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 60);
        gradient.addColorStop(0, hexToRgba(COLORS.NEON_CYAN, 0.15));
        gradient.addColorStop(0.4, hexToRgba(COLORS.NEON_CYAN, 0.06));
        gradient.addColorStop(1, hexToRgba(COLORS.NEON_CYAN, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // Body: rounded rectangle with gradient + neon border
        const bodyGrad = ctx.createLinearGradient(0, -18, 0, 18);
        bodyGrad.addColorStop(0, '#1e2a54');
        bodyGrad.addColorStop(1, '#0d1230');
        ctx.fillStyle = bodyGrad;
        drawRoundedRect(ctx, -14, -18, 28, 36, 6);
        ctx.fill();
        
        // Neon cyan outline with glow
        ctx.strokeStyle = COLORS.NEON_CYAN;
        ctx.shadowColor = COLORS.NEON_CYAN;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -14, -18, 28, 36, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Visor — bright glowing eye
        ctx.fillStyle = COLORS.NEON_CYAN;
        ctx.shadowColor = COLORS.NEON_CYAN;
        ctx.shadowBlur = 18;
        drawRoundedRect(ctx, -9, -13, 18, 6, 3);
        ctx.fill();
        // Second pass for extra brightness
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Legs
        ctx.fillStyle = '#1a2547';
        ctx.strokeStyle = hexToRgba(COLORS.NEON_CYAN, 0.5);
        ctx.lineWidth = 1;
        if (this.animState === 'run') {
            const legOffset = Math.sin(frameCount * 0.3) * 4;
            ctx.fillRect(-6, 14 + legOffset, 5, 6);
            ctx.strokeRect(-6, 14 + legOffset, 5, 6);
            ctx.fillRect(2, 14 - legOffset, 5, 6);
            ctx.strokeRect(2, 14 - legOffset, 5, 6);
        } else if (this.animState === 'wallSlide') {
            ctx.fillRect(-6, 13, 5, 7);
            ctx.strokeRect(-6, 13, 5, 7);
            ctx.fillRect(2, 15, 5, 7);
            ctx.strokeRect(2, 15, 5, 7);
        } else {
            ctx.fillRect(-6, 14, 5, 6);
            ctx.strokeRect(-6, 14, 5, 6);
            ctx.fillRect(2, 14, 5, 6);
            ctx.strokeRect(2, 14, 5, 6);
        }
        
        ctx.restore();
    }
}
