/**
 * ui.js — HTML UI Overlay & Canvas HUD Controller
 * 
 * Manages screen overlay transitions, button binding, and canvas overlay displays:
 *  - UI — maps HTML screens (menu, levelselect, roundend, levelcomplete, pause, controls)
 *    and updates displays depending on state.
 *  - buildLevelGrid() — builds level cards with 3-star icons based on save progression.
 *  - renderHUD() — draws in-game HUD indicators (Level Name, active round count,
 *    remaining echoes, hints, and active prompts).
 *  - Event bindings — handles buttons for menu, level select, controls, sound toggle.
 *  - Menu Parallax — tracks mousemove events to apply a 3D tilt perspective transform.
 */
class UI {
    constructor(game) {
        this.game = game;
        
        // HTML Overlays
        this.menuScreen = document.getElementById('menu-screen');
        this.levelSelectScreen = document.getElementById('levelselect-screen');
        this.roundEndScreen = document.getElementById('roundend-screen');
        this.levelCompleteScreen = document.getElementById('levelcomplete-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.controlsScreen = document.getElementById('controls-screen');
        this.levelGrid = document.getElementById('level-grid');
        
        this.lastState = null;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Main Menu
        document.getElementById('btn-play').addEventListener('click', () => {
            if (this.game.audio) this.game.audio.resume();
            this.game.state = STATE.LEVEL_SELECT;
        });
        document.getElementById('btn-controls').addEventListener('click', () => {
            this.game.state = STATE.CONTROLS;
        });
        document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
            this.toggleSound();
        });
        
        // Level Select
        document.getElementById('btn-back-menu').addEventListener('click', () => {
            this.game.state = STATE.MENU;
        });
        
        // Round End
        document.getElementById('btn-next-round').addEventListener('click', () => {
            this.game.restartRound();
            this.game.state = STATE.PLAYING;
        });
        document.getElementById('btn-retry-round').addEventListener('click', () => {
            // Drop the last recording
            if (this.game.recordings.length > 0) this.game.recordings.pop();
            this.game.currentRound = Math.max(0, this.game.currentRound - 1);
            this.game.restartRound();
            this.game.state = STATE.PLAYING;
        });
        
        // Level Complete
        document.getElementById('btn-next-level').addEventListener('click', () => {
            let nextLevel = this.game.currentLevel + 1;
            if (nextLevel < LEVEL_DATA.length) {
                this.game.startLevel(nextLevel);
            } else {
                this.game.state = STATE.MENU;
            }
        });
        document.getElementById('btn-level-select').addEventListener('click', () => {
            this.game.state = STATE.LEVEL_SELECT;
        });
        
