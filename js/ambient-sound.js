/**
 * MAHAVEER — Studio Ambience Soundscape
 * Generates subtle analog vinyl crackle & warm studio room drone using Web Audio API.
 */

class StudioAmbienceEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.crackleNode = null;

    this.toggleBtn = document.getElementById("ambientSoundToggle");
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => this.toggle());
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  createVinylCrackle() {
    // Generate pink/brown crackle noise buffer
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise filter
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      // Add periodic random crackle pops
      const crackle = Math.random() > 0.998 ? (Math.random() * 0.4) : 0;
      output[i] = (lastOut * 0.06) + crackle;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;

    const crackleGain = this.audioCtx.createGain();
    crackleGain.gain.value = 0.15;

    whiteNoise.connect(filter);
    filter.connect(crackleGain);
    crackleGain.connect(this.gainNode);

    whiteNoise.start();
    return whiteNoise;
  }

  createWarmDrone() {
    // Warm 110Hz (A2) + 165Hz (E3) subtle harmonic drone
    this.droneOsc1 = this.audioCtx.createOscillator();
    this.droneOsc1.type = "sine";
    this.droneOsc1.frequency.setValueAtTime(110, this.audioCtx.currentTime);

    this.droneOsc2 = this.audioCtx.createOscillator();
    this.droneOsc2.type = "triangle";
    this.droneOsc2.frequency.setValueAtTime(164.81, this.audioCtx.currentTime);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 350;

    const droneGain = this.audioCtx.createGain();
    droneGain.gain.value = 0.08;

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.gainNode);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  start() {
    this.initAudio();
    this.isPlaying = true;
    this.crackleNode = this.createVinylCrackle();
    this.createWarmDrone();

    // Smooth fade in
    this.gainNode.gain.exponentialRampToValueAtTime(0.35, this.audioCtx.currentTime + 1.5);

    if (this.toggleBtn) {
      this.toggleBtn.classList.add("playing");
      this.toggleBtn.querySelector(".ambient-btn-text").textContent = "Ambience: On";
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.8);
      setTimeout(() => {
        if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); }
        if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); }
        if (this.crackleNode) { this.crackleNode.stop(); this.crackleNode.disconnect(); }
      }, 900);
    }

    if (this.toggleBtn) {
      this.toggleBtn.classList.remove("playing");
      this.toggleBtn.querySelector(".ambient-btn-text").textContent = "Studio Ambience";
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.studioAmbience = new StudioAmbienceEngine();
});
