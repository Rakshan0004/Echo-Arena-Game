# Echo Arena — Complete Sprint Plan

> **Project**: Echo Arena — A time-loop platformer browser game
> **Tech Stack**: Pure HTML5 + CSS3 + Vanilla JavaScript (Canvas API). No frameworks, no npm, no build tools.
> **How to Run**: Open `index.html` in any modern browser.
> **Target**: 60 FPS, responsive, works on all modern browsers.
> **Workspace**: `c:\Users\Rakshan\Downloads\something_Cool\`

---

## ⚠️ READ THIS FIRST — Project Overview & Context

This section exists so that ANY AI agent — even one with zero prior context — can understand the full project before touching a single sprint. **Read this entire section before implementing anything.**

### What Is Echo Arena?

Echo Arena is a **single-player, browser-based 2D platformer game** with a unique "time loop" mechanic. The player cooperates with **recordings of their own past movements** (called "echoes" or "ghosts") to solve puzzles and reach the exit portal in each level.

There is **no backend, no database, no authentication**. The entire game runs client-side in a single HTML file that loads CSS and vanilla JavaScript. Anyone can open it in a browser and play immediately.

### The Core Mechanic — Echoes (THIS IS THE HEART OF THE GAME)

Understanding this mechanic is **critical**. Every system in the game revolves around it:

1. Each level has a **maximum number of rounds** (e.g., 3 rounds).
2. In **Round 0**, the player moves freely. All keyboard inputs are recorded frame-by-frame into an array.
3. When the player presses **R**, the round ends. The input recording is saved.
4. In **Round 1**, a **ghost (echo)** replays the Round 0 recording. It moves through the level exactly as the player did in Round 0. Meanwhile, the player controls a **new character** and their inputs are again recorded.
5. Echoes can **press switches** and **block lasers**, but they **cannot die** (they're ghosts — they pass through spikes/lasers harmlessly).
6. In **Round 2**, TWO echoes replay (from Round 0 and Round 1), plus the player controls a new character.
7. The player must reach the **exit portal** on their final round. The portal only activates when **all switches in the level are pressed** (by echoes or the player).

**Critical rule**: Every round, ALL echoes start replaying from frame 0 simultaneously. The player always starts fresh at the spawn point. The world resets (switches unpressed, doors closed) at the start of each round.

**Example**: A level has a door blocked by a switch. In Round 0, the player walks to the switch and stands on it, then presses R. In Round 1, the echo replays and stands on the switch (holding it down), while the real player runs through the now-open door to the portal.

### Why This Game Is Special

- **Novel mechanic**: Unlike standard platformers, you play WITH yourself. It's a puzzle game disguised as a platformer.
- **No multiplayer needed**: The "cooperation" is between the player and their past selves.
- **Progressive learning**: Level 1 has no echoes (just teaches movement). Level 2 introduces one echo. Later levels require 3-4 echoes with precise timing.
- **Deeply satisfying**: When a plan comes together — 3 echoes pressing switches, blocking lasers, and you waltz through — it feels incredible.

### Visual Quality Bar — THIS GAME MUST LOOK STUNNING

This game is intended to attract and retain real users. The visual quality bar is **premium indie game**, not a coding exercise. Every implementation decision should prioritize visual polish:

- **Dark sci-fi aesthetic**: Deep navy backgrounds (#0a0e27), neon glow effects (cyan, magenta, purple), inspired by games like Hyper Light Drifter, Dead Cells, and Celeste.
- **Neon glow on everything interactive**: The player glows cyan. Echoes glow purple/pink. Switches glow green when pressed. Lasers pulse magenta. Portals swirl with light.
- **Particles everywhere**: Jump dust, landing impact, death burst, star collection sparkle, portal shimmer, echo trails. The particle system is a first-class citizen, not an afterthought.
- **Smooth animations**: Squash/stretch on the player character. Smooth camera lerping. Screen shake on death. Fade transitions between screens. Buttons scale on hover.
- **Glassmorphism UI**: All menus and overlays use frosted glass panels with blur effects and subtle borders.
- **Typography**: Orbitron (Google Font) for headings — futuristic and bold. Inter (Google Font) for body text — clean and readable.
- **No placeholder art**: The player and echoes are rendered as geometric shapes with glow effects using Canvas drawing commands. No sprites or external images needed.

**If the game looks flat, basic, or like a tutorial project — the implementation has FAILED.**

### Architectural Rules

1. **Pure vanilla stack**: HTML5 + CSS3 + vanilla JavaScript. No React, no Vue, no npm, no Webpack, no TypeScript. The game MUST work by simply opening `index.html` in a browser.
2. **No ES modules**: All JS files use regular `<script>` tags loaded in dependency order. All classes and functions are global.
3. **Canvas for gameplay, HTML for UI**: The game world (player, echoes, levels, particles) is rendered on a `<canvas>` element. Menus and overlays are HTML/CSS elements layered on top.
4. **Constants centralized**: ALL colors, physics values, tile types, and canvas dimensions live in `js/constants.js`. Never hardcode magic numbers.
5. **Shared physics**: The Player and Echo classes must use **identical physics code**. The Echo replays recorded inputs through the same physics simulation. If you change gravity for the player, it must also change for echoes. The recommended approach is a shared `simulatePhysics(entity, input, level)` function in `js/utils.js` that both Player.update() and Echo.update() call.
6. **Frame-based timing**: The game runs on `requestAnimationFrame`. All physics, animations, and timers are counted in frames (at 60fps), NOT milliseconds. This ensures deterministic echo replay.
7. **Deterministic replays**: Because echoes replay recorded inputs through the same physics, their movement MUST be identical to the original player's movement. This only works if physics is purely frame-based with no randomness or time-based calculations.

### How to Execute a Sprint

When you are assigned a sprint:

1. **Read the full sprint section** including the Goal, all file specifications, and the Acceptance Criteria at the bottom.
2. **Read the Design System section** for all constants, colors, and physics values you'll need.
3. **Check dependencies**: Some sprints depend on earlier ones. Don't assume code exists unless a previous sprint was completed.
4. **Create stub files for dependencies**: If your sprint references classes from other sprints not yet built, create minimal stubs (empty classes with the required method signatures) so your code can run without errors.
5. **Follow the acceptance criteria literally**: Every checkbox must be verifiable by running the game in a browser.
6. **Test in browser**: After implementing, open `index.html` in a browser and verify the acceptance criteria visually.
7. **Do NOT skip visual polish**: Glow effects, particles, animations, and smooth transitions are REQUIRED, not optional polish. They are part of the acceptance criteria.

### Sprint Dependency Graph

```
Sprint 1 (Engine) ─────┐
Sprint 2 (Player) ──────┤
Sprint 3 (Echo) ─────────┤── All depend on Sprint 1's engine, input, camera
Sprint 4 (Level System) ─┤
Sprint 5 (Level Data) ───┤── Depends on Sprint 4's level loader
Sprint 6 (Particles/Audio)┤── Can be built independently, plugged in anywhere
Sprint 7 (UI) ───────────┤── Depends on Sprint 1's state machine
Sprint 8 (Integration) ──┘── Depends on ALL previous sprints
```

**Sprints 1-4** are the critical foundation. **Sprint 5** is pure data. **Sprint 6** adds juice. **Sprint 7** adds UI chrome. **Sprint 8** wires everything together.

### What "Done" Looks Like

When all 8 sprints are complete, the game should:

1. Open in a browser showing a stunning animated main menu with a glowing "ECHO ARENA" title
2. Let the player select from 8 levels (first unlocked, rest locked until previous is beaten)
3. Play through each level with smooth 60fps platformer physics
4. Record the player's inputs and replay them as glowing ghost echoes
5. Have echoes interact with switches and lasers to solve puzzles
6. Show particle effects on every interaction (jump, land, death, collect, etc.)
7. Play procedural sound effects for all actions
8. Show level completion with star ratings and save progress to localStorage
9. Scale responsively to any browser window size
10. Feel like a polished indie game, not a student project

---

## File Structure

```
something_Cool/
├── index.html          # Entry point, canvas, font loading, script imports
├── style.css           # All styling: menus, HUD, overlays, animations
└── js/
    ├── constants.js    # All game constants in one place
    ├── utils.js        # Math helpers, collision functions, easing functions
    ├── engine.js       # Game loop, state machine, input manager, camera
    ├── player.js       # Player entity, physics, rendering, animation
    ├── echo.js         # Ghost recording, replay, rendering
    ├── level.js        # Level loader, tile renderer, interactive elements
    ├── levels.js       # All 8 level data definitions (tile maps + metadata)
    ├── particles.js    # Particle system and emitters
    ├── audio.js        # Web Audio API procedural sound effects
    └── ui.js           # Menu screens, HUD, overlays, transitions
```

---

## Design System (Global Constants)

Every sprint references these values. They live in `js/constants.js`.

### Colors

```javascript
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
```

### Typography

```javascript
const FONTS = {
    HEADING: '"Orbitron", sans-serif',   // Google Font - futuristic
    BODY:    '"Inter", sans-serif',      // Google Font - clean
};
```

### Physics

```javascript
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
```

### Tile System

```javascript
const TILE = {
    SIZE: 40,  // each tile is 40x40 pixels
};
```

### Canvas

```javascript
const CANVAS = {
    WIDTH:  1200,   // logical canvas width
    HEIGHT: 680,    // logical canvas height
};
```

### Game States

```javascript
const STATE = {
    MENU:           'MENU',
    LEVEL_SELECT:   'LEVEL_SELECT',
    PLAYING:        'PLAYING',
    ROUND_END:      'ROUND_END',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    PAUSED:         'PAUSED',
    CONTROLS:       'CONTROLS',
};
```

### Tile Types (used in level maps)

```javascript
const T = {
    EMPTY:          0,
    PLATFORM:       1,
    WALL_JUMP_L:    2,   // wall-jump surface on left side
    WALL_JUMP_R:    3,   // wall-jump surface on right side
    SPIKE:          4,
    SWITCH_A:       5,   // pressure plate A
    SWITCH_B:       6,   // pressure plate B
    SWITCH_C:       7,   // pressure plate C
    SWITCH_D:       8,   // pressure plate D
    DOOR_A:         9,   // door controlled by switch A
    DOOR_B:         10,  // door controlled by switch B
    DOOR_C:         11,  // door controlled by switch C
    DOOR_D:         12,  // door controlled by switch D
    LASER_SRC:      13,  // laser emitter (fires horizontal beam)
    LASER_SRC_V:    14,  // laser emitter (fires vertical beam downward)
    PORTAL:         15,  // exit portal
    SPAWN:          16,  // player spawn point
    STAR:           17,  // collectible star
    MOVING_PLAT_H:  18,  // horizontal moving platform anchor
    MOVING_PLAT_V:  19,  // vertical moving platform anchor
    CHECKPOINT:     20,  // round-end checkpoint
};
```

---

## Sprint 1: Foundation — Engine, Input, Camera

### Goal
Build the core game engine: canvas setup, game loop, keyboard input manager, camera system, and state machine. After this sprint, you should see a dark canvas with a grid overlay (debug mode) and be able to log key presses.

### File: `index.html`

Create the HTML entry point:

```
- DOCTYPE html, lang="en"
- <head>:
  - charset UTF-8, viewport meta (width=device-width, initial-scale=1.0)
  - <title>Echo Arena — Time Loop Platformer</title>
  - Meta description: "Echo Arena is a time-loop platformer where you cooperate with ghosts of your past selves to solve puzzles."
  - Preconnect to Google Fonts: fonts.googleapis.com, fonts.gstatic.com
  - Google Fonts link: Orbitron (weights 400,700,900) and Inter (weights 300,400,600,700)
  - Link to style.css
