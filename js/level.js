class Level {
    constructor(levelData) {
        this.pixelWidth = CANVAS.WIDTH;
        this.pixelHeight = CANVAS.HEIGHT;
        this.spawnX = 100;
        this.spawnY = 500;
        // Test level with interesting geometry for Sprint 2/3 testing
        this.tiles = [
            // Floor — broken into segments for visual interest
            { x: 0, y: CANVAS.HEIGHT - 40, w: 480, h: 40, type: T.PLATFORM },
            { x: 520, y: CANVAS.HEIGHT - 40, w: 680, h: 40, type: T.PLATFORM },
            // Left wall
            { x: 0, y: 0, w: 40, h: CANVAS.HEIGHT - 40, type: T.WALL_JUMP_L },
            // Floating platforms (staircase up)
            { x: 200, y: CANVAS.HEIGHT - 160, w: 160, h: 24, type: T.PLATFORM },
            { x: 440, y: CANVAS.HEIGHT - 260, w: 160, h: 24, type: T.PLATFORM },
            { x: 680, y: CANVAS.HEIGHT - 360, w: 160, h: 24, type: T.PLATFORM },
            // High platform
            { x: 920, y: CANVAS.HEIGHT - 440, w: 200, h: 24, type: T.PLATFORM },
            // Right wall jump surface
            { x: CANVAS.WIDTH - 40, y: 100, w: 40, h: CANVAS.HEIGHT - 140, type: T.WALL_JUMP_R },
            // Small pillars for wall jump practice
            { x: 560, y: CANVAS.HEIGHT - 160, w: 24, h: 120, type: T.WALL_JUMP_L },
            { x: 640, y: CANVAS.HEIGHT - 200, w: 24, h: 160, type: T.WALL_JUMP_R },
        ];
    }
    reset() {}
    resetDynamic() {}
    update(player, echoes, frameCount) { return null; }
    
    render(ctx, frameCount) {
        for (const tile of this.tiles) {
            const isWallJump = tile.type === T.WALL_JUMP_L || tile.type === T.WALL_JUMP_R;
            const fillColor = isWallJump ? COLORS.WALL_JUMP : COLORS.PLATFORM;
            const edgeColor = isWallJump ? COLORS.WALL_JUMP_EDGE : COLORS.PLATFORM_EDGE;
            const glowColor = isWallJump ? COLORS.NEON_PURPLE : COLORS.NEON_CYAN;
            
            // Platform body with subtle gradient
            const grad = ctx.createLinearGradient(tile.x, tile.y, tile.x, tile.y + tile.h);
            grad.addColorStop(0, edgeColor);
            grad.addColorStop(0.15, fillColor);
            grad.addColorStop(1, fillColor);
            ctx.fillStyle = grad;
            ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
            
            // Glowing top edge
            ctx.fillStyle = glowColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(tile.x, tile.y, tile.w, 2);
            ctx.shadowBlur = 0;
            
            // Subtle internal grid lines for texture
            ctx.strokeStyle = hexToRgba(glowColor, 0.06);
            ctx.lineWidth = 1;
            for (let gx = tile.x + TILE.SIZE; gx < tile.x + tile.w; gx += TILE.SIZE) {
                ctx.beginPath();
                ctx.moveTo(gx, tile.y + 4);
                ctx.lineTo(gx, tile.y + tile.h);
                ctx.stroke();
            }
            for (let gy = tile.y + TILE.SIZE; gy < tile.y + tile.h; gy += TILE.SIZE) {
                ctx.beginPath();
                ctx.moveTo(tile.x, gy);
                ctx.lineTo(tile.x + tile.w, gy);
                ctx.stroke();
            }
            
            // Neon border outline
            ctx.strokeStyle = hexToRgba(glowColor, 0.25);
            ctx.lineWidth = 1;
            ctx.strokeRect(tile.x + 0.5, tile.y + 0.5, tile.w - 1, tile.h - 1);
        }
    }
    
    getCollisions(entity) {
        return this.tiles;
    }
}
