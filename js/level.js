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
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return true; // Bounds check
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
            sw.pressed = false;
            const plateRect = { x: sw.x + 4, y: sw.y + TILE.SIZE - 8, w: TILE.SIZE - 8, h: 8 };
            for (const entity of activeEntities) {
                if (rectsOverlap(entity, plateRect)) {
                    sw.pressed = true;
                    break;
                }
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
                    if (typeof game !== 'undefined' && game.particles) {
                        // game.particles.emit('starCollect', star.x + 20, star.y + 20);
                    }
                }
            }
        }
        
        // 6. Portal
        const portalRect = { x: this.portalX + 4, y: this.portalY + 4, w: TILE.SIZE - 8, h: TILE.SIZE - 8 };
        const portalActive = Object.values(this.switches).every(s => s.pressed) || Object.keys(this.switches).length === 0;
        if (portalActive && !player.dead && rectsOverlap(player, portalRect)) {
            return 'COMPLETE';
        }
        
        return null;
    }
    
    render(ctx, frameCount) {
        // Draw tiles
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
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
            ctx.fillStyle = COLORS.PLATFORM;
            ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
            ctx.fillStyle = COLORS.NEON_CYAN;
            ctx.fillRect(mp.x, mp.y, mp.w, 3);
        }
        
        // Spikes
        for (const spike of this.spikes) {
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
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.rotate(frameCount * 0.03 + i * 2.094);
                const grad = ctx.createLinearGradient(0, -20, 0, 20);
                grad.addColorStop(0, COLORS.NEON_CYAN);
                grad.addColorStop(1, 'transparent');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI / 1.5);
                ctx.stroke();
                ctx.restore();
            }
            const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
            innerGrad.addColorStop(0, hexToRgba(COLORS.NEON_CYAN, 0.6));
            innerGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.strokeStyle = hexToRgba(COLORS.NEON_CYAN, 0.3);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI*2);
            ctx.stroke();
            ctx.fillStyle = COLORS.TEXT_MUTED;
            ctx.font = '14px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('X', 0, 5);
        }
        ctx.restore();
    }
}
