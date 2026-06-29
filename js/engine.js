const InputManager = {
    keys: {},
    justPressed: {},
    justReleased: {},

    init() {
        window.addEventListener('keydown', (e) => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'Escape', 'Enter'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'Escape', 'Enter'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = false;
            this.justReleased[e.code] = true;
        });
    },

    resetFrame() {
        this.justPressed = {};
        this.justReleased = {};
    },

    isDown(code) {
        return !!this.keys[code];
    },

    wasPressed(code) {
        return !!this.justPressed[code];
    },

    wasReleased(code) {
        return !!this.justReleased[code];
    },

    left() { return this.isDown('ArrowLeft') || this.isDown('KeyA'); },
    right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); },
    jump() { return this.wasPressed('ArrowUp') || this.wasPressed('KeyW') || this.wasPressed('Space'); },
    jumpHeld() { return this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('Space'); }
};

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
    }

    follow(targetX, targetY, levelWidth, levelHeight) {
        this.targetX = targetX - CANVAS.WIDTH / 2;
        this.targetY = targetY - CANVAS.HEIGHT / 2;

        const maxX = Math.max(0, levelWidth - CANVAS.WIDTH);
        const maxY = Math.max(0, levelHeight - CANVAS.HEIGHT);

        this.targetX = clamp(this.targetX, 0, maxX);
        this.targetY = clamp(this.targetY, 0, maxY);

        this.x = lerp(this.x, this.targetX, 0.08);
        this.y = lerp(this.y, this.targetY, 0.08);
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update() {
        if (this.shakeDuration > 0) {
            this.shakeX = randRange(-this.shakeIntensity, this.shakeIntensity);
            this.shakeY = randRange(-this.shakeIntensity, this.shakeIntensity);
            this.shakeDuration--;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    applyTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(-Math.round(this.x + this.shakeX), -Math.round(this.y + this.shakeY));
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = STATE.MENU;
        this.currentLevel = 0;
        this.currentRound = 0;
        this.maxRounds = 0;
        this.recordings = [];
        this.player = null;
        this.echoes = [];
        this.level = null;
        this.particles = null;
        this.audio = null;
        this.ui = null;
        this.camera = new Camera();
        this.frameCount = 0;
        this.levelProgress = [];
        this.levelStars = [];
        this.transition = { active: false, alpha: 0, callback: null, phase: 'none' };
        this.bgStars = null;
    }

    init() {
        this.canvas.width = CANVAS.WIDTH;
        this.canvas.height = CANVAS.HEIGHT;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        InputManager.init();
        
        this.particles = new ParticleSystem();
        this.audio = new AudioManager();
        this.ui = new UI(this);

        try {
            const progress = localStorage.getItem('echoArena_progress');
            this.levelProgress = progress ? JSON.parse(progress) : Array(8).fill(false);
            const stars = localStorage.getItem('echoArena_stars');
            this.levelStars = stars ? JSON.parse(stars) : Array(8).fill(0);
        } catch (e) {
            this.levelProgress = Array(8).fill(false);
            this.levelStars = Array(8).fill(0);
        }

        this.state = STATE.MENU;
        // Auto-start level 0 for testing Sprint 2
        this.startLevel(0);
        requestAnimationFrame(this.loop.bind(this));
    }

    resizeCanvas() {
        const scale = Math.min(window.innerWidth / CANVAS.WIDTH, window.innerHeight / CANVAS.HEIGHT) * 0.95;
        this.canvas.style.width = (CANVAS.WIDTH * scale) + 'px';
        this.canvas.style.height = (CANVAS.HEIGHT * scale) + 'px';
    }

    loop(timestamp) {
        requestAnimationFrame(this.loop.bind(this));
        this.frameCount++;
        this.update();
        this.render();
        InputManager.resetFrame();
    }

    update() {
        if (this.transition.active) {
            if (this.transition.phase === 'out') {
                this.transition.alpha += 1 / 20;
                if (this.transition.alpha >= 1) {
                    this.transition.alpha = 1;
                    if (this.transition.callback) this.transition.callback();
                    this.transition.phase = 'in';
                }
            } else if (this.transition.phase === 'in') {
                this.transition.alpha -= 1 / 20;
                if (this.transition.alpha <= 0) {
                    this.transition.alpha = 0;
                    this.transition.active = false;
                }
            }
            return; 
        }

        switch (this.state) {
            case STATE.MENU: this.ui.updateMenu(); break;
            case STATE.LEVEL_SELECT: this.ui.updateLevelSelect(); break;
            case STATE.PLAYING: this.updatePlaying(); break;
            case STATE.ROUND_END: this.ui.updateRoundEnd(); break;
            case STATE.LEVEL_COMPLETE: this.ui.updateLevelComplete(); break;
            case STATE.PAUSED: this.ui.updatePaused(); break;
            case STATE.CONTROLS: this.ui.updateControls(); break;
        }
        this.particles.update();
    }

    updatePlaying() {
        if (!this.level) return; 

        if (this.player) {
            this.player.update(this.level, InputManager);
        }
        
        for (const echo of this.echoes) {
            echo.update(this.level);
        }
        
        const levelStatus = this.level.update(this.player, this.echoes, this.frameCount);
        
        if (this.player) {
            this.camera.follow(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.level.pixelWidth, this.level.pixelHeight);
        }
        this.camera.update();

        if (levelStatus === 'COMPLETE') {
            this.startTransition(() => this.completeLevel());
        }

        if (this.player && this.player.dead) {
            this.camera.shake(4, 10);
            if (this.player.deathTimer <= 0) {
                this.restartRound();
            }
        }

        if (InputManager.wasPressed('Escape')) {
            this.state = STATE.PAUSED;
        }

        if (InputManager.wasPressed('KeyR')) {
            this.endRound();
        }
    }

    render() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT);
        gradient.addColorStop(0, COLORS.BG_DARK);
        gradient.addColorStop(1, COLORS.BG_MID);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

        this.renderBackgroundStars();

        if (this.state === STATE.PLAYING || this.state === STATE.ROUND_END || this.state === STATE.PAUSED) {
            this.camera.applyTransform(this.ctx);
            if (this.level) this.level.render(this.ctx, this.frameCount);
            for (const echo of this.echoes) {
                echo.render(this.ctx, this.frameCount);
            }
            if (this.player) this.player.render(this.ctx, this.frameCount);
            if (this.particles) this.particles.render(this.ctx);

            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ui.renderHUD(this.ctx);
        }

        this.ui.renderOverlays(this.ctx);
        this.renderTransition(this.ctx);
    }
    
    renderBackgroundStars() {
        if (!this.bgStars) {
            this.bgStars = [];
            for (let i = 0; i < 80; i++) {
                this.bgStars.push({
                    x: randRange(0, CANVAS.WIDTH),
                    y: randRange(0, CANVAS.HEIGHT),
                    size: randRange(0.5, 2),
                    twinkleSpeed: randRange(0.01, 0.05),
                    twinkleOffset: randRange(0, Math.PI * 2)
                });
            }
        }
        
        this.ctx.fillStyle = COLORS.TEXT_MUTED;
        for (const star of this.bgStars) {
            const alpha = 0.3 + Math.sin(this.frameCount * star.twinkleSpeed + star.twinkleOffset) * 0.3;
            this.ctx.globalAlpha = Math.max(0, alpha);
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        
        // Debug mode grid overlay for Sprint 1 validation
        this.ctx.strokeStyle = hexToRgba(COLORS.TEXT_MUTED, 0.1);
        this.ctx.lineWidth = 1;
        for(let i=0; i<CANVAS.WIDTH; i+=TILE.SIZE) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, CANVAS.HEIGHT); this.ctx.stroke();
        }
        for(let i=0; i<CANVAS.HEIGHT; i+=TILE.SIZE) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(CANVAS.WIDTH, i); this.ctx.stroke();
        }
        
        // Render keys pressed to screen for debugging Sprint 1
        this.ctx.fillStyle = COLORS.TEXT_PRIMARY;
        this.ctx.font = '16px Inter';
        let pressedKeys = Object.keys(InputManager.keys).filter(k => InputManager.keys[k]);
        this.ctx.fillText("Keys pressed: " + pressedKeys.join(', '), 20, 30);
    }

    startLevel(levelIndex) {
        this.startTransition(() => {
            this.currentLevel = levelIndex;
            this.level = new Level(LEVEL_DATA[levelIndex]);
            this.currentRound = 0;
            this.maxRounds = LEVEL_DATA[levelIndex].maxRounds;
            this.recordings = [];
            this.echoes = [];
            this.player = new Player(this.level.spawnX, this.level.spawnY);
            this.level.reset();
            this.state = STATE.PLAYING;
        });
    }

    endRound() {
        if (this.player) {
            this.recordings.push(this.player.getRecording());
        }
        this.currentRound++;
        if (this.currentRound > this.maxRounds) {
            if (this.player) this.player.dead = true; 
        } else {
            this.echoes = this.recordings.map((rec, i) => new Echo(rec, this.level.spawnX, this.level.spawnY, i));
            this.player = new Player(this.level.spawnX, this.level.spawnY);
            this.level.resetDynamic();
            this.state = STATE.PLAYING;
        }
    }

    restartRound() {
        this.echoes = this.recordings.map((rec, i) => new Echo(rec, this.level.spawnX, this.level.spawnY, i));
        this.player = new Player(this.level.spawnX, this.level.spawnY);
        this.level.resetDynamic();
    }

    completeLevel() {
        this.levelProgress[this.currentLevel] = true;
        const starsEarned = 3; 
        this.levelStars[this.currentLevel] = Math.max(this.levelStars[this.currentLevel], starsEarned);
        this.saveProgress();
        this.state = STATE.LEVEL_COMPLETE;
    }

    startTransition(callback) {
        this.transition = { active: true, alpha: 0, callback, phase: 'out' };
    }

    renderTransition(ctx) {
        if (this.transition.active) {
            ctx.fillStyle = hexToRgba(COLORS.BG_DARK, this.transition.alpha);
            ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
        }
    }

    saveProgress() {
        localStorage.setItem('echoArena_progress', JSON.stringify(this.levelProgress));
        localStorage.setItem('echoArena_stars', JSON.stringify(this.levelStars));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
