/**
 * level.js — Level Engine & Parser
 * 
 * Parses 2D numerical grids from levels.js into fully interactive maps:
 *  - Level — tracks grid state, active entities (stars, switches, doors, lasers).
 *  - update() — checks collisions between players/echoes and triggers:
 *    - Switches (A-D) which toggle corresponding Doors (A-D).
 *    - Star collection (updates score/star count).
 *    - Laser death checks (raycasts lasers downwards or rightwards, checks overlapping rectangles).
 *    - Portal level completion.
 *  - render() — draws platforms, wall-jump surfaces, animated spikes, active doors,
 *    pressed/unpressed switches, pulsing stars, locked/unlocked portal mechanics, and firing lasers.
 */
class Level {
    constructor(levelData) {
        this.name = levelData.name;
        this.grid = levelData.grid;
        this.rows = this.grid.length;
        this.cols = this.grid[0].length;
        this.pixelWidth = this.cols * TILE.SIZE;
        this.pixelHeight = this.rows * TILE.SIZE;
        this.maxRounds = levelData.maxRounds;
        this.parRounds = levelData.parRounds;
        
        this.spawnX = 0;
        this.spawnY = 0;
        this.portalX = 0;
        this.portalY = 0;
        
        this.switches = {}; // {'A': {x, y, pressed}, ...}
        this.doors = {};    // {'A': [{x, y, open}], ...}
        this.lasers = [];   // [{srcX, srcY, direction, blocked, length}]
        this.stars = [];    // [{x, y, collected}]
        this.spikes = [];   // [{x, y}]
        this.movingPlatforms = [];
        this.checkpoints = [];
        
        // Parse grid
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.grid[r][c];
                const wx = c * TILE.SIZE;
                const wy = r * TILE.SIZE;
                
                switch(t) {
                    case T.SPAWN: this.spawnX = wx; this.spawnY = wy; break;
                    case T.PORTAL: this.portalX = wx; this.portalY = wy; break;
                    case T.SWITCH_A: this.switches['A'] = { x: wx, y: wy, pressed: false }; break;
                    case T.SWITCH_B: this.switches['B'] = { x: wx, y: wy, pressed: false }; break;
                    case T.SWITCH_C: this.switches['C'] = { x: wx, y: wy, pressed: false }; break;
                    case T.SWITCH_D: this.switches['D'] = { x: wx, y: wy, pressed: false }; break;
                    case T.DOOR_A: this.doors['A'] = this.doors['A'] || []; this.doors['A'].push({ x: wx, y: wy, open: false }); break;
                    case T.DOOR_B: this.doors['B'] = this.doors['B'] || []; this.doors['B'].push({ x: wx, y: wy, open: false }); break;
                    case T.DOOR_C: this.doors['C'] = this.doors['C'] || []; this.doors['C'].push({ x: wx, y: wy, open: false }); break;
                    case T.DOOR_D: this.doors['D'] = this.doors['D'] || []; this.doors['D'].push({ x: wx, y: wy, open: false }); break;
                    case T.LASER_SRC: this.lasers.push({ srcX: wx, srcY: wy, direction: 'right', blocked: false, length: 0 }); break;
                    case T.LASER_SRC_V: this.lasers.push({ srcX: wx, srcY: wy, direction: 'down', blocked: false, length: 0 }); break;
                    case T.STAR: this.stars.push({ x: wx, y: wy, collected: false }); break;
                    case T.SPIKE: this.spikes.push({ x: wx, y: wy }); break;
                    case T.CHECKPOINT: this.checkpoints.push({ x: wx, y: wy }); break;
                }
            }
        }
        
        if (levelData.movingPlatforms) {
            this.movingPlatforms = JSON.parse(JSON.stringify(levelData.movingPlatforms));
        }
    }
    
    reset() {
        this.stars.forEach(s => s.collected = false);
        this.resetDynamic();
    }
    
    resetDynamic() {
        Object.values(this.switches).forEach(s => s.pressed = false);
        Object.values(this.doors).forEach(dArray => dArray.forEach(d => d.open = false));
    }
    
    isSolid(c, r) {
        if (r >= this.rows) return false; // The bottom is a bottomless pit!
        if (c < 0 || c >= this.cols || r < 0) return true; // Sides and top are solid bounds
        const t = this.grid[r][c];
        if (t === T.PLATFORM || t === T.WALL_JUMP_L || t === T.WALL_JUMP_R) return true;
        // Doors are solid if closed
        if (t === T.DOOR_A || t === T.DOOR_B || t === T.DOOR_C || t === T.DOOR_D) {
            let key = '';
            if (t === T.DOOR_A) key = 'A';
            if (t === T.DOOR_B) key = 'B';
            if (t === T.DOOR_C) key = 'C';
            if (t === T.DOOR_D) key = 'D';
            const doorObj = this.doors[key].find(d => d.x === c*TILE.SIZE && d.y === r*TILE.SIZE);
            return doorObj ? !doorObj.open : true;
        }
        return false;
    }
    
    getCollisions(entity) {
        let colls = [];
        
        const minC = Math.floor(entity.x / TILE.SIZE);
        const maxC = Math.floor((entity.x + entity.w) / TILE.SIZE);
        const minR = Math.floor(entity.y / TILE.SIZE);
        const maxR = Math.floor((entity.y + entity.h) / TILE.SIZE);
        
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                if (this.isSolid(c, r)) {
                    let type = c >= 0 && c < this.cols && r >= 0 && r < this.rows ? this.grid[r][c] : T.PLATFORM;
                    colls.push({
                        x: c * TILE.SIZE,
                        y: r * TILE.SIZE,
                        w: TILE.SIZE,
                        h: TILE.SIZE,
                        type: type
                    });
                }
            }
        }
        
        // Moving platforms
        for (const mp of this.movingPlatforms) {
            colls.push({
                x: mp.x, y: mp.y, w: mp.w, h: mp.h, type: T.PLATFORM
            });
        }
        
        return colls;
    }
    
    update(player, echoes, frameCount) {
        if (!player) return null;
        
        const entities = [player, ...echoes.filter(e => !e.finished || e.afterImages.length > 0)];
        const activeEntities = [player, ...echoes.filter(e => !e.finished)]; // Only moving entities for switches

        // 1. Moving Platforms
        for (const mp of this.movingPlatforms) {
            mp.x = lerp(mp.startX, mp.endX, (Math.sin(frameCount * mp.speed * 0.02) + 1) / 2);
            mp.y = lerp(mp.startY, mp.endY, (Math.sin(frameCount * mp.speed * 0.02) + 1) / 2);
        }

        // 2. Switches & Doors
        for (const [key, sw] of Object.entries(this.switches)) {
            const wasPressed = sw.pressed;
            sw.pressed = false;
            const plateRect = { x: sw.x + 4, y: sw.y + TILE.SIZE - 8, w: TILE.SIZE - 8, h: 8 };
            for (const entity of activeEntities) {
                if (rectsOverlap(entity, plateRect)) {
                    sw.pressed = true;
                    break;
                }
            }
            if (!wasPressed && sw.pressed && typeof game !== 'undefined' && game.particles && game.audio) {
                game.audio.play('switchPress');
                game.particles.emit('switchPress', sw.x + TILE.SIZE/2, sw.y + TILE.SIZE);
            }
            if (this.doors[key]) {
                this.doors[key].forEach(d => d.open = sw.pressed);
            }
        }
        
        // 3. Spikes
        for (const spike of this.spikes) {
            const spikeRect = { x: spike.x + 4, y: spike.y + TILE.SIZE - 12, w: TILE.SIZE - 8, h: 12 };
            if (rectsOverlap(player, spikeRect)) {
                player.die();
            }
        }
        
        // 4. Lasers
        for (const laser of this.lasers) {
            laser.blocked = false;
            laser.length = 0;
            let bx = laser.srcX;
            let by = laser.srcY;
            
            if (laser.direction === 'right') {
                bx += TILE.SIZE;
                while (bx < this.pixelWidth) {
                    const beamRect = { x: bx, y: by + 12, w: TILE.SIZE, h: 16 };
                    // Check if echo blocks
                    for (const echo of echoes) {
                        if (!echo.finished && rectsOverlap(echo, beamRect)) {
                            laser.blocked = true;
                            break;
                        }
                    }
                    if (laser.blocked) break;
                    
                    const c = Math.floor(bx / TILE.SIZE);
                    const r = Math.floor((by + TILE.SIZE/2) / TILE.SIZE);
                    if (this.isSolid(c, r)) break;
                    
                    bx += TILE.SIZE;
                    laser.length += TILE.SIZE;
                }
            } else if (laser.direction === 'down') {
                by += TILE.SIZE;
                while (by < this.pixelHeight) {
                    const beamRect = { x: bx + 12, y: by, w: 16, h: TILE.SIZE };
                    for (const echo of echoes) {
                        if (!echo.finished && rectsOverlap(echo, beamRect)) {
                            laser.blocked = true;
                            break;
                        }
                    }
                    if (laser.blocked) break;
                    
                    const c = Math.floor((bx + TILE.SIZE/2) / TILE.SIZE);
                    const r = Math.floor(by / TILE.SIZE);
                    if (this.isSolid(c, r)) break;
                    
                    by += TILE.SIZE;
                    laser.length += TILE.SIZE;
                }
            }
            
            // Check player collision with active laser
            if (laser.length > 0) {
                const laserBeamRect = laser.direction === 'right' 
                    ? { x: laser.srcX + TILE.SIZE, y: laser.srcY + 12, w: laser.length, h: 16 }
                    : { x: laser.srcX + 12, y: laser.srcY + TILE.SIZE, w: 16, h: laser.length };
                if (rectsOverlap(player, laserBeamRect)) {
                    player.die();
                }
            }
        }
        
        // 5. Stars
        for (const star of this.stars) {
            if (!star.collected) {
                const starRect = { x: star.x + 8, y: star.y + 8, w: 24, h: 24 };
                if (rectsOverlap(player, starRect)) {
                    star.collected = true;
                    if (typeof game !== 'undefined' && game.particles && game.audio) {
                        game.audio.play('star');
                        game.particles.emit('starCollect', star.x + TILE.SIZE/2, star.y + TILE.SIZE/2);
                    }
                }
            }
        }
        
        // 6. Portal
        const portalRect = { x: this.portalX + 4, y: this.portalY + 4, w: TILE.SIZE - 8, h: TILE.SIZE - 8 };
        const portalActive = Object.values(this.switches).every(s => s.pressed) || Object.keys(this.switches).length === 0;
        
        if (portalActive && typeof game !== 'undefined' && game.particles) {
            if (frameCount % 10 === 0) {
                game.particles.emit('portal', this.portalX + TILE.SIZE/2, this.portalY + TILE.SIZE/2);
            }
        }
        
        if (portalActive && !player.dead && rectsOverlap(player, portalRect)) {
            if (typeof game !== 'undefined' && game.audio) game.audio.play('portal');
            return 'COMPLETE';
        }
        
        return null;
    }
    
    render(ctx, frameCount, camera) {
        let startCol = 0, endCol = this.cols, startRow = 0, endRow = this.rows;
        let viewX = 0, viewY = 0, viewW = this.pixelWidth, viewH = this.pixelHeight;
        
        if (camera && typeof CANVAS !== 'undefined') {
            startCol = Math.max(0, Math.floor(camera.x / TILE.SIZE) - 1);
            endCol = Math.min(this.cols, Math.ceil((camera.x + CANVAS.WIDTH) / TILE.SIZE) + 1);
            startRow = Math.max(0, Math.floor(camera.y / TILE.SIZE) - 1);
            endRow = Math.min(this.rows, Math.ceil((camera.y + CANVAS.HEIGHT) / TILE.SIZE) + 1);
            viewX = camera.x - TILE.SIZE;
            viewY = camera.y - TILE.SIZE;
            viewW = CANVAS.WIDTH + TILE.SIZE * 2;
            viewH = CANVAS.HEIGHT + TILE.SIZE * 2;
        }

        const inView = (x, y, w, h) => {
            return x + w >= viewX && x <= viewX + viewW && y + h >= viewY && y <= viewY + viewH;
        };

        // Draw tiles
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const t = this.grid[r][c];
                if (t === T.EMPTY) continue;
                
                const wx = c * TILE.SIZE;
                const wy = r * TILE.SIZE;
                
                if (t === T.PLATFORM || t === T.WALL_JUMP_L || t === T.WALL_JUMP_R) {
                    const isWallJump = t === T.WALL_JUMP_L || t === T.WALL_JUMP_R;
                    const fillColor = isWallJump ? COLORS.WALL_JUMP : COLORS.PLATFORM;
                    const edgeColor = isWallJump ? COLORS.WALL_JUMP_EDGE : COLORS.PLATFORM_EDGE;
                    const glowColor = isWallJump ? COLORS.NEON_PURPLE : COLORS.NEON_CYAN;
                    
                    const grad = ctx.createLinearGradient(wx, wy, wx, wy + TILE.SIZE);
                    grad.addColorStop(0, edgeColor);
                    grad.addColorStop(0.15, fillColor);
                    grad.addColorStop(1, fillColor);
                    ctx.fillStyle = grad;
                    ctx.fillRect(wx, wy, TILE.SIZE, TILE.SIZE);
                    
                    ctx.fillStyle = glowColor;
                    ctx.shadowColor = glowColor;
                    ctx.shadowBlur = 8;
                    ctx.fillRect(wx, wy, TILE.SIZE, 2);
                    ctx.shadowBlur = 0;
                    
                    ctx.strokeStyle = hexToRgba(glowColor, 0.25);
                    ctx.lineWidth = 1;
                    ctx.strokeRect(wx + 0.5, wy + 0.5, TILE.SIZE - 1, TILE.SIZE - 1);
                } else if (t === T.SPAWN) {
                    // Spawn indicator
                    ctx.strokeStyle = hexToRgba(COLORS.NEON_CYAN, 0.3);
                    ctx.beginPath();
                    ctx.arc(wx + TILE.SIZE/2, wy + TILE.SIZE/2, 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
        
        // Moving platforms
        for (const mp of this.movingPlatforms) {
            if (!inView(mp.x, mp.y, mp.w, mp.h)) continue;
            ctx.fillStyle = COLORS.PLATFORM;
            ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
            ctx.fillStyle = COLORS.NEON_CYAN;
            ctx.fillRect(mp.x, mp.y, mp.w, 3);
        }
        
        // Spikes
        for (const spike of this.spikes) {
            if (!inView(spike.x, spike.y, TILE.SIZE, TILE.SIZE)) continue;
            ctx.fillStyle = COLORS.NEON_MAGENTA;
            ctx.shadowColor = COLORS.NEON_MAGENTA;
            ctx.shadowBlur = 8;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(spike.x + i*13 + 3, spike.y + TILE.SIZE);
                ctx.lineTo(spike.x + i*13 + 9, spike.y + TILE.SIZE - 12);
                ctx.lineTo(spike.x + i*13 + 15, spike.y + TILE.SIZE);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }
        
        // Switches
        for (const [key, sw] of Object.entries(this.switches)) {
            if (!inView(sw.x, sw.y, TILE.SIZE, TILE.SIZE)) continue;
            const plateY = sw.y + TILE.SIZE - (sw.pressed ? 4 : 8);
            ctx.fillStyle = sw.pressed ? COLORS.NEON_GREEN : COLORS.TEXT_MUTED;
            if (sw.pressed) {
                ctx.shadowColor = COLORS.NEON_GREEN;
                ctx.shadowBlur = 10;
            }
            drawRoundedRect(ctx, sw.x + 4, plateY, TILE.SIZE - 8, sw.pressed ? 4 : 8, 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = sw.pressed ? COLORS.NEON_GREEN : COLORS.TEXT_SECONDARY;
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(key, sw.x + TILE.SIZE/2, sw.y + TILE.SIZE - 14);
            ctx.textAlign = 'start';
        }
        
        // Doors
        for (const [key, doorArray] of Object.entries(this.doors)) {
            for (const door of doorArray) {
                if (!inView(door.x, door.y, TILE.SIZE, TILE.SIZE)) continue;
                if (!door.open) {
                    ctx.fillStyle = COLORS.NEON_ORANGE;
                    ctx.globalAlpha = 0.7;
                    ctx.fillRect(door.x, door.y, TILE.SIZE, TILE.SIZE);
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    for (let i = 1; i < 4; i++) {
                        ctx.beginPath();
                        ctx.moveTo(door.x, door.y + i * 10);
                        ctx.lineTo(door.x + TILE.SIZE, door.y + i * 10);
                        ctx.stroke();
                    }
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '12px Orbitron';
                    ctx.textAlign = 'center';
                    ctx.fillText(key, door.x + TILE.SIZE/2, door.y + TILE.SIZE/2 + 4);
                    ctx.textAlign = 'start';
                } else {
                    ctx.strokeStyle = hexToRgba(COLORS.NEON_ORANGE, 0.2);
                    ctx.lineWidth = 1;
                    ctx.strokeRect(door.x + 2, door.y + 2, TILE.SIZE - 4, TILE.SIZE - 4);
                }
            }
        }
        
        // Lasers
        for (const laser of this.lasers) {
            const laserW = laser.direction === 'right' ? TILE.SIZE + laser.length : TILE.SIZE;
            const laserH = laser.direction === 'down' ? TILE.SIZE + laser.length : TILE.SIZE;
            if (!inView(laser.srcX, laser.srcY, laserW, laserH)) continue;
            
            ctx.fillStyle = COLORS.NEON_MAGENTA;
            ctx.shadowColor = COLORS.NEON_MAGENTA;
            ctx.shadowBlur = 10;
            drawRoundedRect(ctx, laser.srcX + 8, laser.srcY + 8, 24, 24, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            if (laser.length > 0) {
                const beamAlpha = 0.5 + Math.sin(frameCount * 0.15) * 0.2;
                ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, beamAlpha);
                ctx.lineWidth = 4;
                ctx.beginPath();
                if (laser.direction === 'right') {
                    ctx.moveTo(laser.srcX + TILE.SIZE, laser.srcY + TILE.SIZE/2);
                    ctx.lineTo(laser.srcX + TILE.SIZE + laser.length, laser.srcY + TILE.SIZE/2);
                } else {
                    ctx.moveTo(laser.srcX + TILE.SIZE/2, laser.srcY + TILE.SIZE);
                    ctx.lineTo(laser.srcX + TILE.SIZE/2, laser.srcY + TILE.SIZE + laser.length);
                }
                ctx.stroke();
                
                ctx.lineWidth = 12;
                ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, beamAlpha * 0.2);
                ctx.stroke();
            }
        }
        
        // Stars
        for (const star of this.stars) {
            if (!inView(star.x, star.y, TILE.SIZE, TILE.SIZE)) continue;
            if (!star.collected) {
                ctx.save();
                ctx.translate(star.x + TILE.SIZE/2, star.y + TILE.SIZE/2);
                ctx.rotate(frameCount * 0.05);
                ctx.fillStyle = COLORS.NEON_YELLOW;
                ctx.shadowColor = COLORS.NEON_YELLOW;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*10, -Math.sin((18+i*72)/180*Math.PI)*10);
                    ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*4, -Math.sin((54+i*72)/180*Math.PI)*4);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Portal
        const portalActive = Object.values(this.switches).every(s => s.pressed) || Object.keys(this.switches).length === 0;
        ctx.save();
        ctx.translate(this.portalX + TILE.SIZE/2, this.portalY + TILE.SIZE/2);
        
        if (portalActive) {
            const pulse = 0.8 + Math.sin(frameCount * 0.08) * 0.2;
            
            // Layer 1: Large outer ambient glow
            const ambientGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, 45);
            ambientGlow.addColorStop(0, hexToRgba(COLORS.NEON_CYAN, 0.25 * pulse));
            ambientGlow.addColorStop(0.5, hexToRgba(COLORS.NEON_CYAN, 0.08 * pulse));
            ambientGlow.addColorStop(1, hexToRgba(COLORS.NEON_CYAN, 0));
            ctx.fillStyle = ambientGlow;
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.fill();
            
            // Layer 2: Outer spinning ring — thick, glowing
            ctx.save();
            ctx.rotate(frameCount * 0.02);
            ctx.strokeStyle = hexToRgba(COLORS.NEON_CYAN, 0.3);
            ctx.lineWidth = 3;
            ctx.shadowColor = COLORS.NEON_CYAN;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
            
            // Layer 3: Swirling energy arcs (3 arcs, spaced evenly)
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.rotate(frameCount * 0.04 + i * (Math.PI * 2 / 3));
                const arcGrad = ctx.createLinearGradient(0, -20, 0, 20);
                arcGrad.addColorStop(0, hexToRgba(COLORS.NEON_CYAN, 0.9));
                arcGrad.addColorStop(0.5, hexToRgba('#00ff88', 0.6));
                arcGrad.addColorStop(1, hexToRgba(COLORS.NEON_CYAN, 0));
                ctx.strokeStyle = arcGrad;
                ctx.lineWidth = 3.5;
                ctx.shadowColor = COLORS.NEON_CYAN;
                ctx.shadowBlur = 12;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(0, 0, 17, 0, Math.PI / 1.8);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
            
            // Layer 4: Counter-rotating inner arcs (2 arcs, thinner)
            for (let i = 0; i < 2; i++) {
                ctx.save();
                ctx.rotate(-frameCount * 0.06 + i * Math.PI);
                ctx.strokeStyle = hexToRgba('#00ff88', 0.5);
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI / 2.5);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
            
            // Layer 5: Pulsing inner vortex
            const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
            innerGrad.addColorStop(0, hexToRgba('#ffffff', 0.7 * pulse));
            innerGrad.addColorStop(0.3, hexToRgba(COLORS.NEON_CYAN, 0.5 * pulse));
            innerGrad.addColorStop(0.7, hexToRgba('#00ff88', 0.2 * pulse));
            innerGrad.addColorStop(1, hexToRgba(COLORS.NEON_CYAN, 0));
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();
            
            // Layer 6: Bright white core dot
            ctx.fillStyle = hexToRgba('#ffffff', 0.8 * pulse);
            ctx.shadowColor = COLORS.NEON_CYAN;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, 4 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Layer 7: Four rotating rune-like marks on the outer edge
            for (let i = 0; i < 4; i++) {
                const angle = frameCount * -0.03 + i * (Math.PI / 2);
                const mx = Math.cos(angle) * 22;
                const my = Math.sin(angle) * 22;
                ctx.fillStyle = hexToRgba(COLORS.NEON_CYAN, 0.6);
                ctx.shadowColor = COLORS.NEON_CYAN;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(mx, my, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            
        } else {
            // Locked portal — dim, pulsing warning
            const lockPulse = 0.5 + Math.sin(frameCount * 0.06) * 0.2;
            
            // Dim outer glow
            const dimGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
            dimGlow.addColorStop(0, hexToRgba(COLORS.NEON_ORANGE, 0.1 * lockPulse));
            dimGlow.addColorStop(1, hexToRgba(COLORS.NEON_ORANGE, 0));
            ctx.fillStyle = dimGlow;
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Dashed ring
            ctx.strokeStyle = hexToRgba(COLORS.NEON_ORANGE, 0.35 * lockPulse);
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Lock icon — small padlock shape
            ctx.strokeStyle = hexToRgba(COLORS.NEON_ORANGE, 0.6 * lockPulse);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            // Lock body
            ctx.fillStyle = hexToRgba(COLORS.NEON_ORANGE, 0.15);
            drawRoundedRect(ctx, -5, -2, 10, 9, 2);
            ctx.fill();
            ctx.strokeRect(-5, -2, 10, 9);
            // Lock shackle
            ctx.beginPath();
            ctx.arc(0, -3, 5, Math.PI, 0);
            ctx.stroke();
        }
        ctx.restore();
    }
}
