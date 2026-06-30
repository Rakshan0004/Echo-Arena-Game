/**
 * player.js — Active Player Model
 * 
 * Defines the Player class, representing the user-controlled character:
 *  - Player — keeps track of animations, inputs recording array, trails, squashing/stretching scales.
 *  - update() — appends inputs to a round recording, updates trail positions, checks map-bounds death,
 *    and runs simulatePhysics() for active movement.
 *  - render() — draws the upgraded main player character model with:
 *    - Gentle hover oscillation
 *    - Glowing cyan trail positions
 *    - 3D-feeling outer ambient pink glow
 *    - Swaying wire antenna + glowing cyan light tip
 *    - Rounded body gradient + top gloss sheen
 *    - Pulsing cyan chest core
 *    - Visor containing a reactive tracking iris (follows horizontal/vertical velocity)
 *    - Smooth running animation legs
 *    - Shard burst rings on death
 */
class Player {
    constructor(spawnX, spawnY) {
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
        this.trailPositions.push({ x: this.x, y: this.y });
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
            game.audio.play('death');
            game.particles.emit('death', this.x + this.w / 2, this.y + this.h / 2);
        }
        if (typeof game !== 'undefined' && game.camera) {
            game.camera.shake(5, 12);
        }
    }

    emitJumpParticles() {
        if (typeof game !== 'undefined' && game.particles && game.audio) {
            game.audio.play('jump');
            game.particles.emit('jump', this.x + this.w / 2, this.y + this.h);
        }
    }

    emitWallJumpParticles() {
        if (typeof game !== 'undefined' && game.particles && game.audio) {
            game.audio.play('wallJump');
            game.particles.emit('wallJump', this.x + this.w / 2, this.y + this.h / 2, { facing: this.facing });
        }
    }

    emitLandParticles() {
        if (typeof game !== 'undefined' && game.particles && game.audio && this.vy > 5) {
            game.audio.play('land');
            game.particles.emit('land', this.x + this.w / 2, this.y + this.h);
        }
    }

    getRecording() {
        return [...this.recording];
    }

    render(ctx, frameCount) {
        if (this.dead && this.deathTimer > 0) {
            // Death burst: shrinking core + expanding ring shards
            ctx.save();
            const t = this.deathTimer / 60;
            ctx.globalAlpha = t;
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

            const ringRadius = (1 - t) * 40;
            ctx.strokeStyle = COLORS.NEON_CYAN;
            ctx.shadowColor = COLORS.NEON_CYAN;
            ctx.shadowBlur = 18;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = COLORS.NEON_CYAN;
            ctx.shadowBlur = 25;
            drawRoundedRect(ctx, -8 * t, -9 * t, 16 * t, 18 * t, 6);
            ctx.fill();
            ctx.restore();
            return;
        } else if (this.dead) {
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.scale(this.squashX * this.facing, this.squashY);

        const pulse = 0.85 + Math.sin(frameCount * 0.12) * 0.15;

        // Motion trail — glowing cyan shapes that fade
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (i / this.trailPositions.length) * 0.22;
            ctx.fillStyle = hexToRgba(COLORS.NEON_CYAN, alpha);
            const sizeMod = 0.3 + (i / this.trailPositions.length) * 0.7;
            const relX = pos.x - this.x;
            const relY = pos.y - this.y;
            drawRoundedRect(ctx, relX - (this.w * sizeMod) / 2, relY - (this.h * sizeMod) / 2, this.w * sizeMod, this.h * sizeMod, 4);
            ctx.fill();
        }


        // Small antenna with glowing tip — adds silhouette interest
        const antennaSway = Math.sin(frameCount * 0.08) * 1.5;
        ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -19);
        ctx.lineTo(antennaSway, -27);
        ctx.stroke();
        ctx.fillStyle = COLORS.NEON_CYAN;
        ctx.shadowColor = COLORS.NEON_CYAN;
        ctx.shadowBlur = 12 * pulse;
        ctx.beginPath();
        ctx.arc(antennaSway, -27, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Body: rounded rectangle with richer diagonal gradient
        const bodyGrad = ctx.createLinearGradient(-16, -19, 16, 19);
        bodyGrad.addColorStop(0, '#5a0040');
        bodyGrad.addColorStop(0.55, '#2a0019');
        bodyGrad.addColorStop(1, '#12000d');
        ctx.fillStyle = bodyGrad;
        drawRoundedRect(ctx, -16, -19, 32, 38, 8);
        ctx.fill();

        // Subtle top sheen for a glossy, less-flat look
        const sheen = ctx.createLinearGradient(0, -19, 0, -4);
        sheen.addColorStop(0, hexToRgba('#ffffff', 0.12));
        sheen.addColorStop(1, hexToRgba('#ffffff', 0));
        ctx.fillStyle = sheen;
        drawRoundedRect(ctx, -16, -19, 32, 15, 8);
        ctx.fill();

        // Neon magenta outline with glow
        ctx.strokeStyle = COLORS.NEON_MAGENTA;
        ctx.shadowColor = COLORS.NEON_MAGENTA;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2.5;
        drawRoundedRect(ctx, -16, -19, 32, 38, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Chest energy core — pulses, gives life to idle pose
        ctx.fillStyle = hexToRgba(COLORS.NEON_CYAN, 0.9);
        ctx.shadowColor = COLORS.NEON_CYAN;
        ctx.shadowBlur = 14 * pulse;
        ctx.beginPath();
        ctx.arc(0, 7, 3.2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Visor — bright glowing eye with a tracking iris for personality
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = COLORS.NEON_MAGENTA;
        ctx.shadowBlur = 20;
        drawRoundedRect(ctx, -10, -14, 20, 8, 4);
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Iris follows facing/vertical motion subtly
        const irisX = clampValue(this.vx * 0.4, -3, 3);
        const irisY = clampValue(this.vy * 0.15, -1.5, 1.5);
        ctx.fillStyle = COLORS.NEON_MAGENTA;
        ctx.shadowColor = COLORS.NEON_MAGENTA;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(irisX, -10 + irisY, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Legs — cleaner shape, smoother run cycle
        ctx.fillStyle = '#1a0011';
        ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, 0.6);
        ctx.lineWidth = 1.5;
        if (this.animState === 'run') {
            const legOffset = Math.sin(frameCount * 0.3) * 4;
            drawRoundedRect(ctx, -6, 14 + legOffset, 5, 6, 2);
            ctx.fill(); ctx.stroke();
            drawRoundedRect(ctx, 2, 14 - legOffset, 5, 6, 2);
            ctx.fill(); ctx.stroke();
        } else if (this.animState === 'wallSlide') {
            drawRoundedRect(ctx, -6, 13, 5, 7, 2);
            ctx.fill(); ctx.stroke();
            drawRoundedRect(ctx, 2, 15, 5, 7, 2);
            ctx.fill(); ctx.stroke();
        } else if (this.animState === 'jump' || this.animState === 'fall') {
            // Tucked legs while airborne reads more dynamic than static stance
            drawRoundedRect(ctx, -7, 13, 6, 5, 2);
            ctx.fill(); ctx.stroke();
            drawRoundedRect(ctx, 1, 13, 6, 5, 2);
            ctx.fill(); ctx.stroke();
        } else {
            drawRoundedRect(ctx, -6, 14, 5, 6, 2);
            ctx.fill(); ctx.stroke();
            drawRoundedRect(ctx, 2, 14, 5, 6, 2);
            ctx.fill(); ctx.stroke();
        }

        ctx.restore();
    }
}

function clampValue(v, min, max) {
    return Math.max(min, Math.min(max, v));
}