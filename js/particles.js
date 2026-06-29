class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500; // Cap to prevent performance drops
    }
    
    emit(type, x, y, options = {}) {
        if (this.particles.length > this.maxParticles) return;
        
        switch (type) {
            case 'jump':
                for (let i = 0; i < 6; i++) {
                    this.particles.push({
                        x: x, y: y,
                        vx: randRange(-2, 2), vy: randRange(1, 3),
                        life: randRange(15, 25), maxLife: 25,
                        size: randRange(2, 4), color: COLORS.NEON_CYAN,
                        gravity: 0.1, friction: 0.95, shape: 'circle'
                    });
                }
                break;
                
            case 'land':
                for (let i = 0; i < 8; i++) {
                    this.particles.push({
                        x: x, y: y,
                        vx: randRange(-3, 3), vy: randRange(-1, -3),
                        life: randRange(12, 20), maxLife: 20,
                        size: randRange(2, 5), color: COLORS.NEON_CYAN,
                        gravity: 0.15, friction: 0.92, shape: 'circle'
                    });
                }
                break;
                
            case 'death':
                for (let i = 0; i < 25; i++) {
                    const angle = randRange(0, Math.PI * 2);
                    const speed = randRange(2, 6);
                    this.particles.push({
                        x: x, y: y,
                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                        life: randRange(30, 50), maxLife: 50,
                        size: randRange(2, 6), color: COLORS.NEON_CYAN,
                        gravity: 0.05, friction: 0.97, shape: 'square'
                    });
                }
                break;
                
            case 'wallJump':
                for (let i = 0; i < 5; i++) {
                    const dir = options.facing || 1;
                    this.particles.push({
                        x: x, y: y,
                        vx: randRange(2, 4) * dir, vy: randRange(-1, -3),
                        life: randRange(15, 20), maxLife: 20,
                        size: randRange(2, 4), color: COLORS.NEON_PURPLE,
                        gravity: 0.1, friction: 0.95, shape: 'circle'
                    });
                }
                break;
                
            case 'portal':
                for (let i = 0; i < 2; i++) {
                    const angle = randRange(0, Math.PI * 2);
                    const radius = randRange(10, 20);
                    this.particles.push({
                        x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius,
                        vx: -Math.cos(angle) * 0.5, vy: -Math.sin(angle) * 0.5,
                        life: randRange(30, 50), maxLife: 50,
                        size: randRange(2, 3), color: COLORS.NEON_CYAN,
                        gravity: 0, friction: 0.98, shape: 'circle'
                    });
                }
                break;
                
            case 'starCollect':
                for (let i = 0; i < 12; i++) {
                    const angle = randRange(0, Math.PI * 2);
                    const speed = randRange(2, 5);
                    this.particles.push({
                        x: x, y: y,
                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                        life: randRange(25, 40), maxLife: 40,
                        size: randRange(2, 5), color: COLORS.NEON_YELLOW,
                        gravity: -0.03, friction: 0.96, shape: 'star'
                    });
                }
                break;
                
            case 'switchPress':
                for (let i = 0; i < 6; i++) {
                    this.particles.push({
                        x: x + randRange(-8, 8), y: y,
                        vx: randRange(-2, 2), vy: randRange(-2, -4),
                        life: randRange(15, 25), maxLife: 25,
                        size: randRange(2, 4), color: COLORS.NEON_GREEN,
                        gravity: 0.08, friction: 0.95, shape: 'square'
                    });
                }
                break;
                
            case 'echoTrail':
                this.particles.push({
                    x: x + randRange(-5, 5), y: y + randRange(-5, 5),
                    vx: randRange(-0.3, 0.3), vy: randRange(-0.3, 0.3),
                    life: randRange(20, 30), maxLife: 30,
                    size: randRange(3, 5), color: options.color || COLORS.NEON_PURPLE,
                    gravity: -0.02, friction: 0.99, shape: 'circle'
                });
                break;
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const p of this.particles) {
            const alpha = (p.life / p.maxLife) * 0.8;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            
            if (p.size > 3) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.size * 2;
            }
            
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'square') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.life * 0.2);
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            } else if (p.shape === 'star') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.life * 0.1);
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*p.size, -Math.sin((18+i*72)/180*Math.PI)*p.size);
                    ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*(p.size/2.5), -Math.sin((54+i*72)/180*Math.PI)*(p.size/2.5));
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
    }
}