- <body>:
  - <div id="game-container">
    - <canvas id="game-canvas"></canvas>
    - <div id="ui-layer"></div>     ← HTML overlay for menus/HUD
  - </div>
  - Script tags loading JS files IN THIS ORDER (all type="module" is NOT used; use regular scripts in order):
    1. js/constants.js
    2. js/utils.js
    3. js/particles.js
    4. js/audio.js
    5. js/player.js
    6. js/echo.js
    7. js/levels.js
    8. js/level.js
    9. js/ui.js
    10. js/engine.js   ← last, since it initializes everything
```

### File: `style.css`

Base styles only (more added in Sprint 7):

```css
/* Reset */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
    width: 100%; height: 100%;
    overflow: hidden;
    background: #0a0e27;
    font-family: 'Inter', sans-serif;
    color: #e2e8f0;
}

#game-container {
    position: relative;
    width: 100vw; height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0e27;
}

#game-canvas {
    display: block;
    background: #0a0e27;
    border-radius: 8px;
    /* Canvas will be scaled via JS to fit viewport while maintaining aspect ratio */
}

#ui-layer {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; /* allow clicks to pass through except on interactive children */
}

#ui-layer > * {
    pointer-events: auto; /* re-enable on direct children */
}
```

### File: `js/constants.js`

Paste ALL the constants defined in the "Design System" section above into this file as global `const` declarations.

### File: `js/utils.js`

Utility functions (all global):

```javascript
// Lerp: linear interpolation
function lerp(a, b, t) { return a + (b - a) * t; }

// Clamp value between min and max
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// AABB collision: returns true if two rectangles overlap
// Each rect: { x, y, w, h }
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
```

### File: `js/engine.js`

This is the main entry point that initializes and runs the game.

**InputManager (object)**:
```
- Properties:
  - keys: {}          — currently held keys (key string → true/false)
  - justPressed: {}   — keys pressed THIS frame (cleared each frame)
  - justReleased: {}  — keys released THIS frame (cleared each frame)
- On window 'keydown': set keys[e.code] = true, justPressed[e.code] = true. Call e.preventDefault() for game keys (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space, KeyW, KeyA, KeyS, KeyD, KeyR, Escape, Enter)
- On window 'keyup': set keys[e.code] = false, justReleased[e.code] = true
- Method resetFrame(): clear justPressed and justReleased to empty objects
- Helper isDown(code): return !!keys[code]
- Helper wasPressed(code): return !!justPressed[code]
- Helper wasReleased(code): return !!justReleased[code]
- Convenience helpers:
  - left():  isDown('ArrowLeft')  || isDown('KeyA')
  - right(): isDown('ArrowRight') || isDown('KeyD')
  - jump():  wasPressed('ArrowUp') || wasPressed('KeyW') || wasPressed('Space')
  - jumpHeld(): isDown('ArrowUp') || isDown('KeyW') || isDown('Space')
```

**Camera (object)**:
```
- Properties:
  - x: 0, y: 0              — current camera position (top-left corner in world coords)
  - targetX: 0, targetY: 0  — where camera wants to be
  - shakeX: 0, shakeY: 0    — screen shake offset
  - shakeDuration: 0         — remaining shake frames
  - shakeIntensity: 0
- Method follow(targetX, targetY, levelWidth, levelHeight):
  - targetX = targetX centered on canvas: targetX - CANVAS.WIDTH / 2
  - targetY = targetY centered on canvas: targetY - CANVAS.HEIGHT / 2
  - Clamp targetX to [0, levelWidth - CANVAS.WIDTH] (or 0 if level smaller than canvas)
  - Clamp targetY to [0, levelHeight - CANVAS.HEIGHT] (or 0 if level smaller than canvas)
  - Lerp this.x toward targetX with t=0.08
  - Lerp this.y toward targetY with t=0.08
- Method shake(intensity, duration):
  - Set shakeIntensity = intensity, shakeDuration = duration
- Method update():
  - If shakeDuration > 0: shakeX = randRange(-shakeIntensity, shakeIntensity), shakeY same, shakeDuration--
  - Else: shakeX = 0, shakeY = 0
- Method applyTransform(ctx):
  - ctx.setTransform(1, 0, 0, 1, 0, 0) — reset transform
  - ctx.translate(-Math.round(this.x + this.shakeX), -Math.round(this.y + this.shakeY))
```

**Game (main object)**:
```
- Properties:
  - canvas: document.getElementById('game-canvas')
  - ctx: canvas.getContext('2d')
  - state: STATE.MENU
  - currentLevel: 0        — index of the level being played (0-based)
  - currentRound: 0        — which round the player is on (0 = first round)
  - maxRounds: 0           — max echoes allowed for current level
  - recordings: []         — array of recorded input arrays from previous rounds
  - player: null           — Player instance
  - echoes: []             — array of Echo instances replaying
  - level: null            — Level instance
  - particles: null        — ParticleSystem instance
  - audio: null            — Audio instance
  - ui: null               — UI instance
  - camera: Camera
  - frameCount: 0          — total frames elapsed (for animations)
  - levelProgress: []      — array of booleans, which levels are completed (saved to localStorage)
  - levelStars: []         — array of numbers 0-3, stars collected per level
  - transition: { active: false, alpha: 0, callback: null, phase: 'none' }  — screen fade transition

- Method init():
  - Set canvas.width = CANVAS.WIDTH, canvas.height = CANVAS.HEIGHT
  - Call resizeCanvas() to scale canvas to fit viewport
  - Add window resize listener → resizeCanvas()
  - Initialize particles = new ParticleSystem()
  - Initialize audio = new AudioManager()
  - Initialize ui = new UI(this)
  - Load progress from localStorage key 'echoArena_progress' (JSON parse) or default [false x8]
  - Load stars from localStorage key 'echoArena_stars' (JSON parse) or default [0 x8]
  - Set state = STATE.MENU
  - Call requestAnimationFrame(this.loop.bind(this))

- Method resizeCanvas():
  - Calculate scale = min(window.innerWidth / CANVAS.WIDTH, window.innerHeight / CANVAS.HEIGHT)
  - Set canvas.style.width = (CANVAS.WIDTH * scale) + 'px'
  - Set canvas.style.height = (CANVAS.HEIGHT * scale) + 'px'

- Method loop(timestamp):
  - Call requestAnimationFrame(this.loop.bind(this))
  - frameCount++
  - Call update()
  - Call render()
  - InputManager.resetFrame()

- Method update():
  - If transition.active: handle fade transition (see below)
  - Switch on state:
    - MENU: ui.updateMenu()
    - LEVEL_SELECT: ui.updateLevelSelect()
    - PLAYING: updatePlaying()
    - ROUND_END: ui.updateRoundEnd()
    - LEVEL_COMPLETE: ui.updateLevelComplete()
    - PAUSED: ui.updatePaused()
    - CONTROLS: ui.updateControls()
  - particles.update()

- Method updatePlaying():
  - player.update(level, InputManager)
  - For each echo in echoes: echo.update(level)
  - level.update(player, echoes, frameCount)
  - camera.follow(player.x + player.w/2, player.y + player.h/2, level.pixelWidth, level.pixelHeight)
  - camera.update()
  - Check win condition: if player overlaps portal AND all required switches active → startTransition to LEVEL_COMPLETE
  - Check death: if player.dead → camera.shake(4, 10), particles emit death burst, after 60 frames restart round
  - If Escape pressed → state = PAUSED
  - If KeyR pressed → restartRound()

- Method render():
  - ctx.setTransform(1,0,0,1,0,0)  — reset
  - Draw background gradient (vertical: BG_DARK top → BG_MID bottom)
  - Draw animated background stars (subtle twinkling dots; use frameCount for animation)
  - If state == PLAYING or ROUND_END or PAUSED:
    - camera.applyTransform(ctx)
    - level.render(ctx, frameCount)
    - For each echo: echo.render(ctx, frameCount)
    - player.render(ctx, frameCount)
    - particles.render(ctx)
    - ctx.setTransform(1,0,0,1,0,0) — reset for HUD
    - ui.renderHUD(ctx)
  - ui.renderOverlays(ctx)  — menus, modals
  - renderTransition(ctx)

- Method startLevel(levelIndex):
  - startTransition callback:
    - currentLevel = levelIndex
    - level = new Level(LEVEL_DATA[levelIndex])
    - currentRound = 0
    - maxRounds = LEVEL_DATA[levelIndex].maxRounds
    - recordings = []
    - echoes = []
    - player = new Player(level.spawnX, level.spawnY)
    - level.reset()
    - state = STATE.PLAYING

- Method endRound():
  - Save player's recording: recordings.push(player.getRecording())
  - currentRound++
  - If currentRound > maxRounds → player dies (fail: too many rounds)
  - Else:
    - Create Echo from each recording in recordings
    - echoes = recordings.map((rec, i) => new Echo(rec, level.spawnX, level.spawnY, i))
    - player = new Player(level.spawnX, level.spawnY)
    - level.resetDynamic()  — reset doors/switches but keep static state
    - state = STATE.PLAYING

