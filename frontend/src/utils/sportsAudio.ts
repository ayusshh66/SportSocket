// Web Audio API Procedural Sports Sound & Ambience Engine
// Delivers instant, high-fidelity sport-specific sound effects & continuous stadium atmosphere

class SportsAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private currentSport: string | null = null;
  private activeAmbientNodes: { stop: () => void }[] = [];
  private onStateChangeListeners: ((state: { isMuted: boolean; volume: number; currentSport: string | null; isPlaying: boolean }) => void)[] = [];

  constructor() {
    // Lazy init audio context on first user interaction
    const savedMuted = localStorage.getItem('sportsocket_audio_muted');
    if (savedMuted !== null) {
      this.isMuted = savedMuted === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribeState(listener: (state: { isMuted: boolean; volume: number; currentSport: string | null; isPlaying: boolean }) => void) {
    this.onStateChangeListeners.push(listener);
    this.notifyState();
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyState() {
    const state = {
      isMuted: this.isMuted,
      volume: this.volume,
      currentSport: this.currentSport,
      isPlaying: this.activeAmbientNodes.length > 0 && !this.isMuted,
    };
    this.onStateChangeListeners.forEach((l) => l(state));
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('sportsocket_audio_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.notifyState();
    return this.isMuted;
  }

  public setMute(mute: boolean) {
    this.initContext();
    this.isMuted = mute;
    localStorage.setItem('sportsocket_audio_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.notifyState();
  }

  public setVolume(vol: number) {
    this.initContext();
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notifyState();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSport(): string | null {
    return this.currentSport;
  }

  // --- Noise Buffer Utility for Crowd Roar & Stadium Ambience ---
  private createNoiseBuffer(durationSeconds = 4): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    // Pink noise filter approximation for natural stadium acoustic warmth
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  // --- Play Instant Sport Impact Sound on Match Click ---
  public playSportMatchSound(sportName: string) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const normalized = sportName.toLowerCase();

      if (normalized.includes('football') || normalized.includes('soccer')) {
        this.playFootballWhistleAndCrowd();
      } else if (normalized.includes('cricket')) {
        this.playCricketBatShotAndCheer();
      } else if (normalized.includes('basket')) {
        this.playBasketballSqueakAndBounce();
      } else if (normalized.includes('tennis')) {
        this.playTennisRacketThwack();
      } else if (normalized.includes('esport') || normalized.includes('gaming')) {
        this.playEsportsSound();
      } else {
        this.playGenericSportCheer();
      }

      // Switch ambient background loop to this sport
      this.startSportAmbience(sportName);
    } catch (e) {
      console.warn('Could not play sports audio SFX:', e);
    }
  }

  // --- 1. FOOTBALL SFX: Whistle burst + stadium roar ---
  private playFootballWhistleAndCrowd() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Dual-tone whistle oscillator
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(2650, now);
    osc1.frequency.exponentialRampToValueAtTime(2950, now + 0.05);
    osc1.frequency.exponentialRampToValueAtTime(2700, now + 0.18);

    osc2.frequency.setValueAtTime(2780, now);
    osc2.frequency.exponentialRampToValueAtTime(3080, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2820, now + 0.18);

    whistleGain.gain.setValueAtTime(0, now);
    whistleGain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    whistleGain.gain.setValueAtTime(0.22, now + 0.14);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(whistleGain);
    osc2.connect(whistleGain);
    whistleGain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);

    // Second whistle burst (typical referee cadence: tweet-tweet!)
    const now2 = now + 0.14;
    const osc3 = this.ctx.createOscillator();
    const whistleGain2 = this.ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(2750, now2);
    osc3.frequency.exponentialRampToValueAtTime(3100, now2 + 0.06);
    osc3.frequency.exponentialRampToValueAtTime(2800, now2 + 0.25);

    whistleGain2.gain.setValueAtTime(0, now2);
    whistleGain2.gain.linearRampToValueAtTime(0.28, now2 + 0.02);
    whistleGain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.3);

    osc3.connect(whistleGain2);
    whistleGain2.connect(this.sfxGain);
    osc3.start(now2);
    osc3.stop(now2 + 0.32);

    // Stadium Crowd Surge
    this.playCrowdSurge(0.35, 1.8);
  }

  // --- 2. CRICKET SFX: Willow wood bat punch + ball strike + crowd clap ---
  private playCricketBatShotAndCheer() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Fast wood resonant punch (FM tone)
    const osc = this.ctx.createOscillator();
    const hitGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    hitGain.gain.setValueAtTime(0.7, now);
    hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(hitGain);
    hitGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);

    // Wood 'thwack' click noise
    const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const nData = noiseBuf.getChannelData(0);
    for (let i = 0; i < nData.length; i++) nData[i] = Math.random() * 2 - 1;
    const nSrc = this.ctx.createBufferSource();
    nSrc.buffer = noiseBuf;
    const bFilter = this.ctx.createBiquadFilter();
    bFilter.type = 'bandpass';
    bFilter.frequency.setValueAtTime(1800, now);
    bFilter.Q.setValueAtTime(3, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.5, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    nSrc.connect(bFilter);
    bFilter.connect(nGain);
    nGain.connect(this.sfxGain);
    nSrc.start(now);

    // Crowd cheer following the boundary
    this.playCrowdSurge(0.4, 2.0);
  }

  // --- 3. BASKETBALL SFX: Sneaker squeak on polished hardwood + heavy ball bounce ---
  private playBasketballSqueakAndBounce() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Hardwood sneaker squeak (rapid frequency slide)
    const squeakOsc = this.ctx.createOscillator();
    const squeakGain = this.ctx.createGain();
    squeakOsc.type = 'sawtooth';
    squeakOsc.frequency.setValueAtTime(1800, now);
    squeakOsc.frequency.linearRampToValueAtTime(2600, now + 0.06);
    squeakOsc.frequency.linearRampToValueAtTime(1400, now + 0.12);

    const squeakFilter = this.ctx.createBiquadFilter();
    squeakFilter.type = 'bandpass';
    squeakFilter.frequency.setValueAtTime(2200, now);
    squeakFilter.Q.setValueAtTime(4.0, now);

    squeakGain.gain.setValueAtTime(0.2, now);
    squeakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    squeakOsc.connect(squeakFilter);
    squeakFilter.connect(squeakGain);
    squeakGain.connect(this.sfxGain);

    squeakOsc.start(now);
    squeakOsc.stop(now + 0.14);

    // Deep Basketball Floor Dribble Thud
    const bounceOsc = this.ctx.createOscillator();
    const bounceGain = this.ctx.createGain();
    bounceOsc.type = 'sine';
    bounceOsc.frequency.setValueAtTime(120, now + 0.08);
    bounceOsc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    bounceGain.gain.setValueAtTime(0, now);
    bounceGain.gain.setValueAtTime(0.55, now + 0.08);
    bounceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    bounceOsc.connect(bounceGain);
    bounceGain.connect(this.sfxGain);
    bounceOsc.start(now + 0.08);
    bounceOsc.stop(now + 0.3);

    // Arena echo
    this.playCrowdSurge(0.25, 1.4);
  }

  // --- 4. TENNIS SFX: Fast string impact + court bounce ---
  private playTennisRacketThwack() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);

    // Soft crowd clap
    this.playCrowdSurge(0.2, 1.2);
  }

  // --- 5. ESPORTS SFX: Futuristic laser ping + arena blast ---
  public playEsportsSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Laser / Headshot synth zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Hype chime
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(587.33, now + 0.05); // D5
    chime.frequency.setValueAtTime(880, now + 0.12); // A5
    chimeGain.gain.setValueAtTime(0.3, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(now + 0.05);
    chime.stop(now + 0.38);

    // Arena roar
    this.playCrowdSurge(0.35, 1.8);
  }

  // --- 6. FAN REACTION SFX: Satisfying bubble pop ---
  public playReactionPop() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Fast pitch sweep (bubble pop sound)
      osc.frequency.setValueAtTime(400 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(900 + Math.random() * 300, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  // --- 7. 1-CLICK QUICK ACTION PUBLISH SFX ---
  public playQuickActionSound() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Two-note success chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5

      osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
      osc2.frequency.setValueAtTime(1046.5, now + 0.16); // C6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.4);

      this.playCrowdSurge(0.2, 1.0);
    } catch {
      // ignore
    }
  }

  // --- 8. Generic sport / fallback ping ---
  private playGenericSportCheer() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.32);
    this.playCrowdSurge(0.25, 1.5);
  }

  // Crowd surge burst helper
  private playCrowdSurge(peakVolume = 0.3, duration = 1.5) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const buf = this.createNoiseBuffer(duration);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(1400, now + duration * 0.4);
    filter.frequency.linearRampToValueAtTime(400, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(peakVolume, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  // --- CONTINUOUS SPORT AMBIENCE GENERATOR ---
  public startSportAmbience(sportName: string) {
    try {
      this.initContext();
      if (!this.ctx || !this.ambientGain) return;

      this.currentSport = sportName;
      this.stopAmbience();

      const normalized = sportName.toLowerCase();
      let filterFreq = 650;
      let lfoRate = 0.25;

      if (normalized.includes('football') || normalized.includes('soccer')) {
        filterFreq = 800; // Wide open stadium roar
        lfoRate = 0.18;
      } else if (normalized.includes('cricket')) {
        filterFreq = 600; // Sunlit open grounds murmur
        lfoRate = 0.22;
      } else if (normalized.includes('basket')) {
        filterFreq = 950; // Indoor echoing arena resonance
        lfoRate = 0.35;
      } else if (normalized.includes('tennis')) {
        filterFreq = 500; // Focused court acoustic
        lfoRate = 0.15;
      } else if (normalized.includes('esport') || normalized.includes('gaming')) {
        filterFreq = 1100; // High energy electronic arena
        lfoRate = 0.4;
      }

      // 1. Noise Generator for Crowd Bed
      const noiseBuffer = this.createNoiseBuffer(5);
      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      // 2. Low-Pass Filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

      // 3. LFO to gently modulate crowd waves (rise and fall)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(lfoRate, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
      lfo.connect(filter.frequency);

      // 4. Subtle Harmonic Drone (stadium PA / crowd hum)
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
      droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      // Ambient gain ramp in
      const nodeGain = this.ctx.createGain();
      nodeGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      nodeGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.2);

      noiseSrc.connect(filter);
      filter.connect(nodeGain);
      droneOsc.connect(droneGain);
      droneGain.connect(nodeGain);
      nodeGain.connect(this.ambientGain);

      noiseSrc.start();
      lfo.start();
      droneOsc.start();

      this.activeAmbientNodes = [
        {
          stop: () => {
            try {
              noiseSrc.stop();
              lfo.stop();
              droneOsc.stop();
              noiseSrc.disconnect();
              lfo.disconnect();
              droneOsc.disconnect();
            } catch {
              // ignore
            }
          },
        },
      ];

      this.notifyState();
    } catch (e) {
      console.warn('Could not start sport ambience:', e);
    }
  }

  public stopAmbience() {
    this.activeAmbientNodes.forEach((node) => node.stop());
    this.activeAmbientNodes = [];
    this.notifyState();
  }
}

export const sportsAudio = new SportsAudioEngine();
