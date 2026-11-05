/**
 * Procedural Web Audio Engine
 * Generates tactile physical clicks, cybernetic hums, and UI feedback
 * with ZERO external audio files or network requests.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('java_ai_audio_muted') === 'true';
    this.humGain = null;
    this.humOsc1 = null;
    this.humOsc2 = null;
    this.isHumming = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.setupAmbientHum();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('java_ai_audio_muted', this.isMuted);
    if (this.humGain && this.ctx) {
      this.humGain.gain.setValueAtTime(this.isMuted ? 0 : 0.025, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Subtle mechanical switch / button click
  playClick(pitch = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    const t = this.ctx.currentTime;
    
    // Tiny burst of filtered noise
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * pitch, t);
    filter.Q.value = 3.0;

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Cybernetic hover chirp
  playHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.03);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Mode change / heavy tactile relay switch
  playModeSwitch(isVirtual = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Relay latch click
    this.playClick(isVirtual ? 1.4 : 0.7);

    // Servo / frequency sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isVirtual ? 'sawtooth' : 'triangle';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isVirtual ? 1200 : 350, t);

    const startFreq = isVirtual ? 200 : 600;
    const endFreq = isVirtual ? 850 : 150;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Thread burst / particle launch sound
  playBurst(intensity = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(1400 * intensity, t + 0.08);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Subtle background JVM reactor hum (very quiet, warm ambient)
  setupAmbientHum() {
    if (!this.ctx || this.isHumming) return;
    this.isHumming = true;

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(this.isMuted ? 0 : 0.015, this.ctx.currentTime);

    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sine';
    this.humOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'triangle';
    this.humOsc2.frequency.setValueAtTime(110, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, this.ctx.currentTime);

    this.humOsc1.connect(filter);
    this.humOsc2.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.ctx.destination);

    this.humOsc1.start();
    this.humOsc2.start();
  }
}

export const sound = new SoundEngine();

