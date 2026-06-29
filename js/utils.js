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
    // Stub for now. To be implemented in Sprint 2.
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
