class Player {
    constructor(spawnX, spawnY) {
        this.x = spawnX;
        this.y = spawnY;
        this.w = 28;
        this.h = 36;
        this.dead = false;
    }
    update(level, input) {}
    render(ctx, frameCount) {}
    getRecording() { return []; }
}
