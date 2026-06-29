class AudioManager {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3; // Global volume
        
        this.enabled = true;
        
        // Resume audio context on first interaction (browser requirement)
        window.addEventListener('keydown', () => this.resume(), {once: true});
        window.addEventListener('click', () => this.resume(), {once: true});
    }
    
    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    play(soundName) {
        if (!this.enabled) return;
        const now = this.ctx.currentTime;
        
        if (soundName === 'jump') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (soundName === 'wallJump') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(500, now + 0.06);
            osc.frequency.linearRampToValueAtTime(400, now + 0.12);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.15);
        }
        else if (soundName === 'land') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(80, now);
            
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
            
            osc.start(now);
            osc.stop(now + 0.06);
        }
        else if (soundName === 'death') {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc2.type = 'square';
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
            
            osc2.frequency.setValueAtTime(350, now);
            osc2.frequency.exponentialRampToValueAtTime(60, now + 0.4);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            
            osc.start(now);
            osc2.start(now);
            osc.stop(now + 0.5);
            osc2.stop(now + 0.5);
        }
        else if (soundName === 'switchPress') {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc2.type = 'sine';
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(800, now);
            osc2.frequency.setValueAtTime(1200, now + 0.03); // slight delay for ding
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc2.start(now + 0.03);
            osc.stop(now + 0.1);
            osc2.stop(now + 0.13);
        }
        else if (soundName === 'star') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            osc.start(now);
            osc.stop(now + 0.2);
        }
        else if (soundName === 'portal') {
            // Three-note chord playing and fading
            [400, 500, 600].forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.linearRampToValueAtTime(freq + 100, now + 0.3);
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3 + (index * 0.1));
                
                osc.start(now);
                osc.stop(now + 0.4 + (index * 0.1));
            });
        }
    }
}
