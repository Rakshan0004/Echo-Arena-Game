class Level {
    constructor(levelData) {
        // Will be populated in Sprint 4
        this.pixelWidth = 1200; // Default CANVAS.WIDTH
        this.pixelHeight = 680; // Default CANVAS.HEIGHT
        this.spawnX = 100;
        this.spawnY = 100;
    }
    reset() {}
    resetDynamic() {}
    update(player, echoes, frameCount) { return null; }
    render(ctx, frameCount) {}
}
