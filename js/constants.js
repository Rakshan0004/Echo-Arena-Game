const COLORS = {
    BG_DARK:        '#0a0e27',    // main background
    BG_MID:         '#121836',    // secondary background
    BG_LIGHT:       '#1a2147',    // tertiary / card bg
    NEON_CYAN:      '#00f5ff',    // player highlight, portals
    NEON_MAGENTA:   '#ff00aa',    // lasers, danger
    NEON_PURPLE:    '#8b5cf6',    // echoes / ghosts
    NEON_GREEN:     '#00ff88',    // switches, success
    NEON_YELLOW:    '#ffd700',    // stars, collectibles
    NEON_ORANGE:    '#ff6b35',    // warning accents
    TEXT_PRIMARY:   '#e2e8f0',    // main text
    TEXT_SECONDARY: '#94a3b8',    // dimmed text
    TEXT_MUTED:     '#475569',    // very dimmed
    PLATFORM:       '#1e293b',    // platform fill
    PLATFORM_EDGE:  '#334155',    // platform top edge highlight
    WALL_JUMP:      '#2d1f69',    // wall-jump surface fill
    WALL_JUMP_EDGE: '#8b5cf6',    // wall-jump surface edge glow
    OVERLAY_BG:     'rgba(10, 14, 39, 0.85)', // modal overlays
    GLASS_BG:       'rgba(26, 33, 71, 0.6)',   // glassmorphism panels
    GLASS_BORDER:   'rgba(139, 92, 246, 0.3)', // glass border
};

const FONTS = {
    HEADING: '"Orbitron", sans-serif',   // Google Font - futuristic
    BODY:    '"Inter", sans-serif',      // Google Font - clean
};

const PHYSICS = {
    GRAVITY:            0.6,     // pixels/frame² downward acceleration
    MAX_FALL_SPEED:     12,      // terminal velocity in pixels/frame
    PLAYER_SPEED:       4,       // horizontal movement speed pixels/frame
    PLAYER_JUMP:       -11,      // jump velocity (negative = upward)
    WALL_JUMP_X:        6,       // horizontal velocity on wall jump
    WALL_JUMP_Y:       -10,      // vertical velocity on wall jump
    WALL_SLIDE_SPEED:   2,       // max fall speed when sliding on wall
    FRICTION_GROUND:    0.85,    // velocity multiplier on ground (deceleration)
    FRICTION_AIR:       0.92,    // velocity multiplier in air
    COYOTE_TIME:        6,       // frames of grace period after leaving edge
    JUMP_BUFFER:        8,       // frames to buffer a jump press
};

const TILE = {
    SIZE: 40,  // each tile is 40x40 pixels
};

const CANVAS = {
    WIDTH:  1200,   // logical canvas width
    HEIGHT: 680,    // logical canvas height
};

const STATE = {
    MENU:           'MENU',
    LEVEL_SELECT:   'LEVEL_SELECT',
    PLAYING:        'PLAYING',
    ROUND_END:      'ROUND_END',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    PAUSED:         'PAUSED',
    CONTROLS:       'CONTROLS',
};

const T = {
    EMPTY:          0,
    PLATFORM:       1,
    WALL_JUMP_L:    2,
    WALL_JUMP_R:    3,
    SPIKE:          4,
    SWITCH_A:       5,
    SWITCH_B:       6,
    SWITCH_C:       7,
    SWITCH_D:       8,
    DOOR_A:         9,
    DOOR_B:         10,
    DOOR_C:         11,
    DOOR_D:         12,
    LASER_SRC:      13,
    LASER_SRC_V:    14,
    PORTAL:         15,
    SPAWN:          16,
    STAR:           17,
    MOVING_PLAT_H:  18,
    MOVING_PLAT_V:  19,
    CHECKPOINT:     20,
};
