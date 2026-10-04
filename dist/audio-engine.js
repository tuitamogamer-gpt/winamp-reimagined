/** Original, offline demo music and local-file playback for the player. */
const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const midi = note => 440 * Math.pow(2, (note - 69) / 12);
const noop = () => {};

function seconds(value) {
  if (typeof value === 'string' && value.includes(':')) {
    return value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  }
  return Number(value) || 0;
}

function hash(value) {
  let result = 2166136261;
  for (const character of String(value)) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

export class AudioEngine {
  constructor({ onTime = noop, onEnded = noop, onState = noop, onError = noop } = {}) {
    this.onTime = onTime;
    this.onEnded = onEnded;
    this.onState = onState;
    this.onError = onError;
    this._track = null;
    this._context = null;
    this._audio = null;
    this._mediaSource = null;
    this._playing = false;
    this._offset = 0;
    this._duration = 0;
    this._volume = 0.7;
    this._eq = Array(10).fill(0);
    this._eqEnabled = true;
    this._voices = new Set();
    this._spectrum = new Uint8Array(128);
    this._loadToken = 0;
    this._playToken = 0;
    this._timer = null;
  }

  get duration() {
    return this._audio && Number.isFinite(this._audio.duration) ? this._audio.duration : this._duration;
  }

  get currentTime() {
    if (this._audio) return this._audio.currentTime || 0;
    if (this._playing && this._context) {
      return clamp(this._offset + this._context.currentTime - this._startedAt, 0, this.duration);
    }
    return this._offset;
  }

  get isPlaying() { return this._playing; }

  async load(track) {
    this.pause();
    const token = ++this._loadToken;
    this._cancelLoad?.();
    this._cancelLoad = null;
    if (this._audio) {
      this._audio.pause();
      this._audio.removeAttribute('src');
      this._audio.load();
    }
    this._mediaSource?.disconnect();
    this._mediaSource = null;
    this._audio = null;
    this._track = track;
    this._offset = 0;
    this._duration = Math.max(1, seconds(track?.duration) || 218);
    this._seed = hash(track?.seed ?? track?.id ?? track?.title ?? 'nova');
    this._bpm = 86 + (this._seed % 19);
    this._stepLength = 30 / this._bpm;
    this._key = [45, 47, 48, 50, 52][this._seed % 5];
    this._emitTime();
    if (!track?.src) return;

    const audio = new Audio();
    this._audio = audio;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('ended', () => {
      if (token === this._loadToken) this._finish();
    });
    audio.addEventListener('durationchange', () => {
      if (token === this._loadToken) this._emitTime();
    });

    try {
      await new Promise((resolve, reject) => {
        let settled = false;
        let timeout;
        const finish = error => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          audio.removeEventListener('loadedmetadata', ready);
          audio.removeEventListener('error', fail);
          if (token === this._loadToken) this._cancelLoad = null;
          error ? reject(error) : resolve();
        };
        const ready = () => finish();
        const fail = () => finish(new Error('This audio file could not be opened. Try an MP3, WAV, or OGG file.'));
        this._cancelLoad = () => finish();
        audio.addEventListener('loadedmetadata', ready);
        audio.addEventListener('error', fail);
        timeout = setTimeout(() => finish(new Error('The audio file took too long to load. Please try again.')), 15000);
        audio.src = track.src;
        audio.load();
      });
      if (token !== this._loadToken) return;
      audio.addEventListener('error', () => {
        if (token !== this._loadToken) return;
        this.pause();
        this.onError(new Error('Audio playback was interrupted. Please choose another file.'));
      });
      this._emitTime();
    } catch (error) {
      if (token === this._loadToken) this.onError(error);
      throw error;
    }
  }

  async play() {
    if (!this._track || this._playing) return;
    const token = ++this._playToken;
    try {
      this._ensureContext();
      if (this._context.state !== 'running') await this._context.resume();
      if (token !== this._playToken) return;
      if (this._audio) {
        if (!this._mediaSource) {
          this._mediaSource = this._context.createMediaElementSource(this._audio);
          this._mediaSource.connect(this._input);
        }
        if (this._audio.ended) this._audio.currentTime = 0;
        await this._audio.play();
        if (token !== this._playToken) return;
      } else {
        if (this._offset >= this.duration) this._offset = 0;
        this._startedAt = this._context.currentTime + 0.035;
        this._nextStep = Math.ceil(this._offset / this._stepLength);
        this._demoOutput.gain.cancelScheduledValues(this._context.currentTime);
        this._demoOutput.gain.setTargetAtTime(0.78, this._context.currentTime, 0.015);
        if (this._nextStep % 16 !== 0) {
          this._pad(this._chord(Math.floor(this._nextStep / 16)), this._startedAt, this._stepLength * 8);
        }
      }
      this._playing = true;
      this.onState(true);
      this._tick();
      this._timer = setInterval(() => this._tick(), 50);
    } catch (error) {
      if (token !== this._playToken) return;
      this._playing = false;
      this.onState(false);
      this.onError(error instanceof Error ? error : new Error('Unable to start audio playback.'));
      throw error;
    }
  }

  pause() {
    ++this._playToken;
    this._offset = this.currentTime;
    this._audio?.pause();
    const wasPlaying = this._playing;
    this._playing = false;
    clearInterval(this._timer);
    this._timer = null;
    this._stopVoices();
    if (this._context && this._demoOutput) {
      this._demoOutput.gain.cancelScheduledValues(this._context.currentTime);
      this._demoOutput.gain.setTargetAtTime(0, this._context.currentTime, 0.015);
    }
    if (wasPlaying) this.onState(false);
    this._emitTime();
  }

  seek(position) {
    const value = clamp(Number(position) || 0, 0, this.duration);
    if (this._audio) {
      try { this._audio.currentTime = value; } catch (_) { /* Metadata may still be loading. */ }
      this._emitTime();
      return;
    }
    this._offset = value;
    if (this._playing) {
      this._stopVoices();
      this._startedAt = this._context.currentTime + 0.025;
      this._nextStep = Math.ceil(value / this._stepLength);
      if (value < this.duration && this._nextStep % 16 !== 0) {
        this._pad(this._chord(Math.floor(this._nextStep / 16)), this._startedAt, this._stepLength * 8);
      }
      this._tick();
    }
    this._emitTime();
  }

  setVolume(value) {
    this._volume = clamp(Number(value) || 0, 0, 1);
    if (this._context) this._master.gain.setTargetAtTime(this._volume, this._context.currentTime, 0.025);
  }

  setEq(gains) {
    this._eq = EQ_FREQUENCIES.map((_, index) => clamp(Number(gains?.[index]) || 0, -12, 12));
    this._applyEq();
  }

  setEqEnabled(enabled) {
    this._eqEnabled = Boolean(enabled);
    this._applyEq();
  }

  getFrequencyData() {
    if (this._analyser) this._analyser.getByteFrequencyData(this._spectrum);
    return this._spectrum;
  }

  destroy() {
    this.pause();
    ++this._loadToken;
    this._cancelLoad?.();
    if (this._audio) {
      this._audio.removeAttribute('src');
      this._audio.load();
    }
    this._mediaSource?.disconnect();
    this._context?.close();
    this._audio = null;
    this._context = null;
    this._track = null;
  }

  _ensureContext() {
    if (this._context) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error('Web Audio is not supported by this browser.');
    const context = this._context = new Context();
    this._input = context.createGain();
    this._filters = EQ_FREQUENCIES.map((frequency, index) => {
      const filter = context.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === 9 ? 'highshelf' : 'peaking';
      filter.frequency.value = Math.min(frequency, context.sampleRate * 0.45);
      filter.Q.value = 1.05;
      return filter;
    });
    let previous = this._input;
    for (const filter of this._filters) { previous.connect(filter); previous = filter; }
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.22;
    this._analyser = context.createAnalyser();
    this._analyser.fftSize = 256;
    this._analyser.smoothingTimeConstant = 0.78;
    this._master = context.createGain();
    this._master.gain.value = this._volume;
    previous.connect(compressor);
    compressor.connect(this._analyser);
    this._analyser.connect(this._master);
    this._master.connect(context.destination);
    this._demoOutput = context.createGain();
    this._demoOutput.gain.value = 0;
    this._demoOutput.connect(this._input);
    this._synth = context.createGain();
    this._synth.connect(this._demoOutput);

    // A quiet stereo room gives the original demo a little air.
    const reverb = context.createConvolver();
    const impulse = context.createBuffer(2, Math.floor(context.sampleRate * 1.65), context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      let rng = 419 + channel;
      for (let index = 0; index < data.length; index++) {
        rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
        data[index] = (rng / 2147483648 - 1) * Math.pow(1 - index / data.length, 3);
      }
    }
    reverb.buffer = impulse;
    const wet = context.createGain();
    wet.gain.value = 0.16;
    this._synth.connect(reverb);
    reverb.connect(wet);
    wet.connect(this._demoOutput);
    this._noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const noise = this._noise.getChannelData(0);
    let rng = 7127;
    for (let index = 0; index < noise.length; index++) {
      rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
      noise[index] = rng / 2147483648 - 1;
    }
    this._applyEq();
  }

  _applyEq() {
    if (!this._context) return;
    this._filters.forEach((filter, index) => {
      filter.gain.setTargetAtTime(this._eqEnabled ? this._eq[index] : 0, this._context.currentTime, 0.025);
    });
  }

  _emitTime() { this.onTime(this.currentTime, this.duration); }

  _finish() {
    this.pause();
    this._offset = this.duration;
    this._emitTime();
    this.onEnded();
  }

  _tick() {
    if (!this._playing) return;
    if (this.currentTime >= this.duration) { this._finish(); return; }
    if (!this._audio) {
      const horizon = this.currentTime + 0.25;
      while (this._nextStep * this._stepLength < horizon) {
        const position = this._nextStep * this._stepLength;
        const time = this._startedAt + position - this._offset;
        if (position < this.duration && time >= this._context.currentTime - 0.02) this._scheduleStep(this._nextStep, Math.max(this._context.currentTime, time));
        this._nextStep++;
      }
    }
    this._emitTime();
  }

  _chord(bar) {
    const progression = [[0, 3, 7, 10], [-5, 0, 3, 7], [3, 7, 10, 14], [-2, 2, 5, 9]];
    return progression[bar % 4].map(note => this._key + note);
  }

  _scheduleStep(step, time) {
    const local = step % 16;
    const bar = Math.floor(step / 16);
    const chord = this._chord(bar);
    if (local === 0) this._pad(chord, time, this._stepLength * 16);
    const melody = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 3, 1, 2, 3, 1, 2];
    if (local !== 7 && local !== 15) {
      const note = chord[melody[(local + this._seed % 4) % 16]] + 12;
      this._tone(note, time, this._stepLength * 1.4, local % 2 ? 0.035 : 0.053, 'sine', 0.012, 2300);
      if (local % 4 === 0) this._tone(note + 12, time, this._stepLength, 0.012, 'triangle', 0.01, 3200);
    }
    if ([0, 6, 8, 14].includes(local)) this._tone(chord[0] - 12, time, this._stepLength * 1.65, 0.25, 'triangle', 0.016, 230);
    if ([0, 6, 8].includes(local)) this._kick(time, local === 6 ? 0.68 : 1);
    if (local === 4 || local === 12) this._noiseHit(time, 'snare', 0.095);
    this._noiseHit(time, 'hat', local % 2 ? 0.024 : 0.042);
    if (local === 15 && bar % 4 === 3) this._noiseHit(time + this._stepLength * 0.5, 'hat', 0.025);
  }

  _pad(chord, time, duration) {
    chord.forEach((note, index) => {
      this._tone(note + 12, time + index * 0.012, duration + 0.5, 0.027, 'triangle', 0.28, 1150, index % 2 ? 4 : -4);
    });
  }

  _tone(note, time, duration, level, type, attack, cutoff, detune = 0) {
    const context = this._context;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.value = midi(note);
    oscillator.detune.value = detune;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.Q.value = 0.5;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + Math.min(attack, duration * 0.25));
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this._synth);
    this._register(oscillator, () => { filter.disconnect(); envelope.disconnect(); });
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
  }

  _kick(time, strength) {
    const context = this._context;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.frequency.setValueAtTime(135, time);
    oscillator.frequency.exponentialRampToValueAtTime(43, time + 0.13);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(0.48 * strength, time + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.36);
    oscillator.connect(envelope);
    envelope.connect(this._demoOutput);
    this._register(oscillator, () => envelope.disconnect());
    oscillator.start(time);
    oscillator.stop(time + 0.38);
  }

  _noiseHit(time, type, level) {
    const context = this._context;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    const duration = type === 'hat' ? 0.065 : 0.17;
    source.buffer = this._noise;
    filter.type = type === 'hat' ? 'highpass' : 'bandpass';
    filter.frequency.value = type === 'hat' ? 7800 : 1800;
    filter.Q.value = type === 'hat' ? 0.6 : 0.8;
    envelope.gain.setValueAtTime(level, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this._demoOutput);
    this._register(source, () => { filter.disconnect(); envelope.disconnect(); });
    source.start(time);
    source.stop(time + duration + 0.01);
  }

  _register(source, cleanup) {
    this._voices.add(source);
    source.onended = () => {
      source.disconnect();
      cleanup();
      this._voices.delete(source);
    };
  }

  _stopVoices() {
    for (const source of this._voices) {
      try { source.stop(); } catch (_) { /* A scheduled source may already have ended. */ }
      source.disconnect();
    }
    this._voices.clear();
  }
}