- Method completeLevel():
  - levelProgress[currentLevel] = true
  - Calculate stars earned (based on rounds used vs par)
  - levelStars[currentLevel] = max(levelStars[currentLevel], starsEarned)
  - Save to localStorage
  - state = STATE.LEVEL_COMPLETE

- Method startTransition(callback):
  - transition = { active: true, alpha: 0, callback, phase: 'out' }
  - Phase 'out': alpha increases 0 → 1 over 20 frames, then call callback, switch phase to 'in'
  - Phase 'in': alpha decreases 1 → 0 over 20 frames, then transition.active = false

- Method renderTransition(ctx):
  - If transition.active: fill full canvas with rgba(10,14,39, transition.alpha)

- Method saveProgress():
  - localStorage.setItem('echoArena_progress', JSON.stringify(levelProgress))
  - localStorage.setItem('echoArena_stars', JSON.stringify(levelStars))
```

### Acceptance Criteria — Sprint 1
- [ ] Canvas renders at 1200x680, scaled to fit the browser viewport
- [ ] Background is dark gradient with subtle animated stars
- [ ] Key presses are tracked; arrow keys, WASD, Space, R, Escape all prevented from default
- [ ] Camera can follow a target with smooth lerping and screen shake
- [ ] State machine switches between states
- [ ] Game loop runs at 60fps via requestAnimationFrame
- [ ] All constants centralized in constants.js

---

## Sprint 2: Player Physics & Movement

### Goal
Implement the player entity with full platformer physics: gravity, ground friction, air control, jumping, coyote time, jump buffering, wall sliding, and wall jumping. Render the player as a stylized character using canvas drawing (no sprites needed — geometric shapes with glow effects).

### ⚠️ IMPORTANT: Shared Physics Architecture
The physics simulation code you write for the Player in this sprint will be **reused identically by Echoes in Sprint 3**. To avoid duplication and ensure deterministic replay, extract all physics logic (gravity, friction, collision resolution, jumping, wall jumping) into a shared function: `simulatePhysics(entity, input, level)` in `js/utils.js`. Both Player.update() and Echo.update() should call this same function. The `entity` parameter is any object with properties: `x, y, w, h, vx, vy, onGround, onWallLeft, onWallRight, facing, coyoteTimer, jumpBufferTimer, squashX, squashY`. The `input` parameter is an object with methods/properties: `left, right, jump, jumpHeld` (booleans). This architectural decision is CRITICAL for the echo mechanic to work correctly.

### File: `js/player.js`

**Player class**:

```
Constructor(spawnX, spawnY):
  - x: spawnX (world pixel coordinates)
  - y: spawnY
  - w: 28   (hitbox width in pixels)
  - h: 36   (hitbox height in pixels)
  - vx: 0   (horizontal velocity)
  - vy: 0   (vertical velocity)
  - onGround: false
  - onWallLeft: false
  - onWallRight: false
  - facing: 1   (1 = right, -1 = left)
  - dead: false
  - deathTimer: 0
  - coyoteTimer: 0
  - jumpBufferTimer: 0
  - animState: 'idle'    — idle | run | jump | fall | wallSlide
  - animFrame: 0
  - squashX: 1           — for squash/stretch animation
  - squashY: 1
  - recording: []        — array of input snapshots, one per frame
  - isRecording: true
  - trailPositions: []   — last 8 positions for motion trail
```

**Method update(level, input)**:
```
Step 1 — Record input snapshot (if isRecording):
  - Push to this.recording: { left: input.left(), right: input.right(), jump: input.jump(), jumpHeld: input.jumpHeld() }

Step 2 — Horizontal movement:
  - let moveX = 0
  - if input.left():  moveX = -PHYSICS.PLAYER_SPEED, facing = -1
  - if input.right(): moveX = PHYSICS.PLAYER_SPEED,  facing = 1
  - vx += moveX
  - Apply friction: vx *= (onGround ? PHYSICS.FRICTION_GROUND : PHYSICS.FRICTION_AIR)
  - Clamp vx to [-PHYSICS.PLAYER_SPEED * 1.5, PHYSICS.PLAYER_SPEED * 1.5]

Step 3 — Gravity:
  - If onWallLeft || onWallRight (and not onGround and vy > 0):
    - vy = min(vy + PHYSICS.GRAVITY, PHYSICS.WALL_SLIDE_SPEED)  — wall slide (slow fall)
  - Else:
    - vy += PHYSICS.GRAVITY
    - vy = min(vy, PHYSICS.MAX_FALL_SPEED)

Step 4 — Coyote time:
  - If was onGround last frame and now not onGround and vy >= 0: start coyoteTimer = PHYSICS.COYOTE_TIME
  - If coyoteTimer > 0: coyoteTimer--

Step 5 — Jump buffer:
  - If input.jump(): jumpBufferTimer = PHYSICS.JUMP_BUFFER
  - If jumpBufferTimer > 0: jumpBufferTimer--

Step 6 — Jumping:
  - Can jump if: (onGround || coyoteTimer > 0) && jumpBufferTimer > 0
  - If can jump:
    - vy = PHYSICS.PLAYER_JUMP
    - coyoteTimer = 0
    - jumpBufferTimer = 0
    - squashX = 0.7, squashY = 1.3   — stretch on jump
    - EMIT: jump particles (4-6 small circles at feet, velocities spreading downward)
    - audio.play('jump')
  - Wall jump: if NOT onGround and (onWallLeft || onWallRight) and jumpBufferTimer > 0:
    - vy = PHYSICS.WALL_JUMP_Y
    - vx = onWallLeft ? PHYSICS.WALL_JUMP_X : -PHYSICS.WALL_JUMP_X
    - facing = onWallLeft ? 1 : -1
    - coyoteTimer = 0
    - jumpBufferTimer = 0
    - squashX = 1.3, squashY = 0.7
    - audio.play('wallJump')

Step 7 — Variable jump height:
  - If vy < 0 and !input.jumpHeld(): vy *= 0.5  (cut jump short if key released)

Step 8 — Move and collide:
  - Move horizontally: x += vx, then resolve horizontal collisions with level.getTileCollisions()
  - Move vertically: y += vy, then resolve vertical collisions
  - Update onGround, onWallLeft, onWallRight based on collision results
  - If just landed (wasnt onGround, now is): squashX = 1.3, squashY = 0.7, emit land particles

Step 9 — Squash/stretch recovery:
  - squashX = lerp(squashX, 1, 0.15)
  - squashY = lerp(squashY, 1, 0.15)

Step 10 — Update animation state:
  - If dead: animState = 'dead'
  - Else if onWallLeft || onWallRight (not onGround): animState = 'wallSlide'
  - Else if vy < 0: animState = 'jump'
  - Else if !onGround: animState = 'fall'
  - Else if abs(vx) > 0.5: animState = 'run'
  - Else: animState = 'idle'

Step 11 — Trail:
  - Push {x, y} to trailPositions
  - Keep only last 8 entries

Step 12 — Death check:
  - If collides with spike or laser → die()
```

**Collision resolution** (called in Step 8):
```
resolveCollisions(level, axis):
  For axis 'x':
    - Get all solid tiles the player overlaps (use player bounding box expanded by vx)
    - For each solid tile rect {tx, ty, tw=TILE.SIZE, th=TILE.SIZE}:
      - If rectsOverlap(playerRect, tileRect):
        - If vx > 0: player.x = tileRect.x - player.w (push left), check if tile is WALL_JUMP_R → onWallRight = true
        - If vx < 0: player.x = tileRect.x + tileRect.w (push right), check if tile is WALL_JUMP_L → onWallLeft = true
        - vx = 0
  For axis 'y':
    - Same approach
    - If vy > 0: player.y = tileRect.y - player.h, vy = 0, onGround = true
    - If vy < 0: player.y = tileRect.y + tileRect.h, vy = 0
```

**Method die()**:
```
  - dead = true
  - deathTimer = 60 (frames before respawn)
  - Emit death particles: 20 particles in a burst circle, color NEON_CYAN, fade out
  - camera.shake(5, 12)
  - audio.play('death')
```

**Method render(ctx, frameCount)**:
```
  If dead and deathTimer > 0: render fading ghost, decrement deathTimer, return
  
  ctx.save()
  ctx.translate(x + w/2, y + h/2)     — move origin to player center
  ctx.scale(squashX * facing, squashY) — apply squash/stretch + flip for direction
  
  // Motion trail (previous positions)
  for i in trailPositions (oldest to newest):
    alpha = (i / trailPositions.length) * 0.15
    Draw smaller rect at trail position with NEON_CYAN at alpha
  
  // Body: rounded rectangle, filled with gradient (dark navy → slightly lighter navy)
  // Size: w=28, h=36, centered at origin so draw from -14,-18 to 14,18
  drawRoundedRect(-14, -18, 28, 36, 6)
  Fill with linear gradient: top=#1a2147, bottom=#0a0e27
  Stroke with NEON_CYAN at 0.8 alpha, lineWidth 2
  
  // Visor (eye area): horizontal rounded rect near top
  // Position: y = -10, width = 18, height = 6, border-radius 3
  drawRoundedRect(-9, -13, 18, 6, 3)
  Fill with NEON_CYAN
  // Glow: ctx.shadowColor = NEON_CYAN, shadowBlur = 12
  
  // Legs: two small rectangles at bottom, animated in run state
  if animState == 'run':
    legOffset = sin(frameCount * 0.3) * 4
    Draw left leg at (-6, 14 + legOffset), right at (2, 14 - legOffset), size 5x6
  else:
    Draw both legs at (-6, 14) and (2, 14), size 5x6
  Fill legs with PLATFORM color, stroke with NEON_CYAN 0.3 alpha
  
  ctx.restore()
  
  // Outer glow: draw a larger circle behind player with radial gradient NEON_CYAN alpha 0.05 → 0
  ctx.save()
  radialGradient centered at player center, radius 50
  colorStop(0, hexToRgba(COLORS.NEON_CYAN, 0.08))
  colorStop(1, hexToRgba(COLORS.NEON_CYAN, 0))
  fillArc at player center, radius 50
  ctx.restore()
