(() => {
  const frequencies = { green: 329.63, red: 261.63, yellow: 392.00, blue: 523.25 };
  const volume = 0.7;
  let context = null;
  let enabled = true;

  function getContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) context = new AudioContextClass();
    if (context.state === "suspended") context.resume();
    return context;
  }

  function play(color, duration = 260) {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencies[color] || 440, now);
    gain.gain.setValueAtTime(Math.max(0.001, volume * 0.18), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  }

  function error() {
    if (!enabled) return;
    const ctx = getContext();
    if (!ctx) return;
    [180, 130].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.16;
      oscillator.type = "sawtooth";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume * 0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(start); oscillator.stop(start + 0.14);
    });
  }

  window.GameAudio = {
    play, error,
    setEnabled(value) { enabled = Boolean(value); }
  };
})();
