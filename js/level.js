class Level {
    constructor(levelData) {
        this.pixelWidth = CANVAS.WIDTH;
        this.pixelHeight = CANVAS.HEIGHT;
        this.spawnX = 100;
        this.spawnY = 100;
        // Basic test level for Sprint 2 to test physics and wall jumping
        this.tiles = [
            // Floor
            { x: 0, y: CANVAS.HEIGHT - 40, w: CANVAS.WIDTH, h: 40, type: T.PLATFORM }, 
            // Left Wall
            { x: 0, y: 0, w: 40, h: CANVAS.HEIGHT, type: T.PLATFORM },
            // Floating platform
            { x: 300, y: CANVAS.HEIGHT - 200, w: 200, h: 40, type: T.PLATFORM },
            // Right Wall to jump on
            { x: CANVAS.WIDTH - 80, y: CANVAS.HEIGHT - 400, w: 40, h: 400, type: T.PLATFORM } 
        ];
    }
    reset() {}
    resetDynamic() {}
    update(player, echoes, frameCount) { return null; }
    render(ctx, frameCount) {
        for (const tile of this.tiles) {
            ctx.fillStyle = tile.type === T.PLATFORM ? COLORS.PLATFORM : COLORS.WALL_JUMP;
            ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
            
            // Draw a lighter top edge for platforms
            if (tile.type === T.PLATFORM) {
                ctx.fillStyle = COLORS.PLATFORM_EDGE;
                ctx.fillRect(tile.x, tile.y, tile.w, 4);
            }
        }
    }
    getCollisions(entity) {
        // Return dummy tiles for physics collision
        return this.tiles;
    }
}