        // Pause Menu
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.game.state = STATE.PLAYING;
        });
        document.getElementById('btn-restart-level').addEventListener('click', () => {
            this.game.startLevel(this.game.currentLevel);
        });
        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            this.game.state = STATE.LEVEL_SELECT;
        });
        document.getElementById('btn-pause-sound').addEventListener('click', (e) => {
            this.toggleSound();
        });
        
        // Controls
        document.getElementById('btn-got-it').addEventListener('click', () => {
            this.game.state = STATE.MENU;
        });
        
        // Add hover sounds to all buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                // if (this.game.audio) this.game.audio.play('menuHover');
            });
            btn.addEventListener('click', () => {
                if (this.game.audio) this.game.audio.play('switchPress');
            });
        });
        
        // Interactive Menu Parallax
        document.addEventListener('mousemove', (e) => {
            if (this.game.state === STATE.MENU) {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                this.menuScreen.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            } else {
                this.menuScreen.style.transform = 'none';
            }
        });
    }
    
    toggleSound() {
        if (this.game.audio) {
            this.game.audio.enabled = !this.game.audio.enabled;
            if (this.game.audio.enabled) {
                this.game.audio.masterGain.gain.value = 0.3;
                // Try to resume if it was suspended (user clicking sound before play)
                if (this.game.audio.ctx.state === 'suspended') this.game.audio.ctx.resume();
            } else {
                this.game.audio.masterGain.gain.value = 0;
            }
            const text = `♫ SOUND: ${this.game.audio.enabled ? 'ON' : 'OFF'}`;
            document.getElementById('btn-sound-toggle').innerText = text;
            document.getElementById('btn-pause-sound').innerText = text;
        }
    }
    
    hideAllScreens() {
        this.menuScreen.style.display = 'none';
        this.levelSelectScreen.style.display = 'none';
        this.roundEndScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.pauseScreen.style.display = 'none';
        this.controlsScreen.style.display = 'none';
    }
    
    update() {
        this.hideAllScreens();
        
        switch (this.game.state) {
            case STATE.MENU:
                this.menuScreen.style.display = 'flex';
                break;
            case STATE.LEVEL_SELECT:
                if (this.lastState !== STATE.LEVEL_SELECT) {
                    this.buildLevelGrid();
                }
                this.levelSelectScreen.style.display = 'flex';
                break;
            case STATE.ROUND_END:
                document.getElementById('echo-subtitle').innerText = `Echo #${this.game.currentRound} created. They will repeat your moves!`;
                this.roundEndScreen.style.display = 'flex';
                break;
            case STATE.LEVEL_COMPLETE:
                document.getElementById('stats-rounds').innerText = `Rounds Used: ${this.game.currentRound + 1} (Par: ${this.game.levelData.parRounds})`;
                
                const collectedStars = this.game.level.stars.filter(s => s.collected).length;
                const totalStars = this.game.level.stars.length;
                
                if (totalStars > 0) {
                    document.getElementById('stats-stars').innerText = `Stars Collected: ${collectedStars}/${totalStars}`;
                } else {
                    document.getElementById('stats-stars').innerText = `Stars Collected: None in level`;
                }
                
                let baseStars = (this.game.currentRound + 1 <= this.game.levelData.parRounds) ? 2 : 1;
                let bonusStar = (totalStars > 0 && collectedStars === totalStars) ? 1 : 0;
                // If the level has no collectible stars, you just get the 3rd star for beating the par
                if (totalStars === 0 && this.game.currentRound + 1 <= this.game.levelData.parRounds) bonusStar = 1;
                
                const starsEarned = baseStars + bonusStar;
                                  
                document.getElementById('star-1').className = starsEarned >= 1 ? 'star earned' : 'star empty';
                document.getElementById('star-2').className = starsEarned >= 2 ? 'star earned' : 'star empty';
                document.getElementById('star-3').className = starsEarned >= 3 ? 'star earned' : 'star empty';
                
                this.levelCompleteScreen.style.display = 'flex';
                break;
            case STATE.PAUSED:
                this.pauseScreen.style.display = 'flex';
                break;
            case STATE.CONTROLS:
                this.controlsScreen.style.display = 'flex';
                break;
        }
        
        this.lastState = this.game.state;
    }
    
    buildLevelGrid() {
        this.levelGrid.innerHTML = '';
        for (let i = 0; i < LEVEL_DATA.length; i++) {
            const level = LEVEL_DATA[i];
            const unlocked = i === 0 || this.game.levelProgress[i - 1];
            const completed = this.game.levelProgress[i];
            const stars = this.game.levelStars[i] || 0;
            
            const card = document.createElement('div');
            card.className = `level-card ${unlocked ? '' : 'locked'} ${completed ? 'completed' : ''}`;
            
            let starHtml = '';
            for (let s = 1; s <= 3; s++) {
                starHtml += `<span class="star ${s <= stars ? 'earned' : 'empty'}">&#9733;</span>`;
            }
            
            card.innerHTML = `
                <div style="font-family: 'Orbitron', sans-serif; font-size: 28px; color: #00f5ff; margin-bottom: 5px;">${i + 1}</div>
                <div style="font-family: 'Inter', sans-serif; font-size: 14px; color: #94a3b8; margin-bottom: 10px;">${level.name}</div>
                <div>${starHtml}</div>
                ${!unlocked ? '<div style="position: absolute; top: 10px; right: 10px; color: #475569;">&#128274;</div>' : ''}
            `;
            
            if (unlocked) {
                card.addEventListener('click', () => {
                    if (this.game.audio) this.game.audio.play('switchPress');
                    this.game.startLevel(i);
                });
            }
            
            this.levelGrid.appendChild(card);
        }
    }
    
    renderHUD(ctx) {
        if (!this.game.level) return;
        
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for HUD
        
        // Top Left - Level Name
        ctx.fillStyle = COLORS.TEXT_SECONDARY;
        ctx.font = '16px Orbitron, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LEVEL ${this.game.currentLevel + 1}: ${this.game.level.name}`, 20, 30);
        
        // Top Center - Round count
        ctx.fillStyle = COLORS.NEON_CYAN;
        ctx.font = '24px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = COLORS.NEON_CYAN;
        ctx.shadowBlur = 10;
        ctx.fillText(`ROUND ${this.game.currentRound + 1} / ${this.game.maxRounds}`, CANVAS.WIDTH / 2, 35);
        ctx.shadowBlur = 0;
        
        // Top Right - Echoes available
        ctx.fillStyle = COLORS.TEXT_SECONDARY;
        ctx.font = '16px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`ECHOES: ${this.game.echoes.length}`, CANVAS.WIDTH - 20, 30);
        
        // Bottom Right - Place Ghost prompt
        const pulseAlpha = 0.4 + Math.sin(this.game.frameCount * 0.05) * 0.2;
        ctx.globalAlpha = pulseAlpha;
        ctx.fillStyle = COLORS.NEON_GREEN;
        ctx.font = '12px Orbitron, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('G — PLACE GHOST', CANVAS.WIDTH - 20, CANVAS.HEIGHT - 20);
        ctx.globalAlpha = 1;
        
        // Level hint fade out
        const titleAlpha = Math.max(0, 1 - (this.game.frameCount - 120) / 120);
        if (titleAlpha > 0 && this.game.levelData && this.game.levelData.hint) {
            ctx.globalAlpha = titleAlpha;
            ctx.textAlign = 'center';
            ctx.fillStyle = COLORS.NEON_CYAN;
            ctx.font = '18px Inter, sans-serif';
            ctx.shadowColor = COLORS.NEON_CYAN;
            ctx.shadowBlur = 10;
            ctx.fillText(this.game.levelData.hint, CANVAS.WIDTH / 2, CANVAS.HEIGHT - 100);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
    }
    
    renderOverlays(ctx) {
        // Obsolete: HTML overlays handle this now.
    }
}
