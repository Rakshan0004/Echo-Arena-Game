/**
 * music.js — Background Music Manager
 * 
 * Manages streaming background music tracks via HTML5 Audio:
 *  - MusicManager — handles loading, playing, pausing, and volume control for BGM.
 *  - Tracks are streamed from external URLs (no local files needed).
 *  - Supports track switching, looping, and fade-in/fade-out transitions.
 *  - Default state: no music playing (user opt-in).
 */
class MusicManager {
    constructor() {
        this.tracks = [
            { name: 'None', url: null },
            { name: 'Alan Walker - Faded', url: 'https://archive.org/download/Faded/Faded.mp3' },
            { name: 'Kanye West - Stronger', url: 'https://archive.org/download/kanye-west-stronger_202603/Kanye%20West%20-%20Stronger.mp3' },
            { name: 'Cartoon - On & On', url: 'https://archive.org/download/CartoonOnOnfeat.DanielLeviNCSRelease/Cartoon%20-%20On%20%20On%20%28feat.%20Daniel%20Levi%29%20%5BNCS%20Release%5D.mp3' },
            { name: 'Elektronomia - Sky High', url: 'https://archive.org/download/ElektronomiaSkyHigh/Elektronomia%20-%20Sky%20High.mp3' },
            { name: 'Syn Cole - Feel Good', url: 'https://archive.org/download/SynColeFeelGoodNCSRelease_201612/Syn%20Cole%20-%20Feel%20Good%20%5BNCS%20Release%5D.mp3' }
        ];
        
        this.currentTrackIndex = 0; // 0 = None
        this.audio = null;
        this.volume = 0.8;
        this.fadeInterval = null;
        this.isPlaying = false;
        this.isLoading = false;
        this.onStateChange = null; // Callback for UI updates
    }
    
    /**
     * Play a track by index. Index 0 = None (stops music).
     */
    play(trackIndex) {
        // If same track is playing, don't restart, just ensure it's playing
        if (this.currentTrackIndex === trackIndex && this.audio) {
            if (this.audio.paused) {
                this.audio.play();
                this.isPlaying = true;
                if (this.onStateChange) this.onStateChange();
            }
            return;
        }

        // Stop current track
        this.stop();
        
        this.currentTrackIndex = trackIndex;
        const track = this.tracks[trackIndex];
        
        if (!track || !track.url) {
            this.isPlaying = false;
            this.isLoading = false;
            if (this.onStateChange) this.onStateChange();
            return;
        }
        
        this.isLoading = true;
        if (this.onStateChange) this.onStateChange();
        
        this.audio = new Audio(track.url);
        this.audio.volume = 0; // Start silent for fade-in
        
        // Listeners for UI state
        this.audio.addEventListener('playing', () => {
            this.isLoading = false;
            this.isPlaying = true;
            if (this.onStateChange) this.onStateChange();
        });
        
        this.audio.addEventListener('waiting', () => {
            this.isLoading = true;
            if (this.onStateChange) this.onStateChange();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            if (this.onStateChange) this.onStateChange();
        });
        
        // Auto-play next track
        this.audio.addEventListener('ended', () => {
            if (this.currentTrackIndex > 0) {
                let nextIdx = this.currentTrackIndex + 1;
                if (nextIdx >= this.tracks.length) {
                    nextIdx = 1; // Loop back to track 1
                }
                this.play(nextIdx);
            }
        });

        this.audio.play().then(() => {
            this.fadeIn();
        }).catch(err => {
            console.warn('Music playback failed:', err);
            this.isPlaying = false;
            this.isLoading = false;
            if (this.onStateChange) this.onStateChange();
        });
    }

    togglePause() {
        if (!this.audio || this.currentTrackIndex === 0) return;
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }
    
    /**
     * Stop the current track with a fade-out.
     */
    stop() {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        
        if (this.audio) {
            // Quick fade out
            const audio = this.audio;
            const fadeOut = setInterval(() => {
                if (audio.volume > 0.02) {
                    audio.volume = Math.max(0, audio.volume - 0.05);
                } else {
                    audio.volume = 0;
                    audio.pause();
                    audio.src = '';
                    clearInterval(fadeOut);
                }
            }, 30);
            this.audio = null;
        }
        
        this.isPlaying = false;
    }
    
    /**
     * Fade in the current audio to the target volume.
     */
    fadeIn() {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        
        this.fadeInterval = setInterval(() => {
            if (this.audio && this.audio.volume < this.volume - 0.01) {
                this.audio.volume = Math.min(this.volume, this.audio.volume + 0.01);
            } else {
                if (this.audio) this.audio.volume = this.volume;
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
        }, 30);
    }
    
    /**
     * Set the volume (0.0 to 1.0).
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.audio && this.isPlaying) {
            this.audio.volume = this.volume;
        }
    }
    
    /**
     * Cycle to the next track.
     */
    nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.play(nextIndex);
        return this.tracks[nextIndex].name;
    }
    
    /**
     * Get the current track name.
     */
    getCurrentTrackName() {
        return this.tracks[this.currentTrackIndex].name;
    }
    
    /**
     * Mute/unmute without stopping.
     */
    setMuted(muted) {
        if (this.audio) {
            this.audio.muted = muted;
        }
    }
}
