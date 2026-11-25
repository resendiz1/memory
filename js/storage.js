(() => {
  const KEY = "memoryColors";
  const difficulties = ["easy", "normal", "hard"];
  const defaults = {
    bestScore: 0, gamesPlayed: 0, bestStreak: 0,
    difficulty: "normal", soundEnabled: true
  };

  function toCounter(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
  }

  function sanitize(input) {
    const saved = input && typeof input === "object" && !Array.isArray(input) ? input : {};
    return {
      bestScore: toCounter(saved.bestScore, defaults.bestScore),
      gamesPlayed: toCounter(saved.gamesPlayed, defaults.gamesPlayed),
      bestStreak: toCounter(saved.bestStreak, defaults.bestStreak),
      difficulty: difficulties.includes(saved.difficulty) ? saved.difficulty : defaults.difficulty,
      soundEnabled: typeof saved.soundEnabled === "boolean" ? saved.soundEnabled : defaults.soundEnabled
    };
  }

  function load() {
    try {
      return sanitize(JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch {
      return { ...defaults };
    }
  }

  let data = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (error) { console.warn("No se pudo guardar la partida:", error); }
  }

  window.GameStorage = {
    get: () => ({ ...data }),
    update(patch) {
      data = sanitize({ ...data, ...(patch && typeof patch === "object" ? patch : {}) });
      save();
      return this.get();
    },
    finishGame(score, round) {
      data = sanitize({
        ...data,
        gamesPlayed: data.gamesPlayed + 1,
        bestScore: Math.max(data.bestScore, toCounter(score)),
        bestStreak: Math.max(data.bestStreak, toCounter(round))
      });
      save();
      return this.get();
    }
  };
})();
