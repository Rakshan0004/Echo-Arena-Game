// Lerp: linear interpolation
function lerp(a, b, t) { return a + (b - a) * t; }

// Clamp value between min and max
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// AABB collision: returns true if two rectangles overlap
function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

// Distance between two points
function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Random float between min (inclusive) and max (exclusive)
function randRange(min, max) { return Math.random() * (max - min) + min; }

// Random integer between min and max (inclusive)
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Ease out cubic
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// Ease in out cubic
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

// Convert hex color to rgba string with alpha
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// Shared physics function for Player and Echo (Sprint 2 / Sprint 3)
function simulatePhysics(entity, input, level) {
    // 1. Horizontal movement
    let moveX = 0;
    if (input.left) { moveX = -PHYSICS.PLAYER_SPEED; entity.facing = -1; }
    if (input.right) { moveX = PHYSICS.PLAYER_SPEED; entity.facing = 1; }
    entity.vx += moveX;
    
    // Apply friction & clamp
    entity.vx *= (entity.onGround ? PHYSICS.FRICTION_GROUND : PHYSICS.FRICTION_AIR);
    entity.vx = clamp(entity.vx, -PHYSICS.PLAYER_SPEED * 1.5, PHYSICS.PLAYER_SPEED * 1.5);
    
    // 2. Gravity & Wall Slide
    if ((entity.onWallLeft || entity.onWallRight) && !entity.onGround && entity.vy > 0) {
        entity.vy = Math.min(entity.vy + PHYSICS.GRAVITY, PHYSICS.WALL_SLIDE_SPEED);
    } else {
        entity.vy += PHYSICS.GRAVITY;
        entity.vy = Math.min(entity.vy, PHYSICS.MAX_FALL_SPEED);
    }
    
    // 3. Coyote time
    if (entity.wasOnGround && !entity.onGround && entity.vy >= 0) {
        entity.coyoteTimer = PHYSICS.COYOTE_TIME;
    }
    if (entity.coyoteTimer > 0) entity.coyoteTimer--;
    
    // 4. Jump buffer
    if (input.jump) entity.jumpBufferTimer = PHYSICS.JUMP_BUFFER;
    if (entity.jumpBufferTimer > 0) entity.jumpBufferTimer--;
    
    // 5. Jumping
    const canJump = (entity.onGround || entity.coyoteTimer > 0) && entity.jumpBufferTimer > 0;
    if (canJump) {
        entity.vy = PHYSICS.PLAYER_JUMP;
        entity.coyoteTimer = 0;
        entity.jumpBufferTimer = 0;
        entity.squashX = 0.7;
        entity.squashY = 1.3;
        if (entity.emitJumpParticles) entity.emitJumpParticles();
    } else if (!entity.onGround && (entity.onWallLeft || entity.onWallRight) && entity.jumpBufferTimer > 0) {
        entity.vy = PHYSICS.WALL_JUMP_Y;
        entity.vx = entity.onWallLeft ? PHYSICS.WALL_JUMP_X : -PHYSICS.WALL_JUMP_X;
        entity.facing = entity.onWallLeft ? 1 : -1;
        entity.coyoteTimer = 0;
        entity.jumpBufferTimer = 0;
        entity.squashX = 1.3;
        entity.squashY = 0.7;
        if (entity.emitWallJumpParticles) entity.emitWallJumpParticles();
    }
    
    // Variable jump height
    if (entity.vy < 0 && !input.jumpHeld) {
        entity.vy *= 0.5;
    }
    
    // 6. Move and collide X
    entity.x += entity.vx;
    entity.onWallLeft = false;
    entity.onWallRight = false;
    if (level && level.getCollisions) {
        const collisions = level.getCollisions(entity);
        for (const tile of collisions) {
            if (rectsOverlap(entity, tile)) {
                if (entity.vx > 0) {
                    entity.x = tile.x - entity.w;
                    if (tile.type === T.WALL_JUMP_R || tile.type === T.PLATFORM || tile.type === T.WALL_JUMP_L) entity.onWallRight = true;
                } else if (entity.vx < 0) {
                    entity.x = tile.x + tile.w;
                    if (tile.type === T.WALL_JUMP_L || tile.type === T.PLATFORM || tile.type === T.WALL_JUMP_R) entity.onWallLeft = true;
                }
                entity.vx = 0;
            }
        }
    }
    
    // 7. Move and collide Y
    entity.y += entity.vy;
    entity.wasOnGround = entity.onGround;
    entity.onGround = false;
    if (level && level.getCollisions) {
        const collisions = level.getCollisions(entity);
        for (const tile of collisions) {
            if (rectsOverlap(entity, tile)) {
                if (entity.vy > 0) {
                    entity.y = tile.y - entity.h;
                    entity.onGround = true;
                } else if (entity.vy < 0) {
                    entity.y = tile.y + tile.h;
                }
                entity.vy = 0;
            }
        }
    }
    
    if (!entity.wasOnGround && entity.onGround) {
        entity.squashX = 1.3;
        entity.squashY = 0.7;
        if (entity.emitLandParticles) entity.emitLandParticles();
    }
    
    // 8. Squash/stretch recovery
    entity.squashX = lerp(entity.squashX, 1, 0.15);
    entity.squashY = lerp(entity.squashY, 1, 0.15);
}

// Draw a rounded rectangle
function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Draw a multi-pointed star
function drawStar(ctx, cx, cy, innerR, outerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
}