```

**Method getRecording()**:
```
  return [...this.recording]  — return a copy of the recording array
```

**Method getRect()**:
```
  return { x: this.x, y: this.y, w: this.w, h: this.h }
```

### Acceptance Criteria — Sprint 2
- [ ] Player spawns at level spawn point
- [ ] Smooth left/right movement with acceleration and friction
- [ ] Gravity pulls player down; terminal velocity capped
- [ ] Jump with variable height (hold for higher, tap for shorter)
- [ ] Coyote time: can jump for 6 frames after walking off an edge
- [ ] Jump buffering: jump input remembered for 8 frames
- [ ] Wall sliding: slow fall when pressed against a wall-jump surface
- [ ] Wall jumping: bounce off walls with correct velocity
- [ ] Squash/stretch on jump and land
- [ ] Motion trail behind player (last 8 positions, fading cyan)
- [ ] Player rendered as geometric character with neon cyan glow
- [ ] Death on spike/laser contact with particle burst and screen shake
- [ ] All inputs recorded frame-by-frame into recording array

---

## Sprint 3: Echo (Ghost) System

### Goal
Implement the echo/ghost replay system. Each echo replays a previously recorded set of inputs, simulating full physics as if a player were controlling it. Echoes interact with the world (press switches, block lasers) but cannot die.

### File: `js/echo.js`

**Echo class**:

```
Constructor(recording, spawnX, spawnY, echoIndex):
  - recording: the input array to replay
  - x: spawnX
  - y: spawnY
  - w: 28, h: 36        (same as player)
  - vx: 0, vy: 0
  - onGround: false
  - onWallLeft: false, onWallRight: false
  - facing: 1
  - currentFrame: 0      — which frame of the recording we're on
  - echoIndex: echoIndex  — 0, 1, 2, 3... for color variation
  - alive: true           — false when recording ends
  - squashX: 1, squashY: 1
  - trailPositions: []
  - alpha: 0.55           — base transparency
  
  // Color cycling per echo index
  - color: pick from array [COLORS.NEON_PURPLE, '#ff6b9d', '#4ecdc4', '#ffd93d'] using echoIndex % 4
```

**Method update(level)**:
```
  If !alive: return
  If currentFrame >= recording.length:
    alive = false
    return
  
  // Read the recorded input for this frame
  const input = recording[currentFrame]
  currentFrame++
  
  // Call the SAME shared physics function that Player uses:
  // simulatePhysics(this, input, level)
  // This function is defined in utils.js (see Sprint 2's "Shared Physics Architecture" section).
  // The echo object has the same physics properties as the player (x, y, vx, vy, etc.)
  // so the shared function works identically on both.
  //
  // DO NOT copy-paste the player's physics code here. DO NOT write separate physics.
  // Call the exact same simulatePhysics() function. This guarantees deterministic replay.
  // If the echo's movement doesn't match what the player did, the game is BROKEN.
  
  // Trail
  trailPositions.push({x, y})
  Keep last 12 entries (longer trail than player for visual distinction)
```

**Method render(ctx, frameCount)**:
```
  If !alive: return
  
  ctx.save()
  ctx.globalAlpha = this.alpha + sin(frameCount * 0.05 + echoIndex) * 0.1  — subtle pulse
  
  // Trail: render trail positions as small circles with echo color, fading
  for i in trailPositions:
    alpha = (i / trailPositions.length) * 0.2
    ctx.fillStyle = hexToRgba(this.color, alpha)
    ctx.fillRect(trailPositions[i].x + 6, trailPositions[i].y + 10, 16, 16)
  
  ctx.translate(x + w/2, y + h/2)
  ctx.scale(squashX * facing, squashY)
  
  // Body: same shape as player but filled with echo color and more transparent
  drawRoundedRect(-14, -18, 28, 36, 6)
  Fill with hexToRgba(this.color, 0.3)
  Stroke with this.color, lineWidth 2, alpha 0.7
  
  // Visor: same position as player but echo color
  drawRoundedRect(-9, -13, 18, 6, 3)
  Fill with this.color
  shadowColor = this.color, shadowBlur = 15
  
  // "Ghost" scan lines effect: draw 3-4 horizontal lines across the body with very low alpha
  for (let i = 0; i < 4; i++):
    y_offset = -18 + (i+1) * 9 + sin(frameCount * 0.1 + i) * 2
    drawLine(-14, y_offset, 14, y_offset) with color at 0.15 alpha, lineWidth 1
  
  ctx.restore()
  
  // Outer glow in echo color
  Radial gradient from center, radius 40, echo color at 0.06 → 0
```

**Method getRect()**:
```
  return { x, y, w, h }
```

### How Echoes Interact with the World
- In `level.js` update, check all entities (player + all alive echoes) against switches/pressure plates
- A switch is "pressed" if ANY entity (player or echo) overlaps it
- A laser is "blocked" if ANY echo's bounding box intersects the laser beam path
- Echoes CANNOT die — they pass through spikes and lasers harmlessly (they are ghosts!)

### Acceptance Criteria — Sprint 3
- [ ] Echoes replay recorded inputs with identical physics to the player
- [ ] Echoes are rendered as semi-transparent ghostly versions with distinct colors per echo index
- [ ] Ghost scan-line effect visible on echo bodies
- [ ] Longer motion trail than the player
- [ ] Echo alpha pulses subtly over time
- [ ] Echoes can press switches and pressure plates
- [ ] Echoes can block laser beams
- [ ] Echoes cannot die (ignore spikes/lasers)
- [ ] Multiple echoes can coexist from different rounds

---

## Sprint 4: Level System & Interactive Elements

### Goal
Build the level loading system, tile-based world rendering, and all interactive elements: platforms, switches, doors, lasers, exit portal, spikes, moving platforms, stars, and checkpoints.

### File: `js/level.js`

**Level class**:

```
Constructor(levelData):
  - levelData: the level definition object (from levels.js)
  - name: levelData.name
  - grid: 2D array from levelData.grid (rows x cols of tile type integers)
  - rows: grid.length
  - cols: grid[0].length
  - pixelWidth: cols * TILE.SIZE
  - pixelHeight: rows * TILE.SIZE
  - spawnX: 0, spawnY: 0   — found by scanning grid for SPAWN tile
  - portalX: 0, portalY: 0 — found by scanning grid for PORTAL tile
  - maxRounds: levelData.maxRounds
  - parRounds: levelData.parRounds   — for star rating
  
  // Interactive elements (scanned from grid on construction):
  - switches: {}       — { 'A': { x, y, pressed: false }, 'B': ... }
  - doors: {}          — { 'A': [{ x, y, open: false }], 'B': [...] }
  - lasers: []         — [{ srcX, srcY, direction: 'right'|'down', blocked: false }]
  - movingPlatforms: [] — [{ x, y, startX, startY, endX, endY, speed, axis }]
  - stars: []          — [{ x, y, collected: false }]
  - checkpoints: []    — [{ x, y }]
  
  // Scan the grid to populate all the above:
  for row 0..rows-1:
    for col 0..cols-1:
      tile = grid[row][col]
      wx = col * TILE.SIZE, wy = row * TILE.SIZE
      switch tile:
        SPAWN:     spawnX = wx, spawnY = wy
        PORTAL:    portalX = wx, portalY = wy
        SWITCH_A:  switches['A'] = { x: wx, y: wy, pressed: false }
        SWITCH_B:  switches['B'] = { ... }
        (same for C, D)
        DOOR_A:    doors['A'] = doors['A'] || []; doors['A'].push({ x: wx, y: wy, open: false })
        (same for B, C, D)
        LASER_SRC: lasers.push({ srcX: wx, srcY: wy, direction: 'right', blocked: false, length: 0 })
        LASER_SRC_V: lasers.push({ srcX: wx, srcY: wy, direction: 'down', blocked: false, length: 0 })
        STAR:      stars.push({ x: wx, y: wy, collected: false })
        MOVING_PLAT_H: parse moving platform data from levelData.movingPlatforms
        CHECKPOINT: checkpoints.push({ x: wx, y: wy })
```

**Method isSolid(col, row)**:
```
  If out of bounds: return true (treat out-of-bounds as solid for safety)
  tile = grid[row][col]
  Solid tiles: PLATFORM, WALL_JUMP_L, WALL_JUMP_R, DOOR_x (if door is closed)
  Return true if tile is any of those
```

**Method isWallJumpL(col, row)**: return grid[row][col] === T.WALL_JUMP_L
**Method isWallJumpR(col, row)**: return grid[row][col] === T.WALL_JUMP_R

**Method getTileCollisions(rect)**: 
```
  Return array of tile rects that are solid and overlap the given rect
  Check all tiles from floor(rect.x/TILE.SIZE) to floor((rect.x+rect.w)/TILE.SIZE), same for y
  For each: if isSolid(col, row): push { x: col*TILE.SIZE, y: row*TILE.SIZE, w: TILE.SIZE, h: TILE.SIZE, type: grid[row][col] }
