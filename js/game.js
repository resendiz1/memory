(() => {
  const $ = (selector) => document.querySelector(selector);
  const pads = [...document.querySelectorAll(".pad")];
  const roundEl = $("#round"), scoreEl = $("#score"), bestEl = $("#best-score");
  const statusEl = $("#status"), turnPill = $("#turn-pill");
  const progressText = $("#progress-text"), progressFill = $("#progress-fill");
  const startButton = $("#start-button"), difficultySelect = $("#difficulty");
  const hint = $("#hint"), soundToggle = $("#sound-toggle");
  const modal = $("#result-modal");

  const settings = {
    easy: { first: 2, flash: 650, gap: 260 },
    normal: { first: 1, flash: 470, gap: 190 },
    hard: { first: 1, flash: 300, gap: 110 }
  };
  const colors = ["green", "red", "yellow", "blue"];
  let sequence = [], inputIndex = 0, round = 0, score = 0;
  let acceptingInput = false, playingSequence = false, gameActive = false;
  let soundEnabled = true, runToken = 0;

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function getConfig() { return settings[difficultySelect.value] || settings.normal; }
  function updateStats() {
    const data = GameStorage.get();
    bestEl.textContent = data.bestScore;
    $("#games-played").textContent = data.gamesPlayed;
    $("#best-streak").textContent = data.bestStreak;
  }
  function updateProgress() {
    progressText.textContent = `${inputIndex} / ${sequence.length}`;
    progressFill.style.width = sequence.length ? `${inputIndex / sequence.length * 100}%` : "0%";
  }
  function setStatus(message, mode = "EN ESPERA") {
    statusEl.textContent = message;
    turnPill.textContent = mode;
  }
  function setPadsDisabled(disabled) {
    pads.forEach(pad => { pad.disabled = disabled; });
  }
  async function flash(color, duration, token = runToken) {
    if (token !== runToken) return;
    const pad = pads.find(item => item.dataset.color === color);
    if (!pad) return;
    pad.classList.add("active");
    GameAudio.play(color, duration);
    await wait(duration);
    pad.classList.remove("active");
  }
  async function showSequence() {
    const token = runToken;
    playingSequence = true;
    acceptingInput = false;
    setPadsDisabled(true);
    setStatus("Observa la secuencia...", "OBSERVA");
    const config = getConfig();
    await wait(550);
    for (const color of sequence) {
      if (token !== runToken) return;
      await flash(color, config.flash, token);
      await wait(config.gap);
    }
    if (token !== runToken) return;
    playingSequence = false;
    acceptingInput = true;
    setPadsDisabled(false);
    setStatus("¡Tu turno! Repite la secuencia.", "TU TURNO");
    hint.textContent = "Pulsa los colores en el mismo orden.";
  }
  function addColor() {
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    inputIndex = 0;
    updateProgress();
  }
  async function nextRound(token = runToken) {
    if (!gameActive || token !== runToken) return;
    round += 1;
    roundEl.textContent = round;
    addColor();
    await showSequence();
  }
  async function startGame() {
    runToken++;
    sequence = []; inputIndex = 0; round = 0; score = 0;
    gameActive = true; playingSequence = false; acceptingInput = false;
    if (!modal.hidden) {
      modal.hidden = true;
      startButton.focus();
    }
    roundEl.textContent = "0"; scoreEl.textContent = "0";
    startButton.innerHTML = "↻ <span>Reiniciar</span>";
    difficultySelect.disabled = true;
    hint.textContent = "Concéntrate y memoriza los colores.";
    const config = getConfig();
    setPadsDisabled(true);
    setStatus("Preparando la primera secuencia...", "PREPARANDO");
    for (let i = 0; i < config.first; i++) sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    round = 1; roundEl.textContent = round;
    updateProgress();
    await showSequence();
  }
  async function handlePad(color) {
    if (!gameActive || !acceptingInput || playingSequence) return;
    const token = runToken;
    acceptingInput = false;
    const expected = sequence[inputIndex];
    if (color !== expected) {
      const clickedPad = pads.find(p => p.dataset.color === color);
      GameAudio.error();
      clickedPad?.classList.add("active");
      await wait(180);
      if (!gameActive || token !== runToken) {
        clickedPad?.classList.remove("active");
        return;
      }
      pads.forEach(p => p.classList.remove("active"));
      endGame();
      return;
    }
    const config = getConfig();
    await flash(color, Math.min(config.flash, 180), token);
    if (!gameActive || token !== runToken) return;
    inputIndex++;
    score += 10;
    scoreEl.textContent = score;
    updateProgress();
    if (inputIndex === sequence.length) {
      score += 20;
      scoreEl.textContent = score;
      setStatus("¡Correcto! Preparando siguiente ronda...", "¡BIEN!");
      hint.textContent = "Cada ronda añade un nuevo color.";
      await wait(500);
      if (gameActive && token === runToken) await nextRound(token);
    } else {
      acceptingInput = true;
      setStatus("¡Bien! Continúa...", "TU TURNO");
    }
  }
  function endGame() {
    gameActive = false; acceptingInput = false; playingSequence = false;
    runToken++;
    setPadsDisabled(true);
    pads.forEach(p => p.classList.remove("active"));
    const previousBest = GameStorage.get().bestScore;
    const data = GameStorage.finishGame(score, round);
    const isNewRecord = score > previousBest && score > 0;
    updateStats();
    difficultySelect.disabled = false;
    startButton.innerHTML = "▶ <span>Jugar de nuevo</span>";
    setStatus("Secuencia incorrecta.", "FIN DEL JUEGO");
    hint.textContent = "¡Buen intento! Vuelve a probar.";
    $("#final-score").innerHTML = `${score} <span>puntos</span>`;
    $("#result-detail").textContent = `Llegaste a la ronda ${round}. ${isNewRecord ? "¡Nuevo récord!" : `Tu récord es ${data.bestScore} puntos.`}`;
    $("#result-title").textContent = score > 0 ? "¡Buen intento!" : "¡No te rindas!";
    modal.hidden = false;
    $("#play-again").focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    startButton.focus();
  }
  function handleModalKeydown(event) {
    if (modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function syncSoundToggle() {
    soundToggle.classList.toggle("muted", !soundEnabled);
    soundToggle.textContent = soundEnabled ? "♫" : "♪";
    soundToggle.setAttribute("aria-label", soundEnabled ? "Desactivar sonido" : "Activar sonido");
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  }

  pads.forEach(pad => pad.addEventListener("click", () => handlePad(pad.dataset.color)));
  startButton.addEventListener("click", startGame);
  $("#play-again").addEventListener("click", startGame);
  $("#close-modal").addEventListener("click", closeModal);
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", handleModalKeydown);
  difficultySelect.addEventListener("change", () => GameStorage.update({ difficulty: difficultySelect.value }));
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    GameAudio.setEnabled(soundEnabled);
    syncSoundToggle();
    GameStorage.update({ soundEnabled });
  });

  const saved = GameStorage.get();
  if (!settings[saved.difficulty]) {
    GameStorage.update({ difficulty: "normal" });
    saved.difficulty = "normal";
  }
  difficultySelect.value = saved.difficulty;
  soundEnabled = saved.soundEnabled;
  GameAudio.setEnabled(soundEnabled);
  syncSoundToggle();
  updateStats();
  updateProgress();
  setPadsDisabled(true);
})();
