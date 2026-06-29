class UI {
    constructor(game) {
        this.game = game;
    }
    updateMenu() {}
    updateLevelSelect() {}
    updateRoundEnd() {}
    updateLevelComplete() {}
    updatePaused() {}
    updateControls() {}
    
    renderHUD(ctx) {
        if (!this.game || this.game.state !== STATE.PLAYING) return;
        
        ctx.save();
        
        // Round counter — top center
        ctx.fillStyle = COLORS.NEON_CYAN;
        ctx.font = '20px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = COLORS.NEON_CYAN;
        ctx.shadowBlur = 10;
        ctx.fillText('ROUND ' + this.game.currentRound + ' / ' + this.game.maxRounds, CANVAS.WIDTH / 2, 35);
        ctx.shadowBlur = 0;
        
        // Echo count — top right
        ctx.fillStyle = COLORS.NEON_PURPLE;
        ctx.font = '16px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.shadowColor = COLORS.NEON_PURPLE;
        ctx.shadowBlur = 8;
        const echoCount = this.game.echoes.length;
        ctx.fillText('ECHOES: ' + echoCount, CANVAS.WIDTH - 20, 35);
        ctx.shadowBlur = 0;
        
        // Controls hint — bottom center (fades out)
        const hintAlpha = Math.max(0, 1 - (this.game.frameCount - 60) / 180);
        if (hintAlpha > 0) {
            ctx.globalAlpha = hintAlpha;
            ctx.fillStyle = COLORS.TEXT_SECONDARY;
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('WASD / Arrows to Move  •  Space to Jump  •  R to End Round', CANVAS.WIDTH / 2, CANVAS.HEIGHT - 20);
            ctx.globalAlpha = 1;
        }
        
        // "R — End Round" prompt — bottom right, pulsing
        const pulseAlpha = 0.4 + Math.sin(this.game.frameCount * 0.05) * 0.2;
        ctx.globalAlpha = pulseAlpha;
        ctx.fillStyle = COLORS.NEON_GREEN;
        ctx.font = '12px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('R — END ROUND', CANVAS.WIDTH - 20, CANVAS.HEIGHT - 20);
        ctx.globalAlpha = 1;
        
        // Level title & hint (fades out)
        if (this.game.level) {
            const titleAlpha = Math.max(0, 1 - (this.game.frameCount - 120) / 120);
            if (titleAlpha > 0) {
                ctx.globalAlpha = titleAlpha;
                ctx.textAlign = 'center';
                
                // Level Name
                ctx.fillStyle = COLORS.NEON_PURPLE;
                ctx.font = 'bold 36px Orbitron, sans-serif';
                ctx.shadowColor = COLORS.NEON_PURPLE;
                ctx.shadowBlur = 15;
                ctx.fillText(`LEVEL ${this.game.currentLevel + 1}: ${this.game.level.name}`, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 3);
                
                // Subtitle
                ctx.fillStyle = COLORS.TEXT_PRIMARY;
                ctx.font = '18px Inter, sans-serif';
                ctx.shadowBlur = 0;
                ctx.fillText(this.game.levelData ? this.game.levelData.subtitle : '', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 3 + 30);
                
                // Hint
                if (this.game.levelData && this.game.levelData.hint) {
                    ctx.fillStyle = COLORS.NEON_CYAN;
                    ctx.font = '16px Inter, sans-serif';
                    ctx.fillText(this.game.levelData.hint, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 3 + 80);
                }
                ctx.globalAlpha = 1;
            }
        }
        
        ctx.restore();
    }
    
    renderOverlays(ctx) {}
}
