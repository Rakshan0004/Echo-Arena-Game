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
            { name: 'Alan Walker - Spectre', url: 'https://archive.org/download/AlanWalkerSpectreNCSRelease_201612/Alan%20Walker%20-%20Spectre%20%5BNCS%20Release%5D.mp3' },
            { name: 'Cartoon - On & On', url: 'https://archive.org/download/CartoonOnOnfeat.DanielLeviNCSRelease/Cartoon%20-%20On%20%20On%20%28feat.%20Daniel%20Levi%29%20%5BNCS%20Release%5D.mp3' }
        ];
        
        this.currentTrackIndex = 0; // 0 = None
        this.audio = null;
        this.volume = 0.25;
        this.fadeInterval = null;
        this.isPlaying = false;
    }
    
    /**
     * Play a track by index. Index 0 = None (stops music).
     */
    play(trackIndex) {
        // Stop current track
        this.stop();
        
        this.currentTrackIndex = trackIndex;
        const track = this.tracks[trackIndex];
        
        if (!track || !track.url) {
            this.isPlaying = false;
            return;
        }
        
        this.audio = new Audio(track.url);
        this.audio.loop = true;
        this.audio.volume = 0; // Start silent for fade-in
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.fadeIn();
        }).catch(err => {
            console.warn('Music playback failed:', err);
            this.isPlaying = false;
        });
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