```

**Method update(player, echoes, frameCount)**:
```
  // 1. Update switches
  for each switch key in switches:
    switch.pressed = false
    entities = [player, ...echoes.filter(e => e.alive)]
    for each entity:
      plateRect = { x: switch.x, y: switch.y + TILE.SIZE - 10, w: TILE.SIZE, h: 10 }
      if rectsOverlap(entity.getRect(), plateRect): switch.pressed = true
    // Open/close corresponding doors
    if doors[key]:
      for each door in doors[key]: door.open = switch.pressed
  
  // 2. Update lasers
  for each laser:
    // Calculate laser beam: extend from source in direction until hitting a solid tile
    laser.blocked = false
    laser.length = 0
    let bx = laser.srcX, by = laser.srcY
    if laser.direction == 'right':
      bx += TILE.SIZE  // start after the emitter tile
      while bx < pixelWidth:
        // Check if any echo blocks this position
        beamRect = { x: bx, y: by + 12, w: TILE.SIZE, h: 16 }
        for each echo in echoes:
          if echo.alive and rectsOverlap(echo.getRect(), beamRect): laser.blocked = true; break
        // Check if solid tile blocks
        col = floor(bx / TILE.SIZE)
        row = floor((by + TILE.SIZE/2) / TILE.SIZE)
        if isSolid(col, row): break
        if laser.blocked: break
        bx += TILE.SIZE
        laser.length += TILE.SIZE
    // Same logic for 'down' direction but iterate vertically
    
    // Check player collision with laser (if not blocked)
    if !laser.blocked:
      laserBeamRect = full beam rect from src to length
      if rectsOverlap(player.getRect(), laserBeamRect): player.die()
  
  // 3. Update moving platforms
  for each mp in movingPlatforms:
    // Move between startX,startY and endX,endY at mp.speed
    // Use sin(frameCount * mp.speed) for smooth oscillation
    mp.x = lerp(mp.startX, mp.endX, (sin(frameCount * mp.speed * 0.02) + 1) / 2)
    mp.y = lerp(mp.startY, mp.endY, (sin(frameCount * mp.speed * 0.02) + 1) / 2)
    // Moving platforms are solid — player stands on them (handle in collision)
  
  // 4. Check spikes
  for row, col in grid where tile == SPIKE:
    spikeRect = { x: col*TILE.SIZE + 4, y: row*TILE.SIZE + TILE.SIZE - 12, w: TILE.SIZE - 8, h: 12 }
    if rectsOverlap(player.getRect(), spikeRect): player.die()
  
  // 5. Check star collection
  for each star in stars:
    if !star.collected:
      starRect = { x: star.x + 8, y: star.y + 8, w: 24, h: 24 }
      if rectsOverlap(player.getRect(), starRect):
        star.collected = true
        particles.emit('starCollect', star.x + 20, star.y + 20)
        audio.play('star')
  
  // 6. Check portal
  portalRect = { x: portalX + 4, y: portalY + 4, w: TILE.SIZE - 8, h: TILE.SIZE - 8 }
  // Portal is only active when all switches are pressed (or no switches exist)
  portalActive = Object.values(switches).every(s => s.pressed) || Object.keys(switches).length === 0
  if portalActive and rectsOverlap(player.getRect(), portalRect):
    // Level complete!
    return 'COMPLETE'
  
  // 7. Check checkpoint (round end)
  for each cp in checkpoints:
    cpRect = { x: cp.x + 4, y: cp.y + 4, w: TILE.SIZE - 8, h: TILE.SIZE - 8 }
    if rectsOverlap(player.getRect(), cpRect):
      return 'CHECKPOINT'
  
  return null
```

**Method reset()**: reset all doors, switches, stars, lasers to initial state
**Method resetDynamic()**: reset only switches and doors (keep stars collected state)

**Method render(ctx, frameCount)**:
```
  // 1. Draw background tiles (empty space with subtle grid)
  Optional: faint grid lines at 0.03 alpha for visual reference
  
  // 2. Draw platforms
  for each PLATFORM tile:
    ctx.fillStyle = COLORS.PLATFORM
    ctx.fillRect(x, y, TILE.SIZE, TILE.SIZE)
    // Top edge highlight
    ctx.fillStyle = COLORS.PLATFORM_EDGE
    ctx.fillRect(x, y, TILE.SIZE, 3)
  
  // 3. Draw wall-jump surfaces
  for each WALL_JUMP tile:
    ctx.fillStyle = COLORS.WALL_JUMP
    ctx.fillRect(x, y, TILE.SIZE, TILE.SIZE)
    // Glowing edge on the jumpable side
    if WALL_JUMP_L: draw left edge glow (2px wide, WALL_JUMP_EDGE color)
    if WALL_JUMP_R: draw right edge glow
    // Subtle animated chevrons on the surface pointing toward the wall
  
  // 4. Draw spikes
  for each SPIKE tile:
    // Draw triangular spikes (3 small triangles)
    ctx.fillStyle = COLORS.NEON_MAGENTA
    for i = 0..2:
      triangle at (x + i*13 + 2, y + TILE.SIZE), pointing up, height 12
    // Glow effect
    ctx.shadowColor = COLORS.NEON_MAGENTA, shadowBlur = 8
  
  // 5. Draw switches (pressure plates)
  for each switch (A/B/C/D):
    plateY = switch.y + TILE.SIZE - (switch.pressed ? 4 : 8)
    ctx.fillStyle = switch.pressed ? COLORS.NEON_GREEN : COLORS.TEXT_MUTED
    drawRoundedRect(switch.x + 4, plateY, TILE.SIZE - 8, switch.pressed ? 4 : 8, 2)
    // Label: draw letter (A/B/C/D) above plate
    ctx.fillStyle = switch.pressed ? COLORS.NEON_GREEN : COLORS.TEXT_SECONDARY
    ctx.font = '10px Orbitron'
    ctx.fillText(key, switch.x + TILE.SIZE/2, switch.y + TILE.SIZE - 14)
    // Glow when pressed
    if switch.pressed: shadowColor = NEON_GREEN, shadowBlur = 10
  
  // 6. Draw doors
  for each door:
    if !door.open:
      // Solid door block with striped pattern
      ctx.fillStyle = COLORS.NEON_ORANGE
      ctx.globalAlpha = 0.7
      fillRect(door.x, door.y, TILE.SIZE, TILE.SIZE)
      // Horizontal stripes
      for i = 0..3: drawLine across at y + i*10 with darker shade
      ctx.globalAlpha = 1
    else:
      // Open: draw faint outline only, mostly invisible
      ctx.strokeStyle = hexToRgba(COLORS.NEON_ORANGE, 0.15)
      strokeRect(door.x + 2, door.y + 2, TILE.SIZE - 4, TILE.SIZE - 4)
  
  // 7. Draw lasers
  for each laser:
    // Emitter: small box with glow
    ctx.fillStyle = COLORS.NEON_MAGENTA
    drawRoundedRect(laser.srcX + 8, laser.srcY + 8, 24, 24, 4)
    shadowColor = NEON_MAGENTA, shadowBlur = 12
    
    if !laser.blocked:
      // Beam: animated, pulsing line
      beamAlpha = 0.5 + sin(frameCount * 0.15) * 0.2
      ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, beamAlpha)
      ctx.lineWidth = 4
      draw line from emitter to laser.length
      // Wider glow behind
      ctx.lineWidth = 12
      ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, beamAlpha * 0.2)
      draw same line
    else:
      // Blocked: short beam to the blocking echo, dimmer
      ctx.strokeStyle = hexToRgba(COLORS.NEON_MAGENTA, 0.2)
      ctx.lineWidth = 2
      draw shorter line
  
  // 8. Draw portal
  portalActive = all switches pressed (or no switches)
  // Animated swirling circle
  ctx.save()
  ctx.translate(portalX + TILE.SIZE/2, portalY + TILE.SIZE/2)
  
  if portalActive:
    // Bright, inviting portal
    for i = 0..2:
      ctx.rotate(frameCount * 0.02 + i * 2.094)  // 120 degrees apart
      gradient: NEON_CYAN → transparent
      draw arc segment
    // Inner glow
    radialGradient: NEON_CYAN 0.4 → transparent
    fillCircle radius 16
    // Particle emission from portal (handled by particle system)
  else:
    // Dim, inactive portal
    ctx.strokeStyle = hexToRgba(COLORS.NEON_CYAN, 0.2)
    ctx.lineWidth = 2
    strokeCircle radius 14
    // X mark or lock icon
    ctx.fillStyle = COLORS.TEXT_MUTED
    ctx.font = '14px Orbitron'
    ctx.fillText('◆', -5, 5)
  
  ctx.restore()
  
  // 9. Draw stars
  for each star (not collected):
    // 5-pointed star shape, rotating slowly
    ctx.save()
    ctx.translate(star.x + TILE.SIZE/2, star.y + TILE.SIZE/2)
    ctx.rotate(frameCount * 0.03)
    drawStar(0, 0, 6, 12, 5)  — inner radius 6, outer 12, 5 points
    ctx.fillStyle = COLORS.NEON_YELLOW
    ctx.fill()
    shadowColor = NEON_YELLOW, shadowBlur = 10
    // Floating bob animation
    ctx.translate(0, sin(frameCount * 0.05 + star.x) * 3)
    ctx.restore()
  
  // 10. Draw moving platforms
  for each mp:
    ctx.fillStyle = COLORS.PLATFORM
    fillRect(mp.x, mp.y, TILE.SIZE * 2, TILE.SIZE / 2)   // wider, thinner platform
    ctx.fillStyle = COLORS.NEON_CYAN
    fillRect(mp.x, mp.y, TILE.SIZE * 2, 3)  // glowing top edge
```

### Acceptance Criteria — Sprint 4
- [ ] Levels load from data definitions and render all tile types
- [ ] Platforms are solid, player collides correctly
- [ ] Wall-jump surfaces show glowing edges
- [ ] Spikes kill the player on contact
- [ ] Switches depress when player or echo stands on them
- [ ] Doors open/close based on their linked switch state
- [ ] Lasers fire beams that kill the player; echoes can block them
- [ ] Portal is inactive until all switches pressed, then becomes animated and completable
- [ ] Stars float and rotate; collected on player contact with sparkle effect
- [ ] Moving platforms oscillate and carry the player

---

## Sprint 5: Level Design — All 8 Levels

### Goal
Define all 8 hand-crafted levels as tile map arrays. Each level teaches or combines mechanics progressively.

### File: `js/levels.js`

This file exports a `LEVEL_DATA` array. Each entry has:

```javascript
{
    name: "Level Name",
    subtitle: "Short description",
    maxRounds: N,        // max number of rounds allowed (N-1 echoes)
    parRounds: M,        // par rounds for 3 stars (M rounds or fewer = 3 stars)
    grid: [              // 2D array, each row is an array of tile type integers
        [1, 1, 1, ...],
        [1, 0, 0, ...],
        ...
    ],
    movingPlatforms: [   // optional, for levels with moving platforms
        { startCol, startRow, endCol, endRow, speed }
    ],
    hint: "Hint text shown at start of level"
}
```

### Level 1: "Awakening" — Tutorial

```
- Size: 25 cols × 12 rows
- maxRounds: 1, parRounds: 1
- Concept: Simple jump-and-run to the portal. No echoes needed. Teaches movement and jumping.
- Layout:
  - Flat ground across bottom
  - Small gap to jump over (3 tiles wide)
  - A raised platform to jump onto
  - Portal at the far right on a platform
  - 1 star floating above the gap (optional challenge)
