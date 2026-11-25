const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const storagePath = path.resolve(__dirname, "../js/storage.js");
const defaults = {
  bestScore: 0,
  gamesPlayed: 0,
  bestStreak: 0,
  difficulty: "normal",
  soundEnabled: true
};

function setup(initial) {
  const values = new Map();
  if (typeof initial === "string") values.set("memoryColors", initial);
  else if (initial !== undefined) values.set("memoryColors", JSON.stringify(initial));
  globalThis.window = globalThis;
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  delete require.cache[require.resolve(storagePath)];
  require(storagePath);
  return { storage: globalThis.GameStorage, values };
}

test("devuelve los valores por defecto cuando no hay datos guardados", () => {
  const { storage } = setup();
  assert.deepEqual(storage.get(), defaults);
});

test("carga valores guardados válidos", () => {
  const saved = { bestScore: 120, gamesPlayed: 4, bestStreak: 8, difficulty: "hard", soundEnabled: false };
  const { storage } = setup(saved);
  assert.deepEqual(storage.get(), saved);
});

test("sanea valores inválidos o corruptos", () => {
  const { storage } = setup({
    bestScore: -5,
    gamesPlayed: "muchos",
    bestStreak: 2.9,
    difficulty: "imposible",
    soundEnabled: "si"
  });
  assert.deepEqual(storage.get(), { ...defaults, bestStreak: 2 });
});

test("usa los valores por defecto si el JSON no se puede parsear", () => {
  const { storage } = setup("{json roto");
  assert.deepEqual(storage.get(), defaults);
});

test("update aplica y sanea los cambios, y los persiste", () => {
  const { storage, values } = setup();
  storage.update({ difficulty: "hard", soundEnabled: false, bestScore: -10 });
  assert.deepEqual(storage.get(), { ...defaults, difficulty: "hard", soundEnabled: false });
  assert.deepEqual(JSON.parse(values.get("memoryColors")), storage.get());
});

test("finishGame acumula partidas y conserva los récords", () => {
  const { storage } = setup({ bestScore: 40, gamesPlayed: 2, bestStreak: 3 });
  const first = storage.finishGame(75, 5);
  assert.deepEqual(first, { bestScore: 75, gamesPlayed: 3, bestStreak: 5, difficulty: "normal", soundEnabled: true });
  const second = storage.finishGame(10, 1);
  assert.deepEqual(second, { bestScore: 75, gamesPlayed: 4, bestStreak: 5, difficulty: "normal", soundEnabled: true });
});

test("no lanza error si localStorage falla al guardar", () => {
  const { storage } = setup();
  globalThis.localStorage.setItem = () => { throw new Error("sin espacio"); };
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    assert.doesNotThrow(() => storage.update({ soundEnabled: false }));
  } finally {
    console.warn = originalWarn;
  }
});