- Spawn: bottom-left (col 2, row 10)
- Portal: far right on a platform (col 22, row 6)
- Hint: "Arrow keys to move. Space to jump. Reach the portal!"
- No switches, no doors, no lasers

Grid (0=empty, 1=platform, 16=spawn, 15=portal, 17=star):
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 5:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,15,1,1]
Row 7:  [1,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,1]
Row 8:  [1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,1]
Row 9:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 10: [1,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 11: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]
```

### Level 2: "First Echo" — Introduction to Echo Mechanic

```
- Size: 25 cols × 14 rows
- maxRounds: 2, parRounds: 2
- Concept: One pressure plate (A) holds a door (A) open. Player must stand on the plate in round 1, then in round 2 the echo holds the plate while the real player goes through the door to the portal.
- Layout:
  - Ground floor with a pressure plate A in the middle
  - A door A blocking access to the portal on the right
  - Portal behind the door
  - 1 star above the door area (requires good jump)
- Spawn: bottom-left (col 2, row 12)
- Switch A: col 10, row 12 (on ground level)
- Door A: col 18, rows 8-10 (vertical barrier, 3 tiles tall)
- Portal: col 22, row 12 (behind the door)
- Hint: "Stand on the switch, then press R to end the round. Your echo will hold it for you!"

Grid:
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 5:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 7:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,1]
Row 8:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,1]
Row 9:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,1]
Row 10: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,1]
Row 11: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 12: [1,0,16,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,15,0,1]
Row 13: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Level 3: "Twin Gates" — Two Switches, Two Echoes

```
- Size: 30 cols × 14 rows
- maxRounds: 3, parRounds: 3
- Concept: Two switches (A and B) each control a door. Need two echoes to hold both switches simultaneously.
- Layout:
  - Ground floor with switches A (left area) and B (right area)
  - Door A and Door B in sequence blocking path to portal
  - Some platforming to navigate between switches
  - 1 star in a tricky location requiring good platforming
- Spawn: col 2, row 12
- Switch A: col 8, row 12
- Switch B: col 18, row 12
- Door A: col 24, row 10-12
- Door B: col 26, row 10-12
- Portal: col 28, row 12
- Hint: "You'll need two echoes to hold both switches at once!"

Grid:
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 5:  [1,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 7:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 8:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 9:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 10: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,10,0,0,1]
Row 11: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,10,0,0,1]
Row 12: [1,0,16,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,9,0,10,0,15,1]
Row 13: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Level 4: "Laser Grid" — Echo Blocks Lasers

```
- Size: 28 cols × 14 rows
- maxRounds: 2, parRounds: 2
- Concept: A horizontal laser blocks the path. The player must record an echo standing in the laser's path, then on round 2 the echo blocks the laser while the player passes safely.
- Layout:
  - Ground with a laser emitter on left wall, beam crosses the middle
  - Platform above where echo needs to stand to block the beam
  - Path continues past the laser to the portal
  - 1 star floating above the laser beam
- Spawn: col 2, row 12
- Laser: emitter at col 0, row 8, fires rightward
- Blocking position: col 12, row 8 (a platform the echo must stand on)
- Portal: col 25, row 12
- Hint: "Your echo is immune to lasers. Use it as a shield!"

Grid:
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 5:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 7:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 8:  [13,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 9:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 10: [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 11: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 12: [1,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,1]
Row 13: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Level 5: "Vertigo" — Wall Jump Challenge

```
- Size: 20 cols × 20 rows (tall level)
- maxRounds: 2, parRounds: 1
- Concept: Vertical level. Wall jump up a shaft to reach the portal. One switch at the bottom, door near the top.
- Layout:
  - Tall vertical shaft with wall-jump surfaces on left and right walls
  - Switch A at the bottom
  - Door A near the top blocking the portal
  - Stars scattered along the wall-jump path
- Spawn: col 9, row 18
- Portal: col 9, row 2
- Hint: "Press toward a wall and jump to wall-jump! Climb the shaft!"

Grid (20x20):
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,9,9,9,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 5:  [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,2,0,0,0,17,0,0,0,3,0,0,0,0,0,1]
Row 7:  [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 8:  [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 9:  [1,0,0,0,0,2,0,17,0,0,0,0,0,3,0,0,0,0,0,1]
Row 10: [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 11: [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 12: [1,0,0,0,0,2,0,0,0,0,0,17,0,3,0,0,0,0,0,1]
Row 13: [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 14: [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 15: [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 16: [1,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,1]
Row 17: [1,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1]
Row 18: [1,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,5,0,0,1]
Row 19: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Level 6: "Crossfire" — Multiple Lasers + Echoes

```
- Size: 30 cols × 14 rows
- maxRounds: 3, parRounds: 3
- Concept: Two horizontal lasers at different heights. Need two echoes blocking two different lasers. Plus a switch to open the final door.
- Spawn: col 2, row 12
- Portal: col 27, row 12
- Hint: "Two lasers, two echoes. Plan your routes carefully!"

Grid:
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 5:  [13,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 7:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 8:  [1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,1]
Row 9:  [13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1]
Row 10: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,1]
Row 11: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,1]
Row 12: [1,0,16,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,9,0,0,15,0,1]
Row 13: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Level 7: "The Gauntlet" — All Mechanics Combined

```
- Size: 35 cols × 16 rows
- maxRounds: 4, parRounds: 3
- Concept: A multi-section level: laser section, switch section, wall-jump section, and timed platforming section. Requires 3 echoes to solve.
- Spawn: col 2, row 14
- Portal: col 32, row 4
- Hint: "Everything you've learned, all at once. Good luck!"

Grid:
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,15,0,1]
Row 5:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,2,0,3,0,0,0,1]
Row 7:  [13,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,3,0,0,0,1]
Row 8:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,2,0,3,0,0,0,1]
Row 9:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,3,0,0,0,1]
Row 10: [1,0,0,0,1,1,0,0,0,0,0,0,9,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1]
Row 11: [1,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 12: [1,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 13: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 14: [1,0,16,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 15: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Level 8: "Final Loop" — The Ultimate Challenge

```
- Size: 35 cols × 18 rows
- maxRounds: 5, parRounds: 4
- Concept: 4 switches (A, B, C, D) each controlling a door in a sequence. Need 4 echoes, one per switch. Complex multi-floor layout with lasers and wall-jumping sections.
- Spawn: col 2, row 16
- Portal: col 32, row 2
- Hint: "The final test. Four loops. Four echoes. One exit."

Grid:
Row 0:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
Row 1:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 2:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,1]
Row 3:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,1]
Row 4:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,1]
Row 5:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,1,1,1,1,1,1,0,1]
Row 6:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,1]
Row 7:  [1,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]
Row 8:  [1,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 9:  [1,0,0,0,9,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 10: [1,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 11: [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 12: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 13: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 14: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 15: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
Row 16: [1,0,16,0,0,5,0,0,0,0,6,0,0,0,0,0,7,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,1]
Row 17: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
```

### Acceptance Criteria — Sprint 5
- [ ] All 8 levels are defined as data objects with complete tile grids
- [ ] Each level loads and renders correctly
- [ ] Level progression is logical: each introduces or combines mechanics
- [ ] Star placements offer optional challenge
- [ ] Hints display at level start
- [ ] All switches, doors, lasers, portals are placed correctly per design

---

## Sprint 6: Particles & Audio

### Goal
Add a particle system for visual juice and procedural sound effects using the Web Audio API.

### File: `js/particles.js`

**ParticleSystem class**:
```
Constructor():
  - particles: []      — array of active particle objects
  - maxParticles: 500  — hard cap to prevent performance issues

Particle object:
{
  x, y,            — position
  vx, vy,          — velocity
  life,            — current life (counts down)
  maxLife,         — starting life (for alpha calculation)
  size,            — radius
  color,           — hex color string
  gravity,         — per-frame gravity (usually 0 or small positive)
  friction,        — velocity multiplier per frame (0.95-0.99)
  shape            — 'circle' | 'square' | 'star'
}

Method emit(type, x, y, options):
  switch type:
    'jump':
      Spawn 6 particles:
        color: NEON_CYAN, size: 2-4, life: 15-25
        velocity: spread downward (vx: random -2 to 2, vy: random 1 to 3)
        gravity: 0.1, friction: 0.95, shape: 'circle'
    
    'land':
      Spawn 8 particles:
        color: NEON_CYAN, size: 2-5, life: 12-20
        velocity: spread horizontally (vx: random -3 to 3, vy: random -1 to -3)
        gravity: 0.15, friction: 0.92, shape: 'circle'
    
    'death':
      Spawn 25 particles:
        color: NEON_CYAN, size: 2-6, life: 30-50
        velocity: burst circle (angle random 0-2PI, speed random 2-6)
        gravity: 0.05, friction: 0.97, shape: 'square'
    
    'wallJump':
      Spawn 5 particles:
        color: NEON_PURPLE, size: 2-4, life: 15-20
        velocity: away from wall (vx: ±2-4, vy: random -1 to -3)
        gravity: 0.1, friction: 0.95
    
    'portal':
      Spawn 2 particles (called every few frames for continuous effect):
        color: NEON_CYAN, size: 2-3, life: 30-50
        velocity: inward spiral (use angle based on frameCount)
        gravity: 0, friction: 0.98
    
    'starCollect':
      Spawn 12 particles:
        color: NEON_YELLOW, size: 2-5, life: 25-40
        velocity: burst circle, speed 2-5
        gravity: -0.03 (float upward), friction: 0.96, shape: 'star'
    
    'switchPress':
      Spawn 6 particles:
        color: NEON_GREEN, size: 2-4, life: 15-25
        velocity: upward spread (vx: random -2 to 2, vy: random -2 to -4)
        gravity: 0.08, friction: 0.95
    
    'echoTrail':
      Spawn 1 particle:
        color: echo's color, size: 3-5, life: 20-30
        velocity: near zero (vx/vy: random -0.3 to 0.3)
        gravity: -0.02 (float up), friction: 0.99

Method update():
  for each particle in particles (iterate backward for safe removal):
    p.vx *= p.friction
    p.vy *= p.friction
    p.vy += p.gravity
    p.x += p.vx
    p.y += p.vy
    p.life--
    if p.life <= 0: remove from array

Method render(ctx):
  for each particle:
    alpha = (p.life / p.maxLife) * 0.8   — fade out as life decreases
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    
    if p.shape == 'circle':
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    
    if p.shape == 'square':
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.life * 0.2)  — spin as they fly
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size)
      ctx.restore()
    
    if p.shape == 'star':
      drawMiniStar(ctx, p.x, p.y, p.size)  — 5-point star
    
    // Glow effect for larger particles
    if p.size > 3:
      ctx.shadowColor = p.color
      ctx.shadowBlur = p.size * 2
    
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
```

### File: `js/audio.js`

**AudioManager class** — all sounds are procedurally generated using Web Audio API oscillators and noise. No external audio files.

```
Constructor():
  - ctx: new (window.AudioContext || window.webkitAudioContext)()
  - masterGain: ctx.createGain(), connect to ctx.destination, gain.value = 0.3
  - enabled: true

Method play(soundName):
  if !enabled: return
  switch soundName:
  
    'jump':
      // Quick ascending tone
      osc = ctx.createOscillator(), type = 'sine'
      gain = ctx.createGain()
      osc.connect(gain), gain.connect(masterGain)
      osc.frequency: ramp from 300 to 600 over 0.08 seconds
      gain.gain: start 0.15, ramp to 0 over 0.1 seconds
      osc.start(now), osc.stop(now + 0.1)
    
    'wallJump':
      // Two-tone bounce: ascending then slight descend
      osc type 'triangle', freq ramp 200→500→400 over 0.12s
      gain 0.12 → 0, duration 0.15s
    
    'land':
      // Short thud: low frequency noise burst
      osc type 'sine', freq 80, gain 0.1 → 0 over 0.06s
    
    'death':
      // Descending buzz
      osc type 'sawtooth', freq ramp 400→80 over 0.4s
      gain 0.15 → 0 over 0.5s
      // Add second osc for dissonance: square wave, freq 350→60
    
    'switchPress':
      // Satisfying click/ding
      osc type 'sine', freq 800, gain 0.1 → 0 over 0.1s
      Second osc: freq 1200, delay 0.03s, gain 0.08 → 0 over 0.08s
    
    'portal':
      // Warm ascending chord
      Three oscs: sine at 400, 500, 600 Hz
      Each gain 0.06, fade over 0.3s
      Slight freq ramp upward (+100 each) over duration
    
    'star':
      // Bright chime: high pitched ding
      osc type 'sine', freq 1000→1400 over 0.15s
      gain 0.1 → 0 over 0.2s
      Second osc: freq 1500→1800, delay 0.05s, same envelope
    
    'roundEnd':
      // Whoosh + ding
      Noise burst (create BufferSource with random samples), gain 0.08 → 0 over 0.2s
      Osc sine 600→900 with delay 0.1s, gain 0.1 → 0 over 0.2s
    
    'levelComplete':
      // Victory fanfare: ascending arpeggiated chord
      Notes: 523, 659, 784, 1047 Hz (C5, E5, G5, C6)
      Each delayed by 0.1s from previous
      Osc type 'sine', gain 0.1, fade over 0.3s each
    
    'menuHover':
      // Subtle tick
      osc type 'sine', freq 500, gain 0.05 → 0 over 0.03s
    
    'menuSelect':
      // Confirm beep
      osc type 'sine', freq 700→900 over 0.08s, gain 0.1 → 0 over 0.1s

Method toggle():
  enabled = !enabled
  masterGain.gain.value = enabled ? 0.3 : 0

Method resume():
  // Required for autoplay policy: call on first user interaction
  if ctx.state === 'suspended': ctx.resume()
```

### Acceptance Criteria — Sprint 6
- [ ] Particles emit on: jump, land, death, wall jump, portal, star collect, switch press
- [ ] Particles fade out, obey gravity/friction, respect max count
- [ ] All 10 sound effects play correctly via Web Audio API
- [ ] Sounds are short, snappy, and satisfying
- [ ] Audio can be toggled on/off
- [ ] No external audio files — all procedurally generated

---

## Sprint 7: UI — Menus, HUD, Overlays

### Goal
Build all UI screens using HTML/CSS overlays on top of the canvas. Glassmorphism aesthetic with neon accents and smooth transitions.

### File: `js/ui.js`

**UI class**:

```
Constructor(game):
  - game: reference to main Game object
  - uiLayer: document.getElementById('ui-layer')
  - Create all screens as HTML elements, initially hidden (display: none)

Screens to create (all as children of #ui-layer):

1. MAIN MENU (#menu-screen):
   Layout:
   - Background: full-screen, the canvas shows animated stars behind it
   - Title: "ECHO ARENA" in Orbitron font, 64px, white, with neon cyan text-shadow glow
   - Subtitle: "A TIME LOOP PLATFORMER" in Inter, 16px, TEXT_SECONDARY, letter-spacing 4px
   - Animated echo effect on title: duplicate text behind at slight offset with NEON_PURPLE, pulsing opacity
   - Buttons (vertically stacked, centered):
     - "▶ PLAY" — large, primary button
     - "◧ CONTROLS" — secondary button  
     - "♫ SOUND: ON" — toggle button
   - Footer: "ARROW KEYS / WASD TO MOVE • SPACE TO JUMP • R TO END ROUND" in 12px TEXT_MUTED
   - Decorative: floating particles or subtle animated lines in background
   
   Button style (all menu buttons):
   - Background: GLASS_BG with backdrop-filter blur(10px)
   - Border: 1px solid GLASS_BORDER
   - border-radius: 12px
   - padding: 16px 48px
   - font: Orbitron, 18px
   - color: TEXT_PRIMARY
   - Hover: border-color → NEON_CYAN, box-shadow 0 0 20px NEON_CYAN 0.3, transform scale(1.05)
   - Active: scale(0.98)
   - Transition: all 0.2s ease

2. LEVEL SELECT (#levelselect-screen):
   Layout:
   - Title: "SELECT LEVEL" in Orbitron, 36px
   - Grid: 4 columns × 2 rows of level cards
   - Each level card:
     - Size: ~180px × 120px
     - Background: GLASS_BG, border: GLASS_BORDER, border-radius: 12px
     - Level number: large Orbitron, 28px
     - Level name: Inter, 14px, TEXT_SECONDARY
     - Stars: 3 star icons below (filled NEON_YELLOW if earned, outline TEXT_MUTED if not)
     - Locked state: if previous level not completed, show lock icon, opacity 0.4, not clickable
     - Completed state: subtle NEON_GREEN border glow
     - Hover (if unlocked): scale(1.05), border-color NEON_CYAN, glow
   - Back button: "← BACK" in top-left
   - First level always unlocked

3. IN-GAME HUD (rendered on canvas, not HTML):
   - Top-left: Level name in Orbitron 16px, TEXT_SECONDARY
   - Top-center: "ROUND X / Y" in Orbitron 20px, NEON_CYAN
   - Top-right: "ECHOES: N" with small ghost icons
   - Bottom-center (first 120 frames of level): Hint text fading in then out
   - Stars collected indicator: top-right below echoes
   - "R - End Round" prompt pulsing subtly at bottom-right
   - "ESC - Pause" at bottom-left in small TEXT_MUTED

4. ROUND END OVERLAY (#roundend-screen):
   - Glassmorphism panel centered on screen
   - "ROUND COMPLETE" title in Orbitron, NEON_GREEN
   - "Echo #{N} created" subtitle
   - Ghost icon with echo color, fade-in animation
   - "NEXT ROUND →" button (primary style)
   - "↺ RETRY ROUND" button (secondary)
   - Auto-dismiss after 2 seconds if player presses nothing (optional: require click)

5. LEVEL COMPLETE OVERLAY (#levelcomplete-screen):
   - Larger glassmorphism panel
   - "LEVEL COMPLETE!" in Orbitron, 36px, NEON_CYAN, with glow
   - Stars earned: 3 large star icons, animate in one by one with scale bounce
     - 3 stars: completed in parRounds or fewer
     - 2 stars: completed in parRounds + 1
     - 1 star: completed in more rounds
   - Stats: "Rounds Used: X" "Stars Collected: X/X"
   - "NEXT LEVEL →" button
   - "↩ LEVEL SELECT" button
   - Confetti/particle burst animation behind panel

6. PAUSE OVERLAY (#pause-screen):
   - Semi-transparent dark overlay
   - "PAUSED" in Orbitron, 48px, centered
   - "RESUME" button
   - "RESTART LEVEL" button
   - "LEVEL SELECT" button
   - "♫ SOUND: ON/OFF" toggle

7. CONTROLS OVERLAY (#controls-screen):
   - Glassmorphism panel
   - "CONTROLS" title
   - Visual key layout:
     - Arrow keys / WASD → Move
     - Space / W / ↑ → Jump
     - R → End Round (creates echo)
     - ESC → Pause
   - Diagram showing: "Round 1: Record → Round 2: Echo replays + You play → Reach Portal"
   - "GOT IT!" button
```

### CSS additions to `style.css`

```css
/* Glassmorphism base */
.glass-panel {
    background: rgba(26, 33, 71, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 32px;
}

/* Screen overlays */
.screen-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 10;
}

/* Buttons */
.btn {
    background: rgba(26, 33, 71, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 14px 40px;
    font-family: 'Orbitron', sans-serif;
    font-size: 16px;
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
    text-transform: uppercase;
    letter-spacing: 2px;
}
.btn:hover {
    border-color: #00f5ff;
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.05);
    transform: scale(1.05);
    color: #00f5ff;
}
.btn:active {
    transform: scale(0.98);
}
.btn-primary {
    border-color: #00f5ff;
    background: rgba(0, 245, 255, 0.1);
}

/* Title glow animation */
@keyframes titleGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.2); }
    50% { text-shadow: 0 0 30px rgba(0, 245, 255, 0.8), 0 0 60px rgba(0, 245, 255, 0.4); }
}

.game-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 64px;
    font-weight: 900;
    color: #e2e8f0;
    animation: titleGlow 3s ease-in-out infinite;
    letter-spacing: 6px;
}

/* Level card */
.level-card {
    background: rgba(26, 33, 71, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    width: 180px;
}
.level-card:hover:not(.locked) {
    transform: translateY(-4px) scale(1.03);
    border-color: #00f5ff;
    box-shadow: 0 8px 30px rgba(0, 245, 255, 0.2);
}
.level-card.locked {
    opacity: 0.35;
    cursor: not-allowed;
}
.level-card.completed {
    border-color: rgba(0, 255, 136, 0.4);
}

/* Star icons */
.star { font-size: 20px; margin: 0 2px; }
.star.earned { color: #ffd700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.5); }
.star.empty { color: #475569; }

/* Fade-in animation */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fadeIn 0.3s ease forwards; }

/* Scale-in for modals */
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}
.scale-in { animation: scaleIn 0.25s ease forwards; }

/* Star bounce animation for level complete */
@keyframes starBounce {
    0% { transform: scale(0); }
    60% { transform: scale(1.3); }
    100% { transform: scale(1); }
}
```

### ⚠️ Common UI Pitfalls to Avoid
- **Do NOT use plain browser-default buttons**: Every button must use the `.btn` class with glassmorphism styling. Default gray browser buttons are unacceptable.
- **Do NOT forget backdrop-filter**: The frosted glass effect is core to the aesthetic. Without it, panels look like flat dark rectangles.
- **Do NOT skip hover animations**: Every interactive element must respond to hover with glow, scale, or color change. Static buttons feel dead.
- **Do NOT use default fonts**: All text must use Orbitron or Inter. If Google Fonts fail to load, the game should still look acceptable with sans-serif fallback.
- **Do NOT make the UI layer block canvas clicks**: The `#ui-layer` has `pointer-events: none` by default, and only direct children re-enable it. Hidden screens should have `display: none`, not just `opacity: 0`.
- **Do NOT forget to handle screen transitions**: Showing/hiding screens should use the fade transition system from Sprint 1 (`startTransition`), not instant display toggle.

### Acceptance Criteria — Sprint 7
- [ ] Main menu renders with animated title, glowing buttons, and background
- [ ] Level select shows 8 cards in a 4×2 grid with lock/unlock/complete states
- [ ] In-game HUD shows round counter, echo count, level name, hint text
- [ ] Round end overlay shows echo creation with continue/retry options
- [ ] Level complete overlay shows star rating with bounce animation
- [ ] Pause menu works with resume, restart, and exit options
- [ ] Controls screen explains all mechanics clearly
- [ ] All screens use glassmorphism panels with smooth transitions
- [ ] Sound toggle works from both menu and pause screens
- [ ] All buttons have hover/active animations with glow effects
- [ ] No browser-default styling visible anywhere (no default buttons, no system fonts, no unstyled scrollbars)

---

## Sprint 8: Integration, Polish & Final Testing

### Goal
Wire everything together, add final polish, handle edge cases, ensure localStorage persistence, and verify all 8 levels are playable from start to finish.

### Tasks

1. **Wire up the complete game flow**:
   - Menu → Level Select → Playing → Round End → Playing → Level Complete → Next Level / Level Select
   - All transitions use the fade system (20 frames out, callback, 20 frames in)
   - First user click/keypress calls `audio.resume()` for autoplay policy

2. **Round end flow (critical path)**:
   ```
   When player presses R during PLAYING state:
     1. Save player.getRecording() to game.recordings array
     2. game.currentRound++
     3. If currentRound > maxRounds: show "Too many rounds! Restarting..." and restart level
     4. Show ROUND_END overlay for 1.5s or until player clicks "Next Round"
     5. Create Echo instances from ALL recordings (not just latest)
     6. Reset player to spawn position with fresh recording
     7. Reset level dynamic elements (switches/doors)
     8. Resume PLAYING state
   ```

3. **Level complete flow**:
   ```
   When level.update() returns 'COMPLETE':
     1. Calculate stars: roundsUsed <= parRounds → 3 stars, +1 → 2 stars, else → 1 star
     2. Add bonus star if all level stars collected
     3. Mark level as completed in levelProgress
     4. Unlock next level
     5. Save to localStorage
     6. Show LEVEL_COMPLETE overlay with star animation
     7. Player can choose "Next Level" or "Level Select"
   ```

4. **Death and restart**:
   ```
   When player dies:
     1. Emit death particles, play death sound, screen shake
     2. After 45 frames: respawn player at level spawn
     3. Replay current round's recordings from the beginning
     4. All echoes restart their playback from frame 0
     5. Level dynamic elements reset
   ```

5. **Background animated stars** (visible behind all screens):
   ```
   - Generate 80 background star points on init: { x, y, size (0.5-2), twinkleSpeed, twinkleOffset }
   - Render: small circles with TEXT_MUTED color, alpha oscillating with sin(frameCount * twinkleSpeed + twinkleOffset)
   - Draw BEFORE any camera transform (screen-space, not world-space)
   ```

6. **Responsive canvas scaling**:
   ```
   - On resize: scale = min(window.innerWidth / CANVAS.WIDTH, window.innerHeight / CANVAS.HEIGHT) * 0.95
   - Apply via canvas.style.width/height (CSS scaling, not canvas resolution change)
   - Center with flexbox on #game-container
   ```

7. **drawRoundedRect helper** (add to utils.js):
   ```javascript
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
   ```

8. **drawStar helper** (add to utils.js):
   ```javascript
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
   ```

9. **Edge cases to handle**:
   - Player falls below level bounds → die()
   - Echo goes off-screen → still simulate but don't render if far from camera
   - Recording array gets very long (>3600 frames = 60 seconds) → auto-end round
   - All echoes finish their recording → they just stand still at their last position
   - Browser tab loses focus → pause the game automatically (visibilitychange event)
   - Multiple rapid key presses → debounce state transitions

10. **Performance optimizations**:
    - Only render tiles visible within the camera viewport (frustum culling)
    - Particle count hard cap at 500
    - Reuse objects instead of creating new ones in hot path
    - Use `ctx.save()`/`ctx.restore()` efficiently

11. **Final localStorage save structure**:
    ```javascript
    // Key: 'echoArena_progress'
    // Value: JSON array of booleans, e.g., [true, true, false, false, false, false, false, false]
    
    // Key: 'echoArena_stars'  
    // Value: JSON array of numbers (0-3), e.g., [3, 2, 0, 0, 0, 0, 0, 0]
    ```

### ⚠️ Integration Checklist — Things That WILL Break If You Don't Check
1. **Echo replay drift**: If Player and Echo use different physics code (or physics has any randomness), echoes will drift from their recorded path. Test by recording a round, then watching the echo — it MUST follow the exact same path.
2. **Switch timing**: Echoes must press switches at the exact same frame the player did. If doors open/close at wrong times, the player can't pass through.
3. **Laser blocking**: The echo's bounding box must overlap the laser beam's collision rect. Off-by-one-pixel errors here make levels unsolvable.
4. **Portal activation**: The portal ONLY activates when ALL switches are pressed simultaneously. If any switch is not pressed (because an echo's recording ended), the portal stays locked.
5. **Round overflow**: If currentRound exceeds maxRounds, the level should restart, NOT soft-lock.
6. **Death during echo replay**: When the player dies, ALL echoes must restart from frame 0, not continue from where they were.
7. **Audio autoplay policy**: Browsers block audio until user interaction. The first click/keypress MUST call `audio.resume()`. Without this, all sounds will silently fail.
8. **Canvas scaling vs resolution**: Scale via `canvas.style.width/height` (CSS), NOT by changing `canvas.width/height` (which clears the canvas and changes resolution).

### Acceptance Criteria — Sprint 8
- [ ] Complete game flow works: Menu → Level Select → Play → Complete → Next
- [ ] All 8 levels are playable and solvable using the echo mechanic
- [ ] Echoes replay accurately and interact with all level elements — verified by watching echo paths match player paths
- [ ] Stars award correctly based on round count vs par
- [ ] Progress saves to localStorage and persists across browser close/reopen
- [ ] Death respawns correctly, restarting all echoes from frame 0
- [ ] Background stars animate on all screens (menu, level select, playing, pause)
- [ ] Game pauses automatically on browser tab switch (visibilitychange event)
- [ ] Canvas scales responsively to any window size without distortion
- [ ] No console errors during normal gameplay (check DevTools)
- [ ] Consistent 60fps performance with up to 4 echoes and 300+ particles
- [ ] All particle effects and sounds fire at the correct moments
- [ ] First click/keypress resumes AudioContext (browser autoplay policy)
- [ ] Game feels polished, premium, and visually impressive — not like a student project

---

## Quick Reference: How Echoes + Rounds Work (For Implementer)

This is the core mechanic — get this right and everything else follows.

```
LEVEL START (Round 0):
  - Player spawns at SPAWN tile
  - No echoes exist
  - Player moves freely. All inputs recorded frame-by-frame.
  - Player presses R → endRound()

ROUND END:
  - Recording saved: recordings.push(player.getRecording())
  - currentRound becomes 1

ROUND 1 START:
  - Player respawns at SPAWN
  - Echo #0 created from recordings[0], starts replaying from frame 0
  - Echo #0 moves exactly as the player did in round 0
  - Player makes new inputs (also recorded)
  - Player presses R → endRound()

ROUND 2 START:
  - Player respawns at SPAWN
  - Echo #0 from recordings[0], Echo #1 from recordings[1]
  - Both echoes replay simultaneously from frame 0
  - Player makes new inputs
  - This time, the portal may be reachable (switches held by echoes, lasers blocked by echoes)
  - Player reaches portal → LEVEL COMPLETE

KEY INSIGHT: Every round, ALL echoes start replaying from frame 0 simultaneously.
The player always starts fresh at the spawn point.
The world resets (switches unpressed, doors closed) at the start of each round.
Echoes interact with switches and lasers but cannot die.
```

---

## Appendix: Rendering Order (Z-Index)

Draw in this order each frame (back to front):

1. Background gradient (screen-space)
2. Background stars (screen-space)
3. **Apply camera transform**
4. Level background tiles (empty space grid lines)
5. Level platforms, walls
6. Level interactive elements: switches, doors (closed), moving platforms
7. Level hazards: spikes, laser emitters
8. Laser beams
9. Stars (collectibles)
10. Portal
11. Echo trails (particles)
12. Echoes
13. Player trail
14. Player
15. Particles (general)
16. **Reset camera transform**
17. HUD (screen-space)
18. Overlays/Menus (HTML layer)
19. Screen transition fade (screen-space)
