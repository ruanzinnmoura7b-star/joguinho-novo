// ─────────────────────────────────────────────────────────────
//  Joguinho da Raynara ❤️
// ─────────────────────────────────────────────────────────────

// ── MENSAGENS FINAIS ──────────────────────────────────────────
// Troque à vontade — é sua voz que importa aqui.

const finalMessages = [
  "Então. Você chegou até aqui.",
  "Passou pelos corações, pelas estrelas, segurou aquele botão irritante — e ainda ficou tentando uma senha que, sinceramente, nunca existiu.",
  "Eu fiz tudo isso porque queria ver você persistir por algo completamente sem sentido só porque era meu.",
  "E você foi.",
  "Ray, você é a parte do meu dia que eu espero sem perceber. A pessoa que eu quero contar quando algo ruim acontece, e quando algo bom também.",
  "Não tem jeito mais bonito de dizer isso. Eu só te amo muito. ❤️"
];

// ─────────────────────────────────────────────────────────────

// ── ESTADO ───────────────────────────────────────────────────

let score = 0;
let time = 30;
let phase = 1;

let timerInterval  = null;
let itemInterval   = null;
let holdInterval   = null;
let bgHeartInterval = null;

let passwordAttempts = 0;
let holdProgress     = 0;
let patienceTrolled  = false;
let finalIndex       = 0;

// ── ESTRELAS DE FUNDO ─────────────────────────────────────────

(function createStars() {
  const container = document.getElementById("stars");
  for (let i = 0; i < 80; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.cssText = `
      left: ${Math.random() * 100}vw;
      top:  ${Math.random() * 100}vh;
      width:  ${Math.random() * 2 + 1}px;
      height: ${Math.random() * 2 + 1}px;
      --dur: ${(Math.random() * 4 + 2).toFixed(1)}s;
      --op:  ${(Math.random() * 0.5 + 0.25).toFixed(2)};
      animation-delay: ${(Math.random() * 5).toFixed(1)}s;
    `;
    container.appendChild(star);
  }
})();

// ── CORAÇÕES FLUTUANDO AO FUNDO ───────────────────────────────

function startBgHearts() {
  if (bgHeartInterval) return;
  bgHeartInterval = setInterval(() => spawnHeart("floating-heart"), 1800);
}

function spawnHeart(className, size) {
  const h = document.createElement("div");
  h.className = className;
  h.textContent = "❤️";
  h.style.left     = Math.random() * 100 + "vw";
  h.style.fontSize = (size || Math.random() * 14 + 13) + "px";
  h.style.animationDuration = (Math.random() * 3 + 5.5) + "s";
  document.body.appendChild(h);
  h.addEventListener("animationend", () => h.remove());
}

startBgHearts();

// ── TELAS ─────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ── INÍCIO ────────────────────────────────────────────────────

function startGame() {
  clearEverything();
  score            = 0;
  time             = 30;
  phase            = 1;
  passwordAttempts = 0;
  holdProgress     = 0;
  patienceTrolled  = false;
  finalIndex       = 0;
  startPhase();
}

// ── FASES DE JOGO ─────────────────────────────────────────────

const PHASE_CONFIG = {
  1: {
    label:    "Fase 1 de 2",
    title:    "Pega os corações",
    tip:      "Coração vale ponto. Bomba tira. Parece simples.",
    duration: 30,
    goal:     100,
    speed:    [3.2, 5.4],
    interval: 760,
    items: [
      { icon: "❤️",  pts: 10 },
      { icon: "💖",  pts: 15 },
      { icon: "💘",  pts: 20 },
      { icon: "💣",  pts: -20 }
    ]
  },
  2: {
    label:    "Fase 2 de 2",
    title:    "Agora são estrelas",
    tip:      "Estrelas valem mais. As bombas continuam, claro.",
    duration: 30,
    goal:     100,
    speed:    [2.6, 4.4],
    interval: 680,
    items: [
      { icon: "⭐",  pts: 15 },
      { icon: "✨",  pts: 20 },
      { icon: "🌟",  pts: 25 },
      { icon: "💣",  pts: -20 }
    ]
  }
};

function startPhase() {
  const cfg = PHASE_CONFIG[phase];
  score = 0;
  time  = cfg.duration;

  document.getElementById("phaseLabel").textContent  = cfg.label;
  document.getElementById("phaseTitle").textContent  = cfg.title;
  document.getElementById("tipText").textContent     = cfg.tip;
  document.getElementById("score").textContent       = 0;
  document.getElementById("timer").textContent       = time;
  document.getElementById("progress").style.width   = "0%";
  document.getElementById("gameArea").innerHTML      = "";

  showScreen("game");

  itemInterval  = setInterval(createItem, cfg.interval);
  timerInterval = setInterval(tick, 1000);
}

function tick() {
  time--;
  document.getElementById("timer").textContent = time;
  if (time <= 0) endPhase();
}

function createItem() {
  const cfg  = PHASE_CONFIG[phase];
  const area = document.getElementById("gameArea");
  const chosen = cfg.items[Math.floor(Math.random() * cfg.items.length)];

  const el = document.createElement("div");
  el.className = "item";
  el.textContent = chosen.icon;
  el.style.left = Math.random() * 78 + "%";
  el.style.animationDuration =
    (Math.random() * (cfg.speed[1] - cfg.speed[0]) + cfg.speed[0]) + "s";

  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    el.remove();

    score = Math.max(0, score + chosen.pts);
    document.getElementById("score").textContent = score;
    document.getElementById("progress").style.width =
      Math.min((score / cfg.goal) * 100, 100) + "%";

    if (chosen.pts > 0) spawnHeart("floating-heart", 20);
    if (score >= cfg.goal) endPhase();
  }, { once: true });

  area.appendChild(el);
  setTimeout(() => el.remove(), 7000);
}

function endPhase() {
  clearInterval(timerInterval);
  clearInterval(itemInterval);
  document.querySelectorAll(".item").forEach(el => el.remove());

  if (phase === 1) {
    showMessage(
      "Ok, passou.",
      "Confesso que esperava menos habilidade. Vou ter que dificultar.",
      "Continuar",
      () => { phase = 2; startPhase(); }
    );
  } else {
    showMessage(
      "Tá bom, você sabe jogar.",
      "Infelizmente pra mim. Então vamos testar outra coisa.",
      "Próxima fase",
      startPatienceTest
    );
  }
}

// ── MENSAGEM INTERMEDIÁRIA ────────────────────────────────────

function showMessage(title, text, btnText, action) {
  showScreen("message");
  document.getElementById("messageTitle").textContent = title;
  document.getElementById("messageText").textContent  = text;
  const btn = document.getElementById("messageBtn");
  btn.textContent = btnText;
  btn.onclick     = action;
}

// ── TESTE DE PACIÊNCIA ────────────────────────────────────────

function startPatienceTest() {
  holdProgress    = 0;
  patienceTrolled = false;

  document.getElementById("holdProgress").style.width = "0%";
  document.getElementById("patienceText").textContent =
    "Segure até completar. Se soltar, regride um pouco.";

  showScreen("patience");

  const btn = document.getElementById("holdBtn");

  function onDown(e) {
    e.preventDefault();
    clearInterval(holdInterval);

    holdInterval = setInterval(() => {
      holdProgress += 1.8;

      // Trolagem no meio do caminho (uma só vez)
      if (holdProgress >= 55 && !patienceTrolled) {
        patienceTrolled = true;
        holdProgress = 20;
        document.getElementById("patienceText").textContent =
          "Escorregou da minha mão. Continua.";
      }

      document.getElementById("holdProgress").style.width =
        Math.min(holdProgress, 100) + "%";

      if (holdProgress >= 100) {
        clearInterval(holdInterval);
        document.getElementById("patienceText").textContent =
          "Pronto. Isso foi mais difícil do que parecia.";
        setTimeout(startFakeLoading, 1400);
      }
    }, 110);
  }

  function onUp() {
    clearInterval(holdInterval);
    holdProgress = Math.max(0, holdProgress - 8);
    document.getElementById("holdProgress").style.width = holdProgress + "%";
  }

  btn.addEventListener("pointerdown",  onDown);
  btn.addEventListener("pointerup",    onUp);
  btn.addEventListener("pointerleave", onUp);
}

// ── LOADING FALSO ─────────────────────────────────────────────

function startFakeLoading() {
  showScreen("loading");

  const bar     = document.getElementById("loadingProgress");
  const pct     = document.getElementById("loadingPercent");
  const txt     = document.getElementById("loadingText");

  const steps = [
    { value: 0,   msg: "Iniciando...",                              delay: 800  },
    { value: 7,   msg: "Separando o suspense...",                   delay: 1300 },
    { value: 16,  msg: "Organizando uma dose de caos...",           delay: 1300 },
    { value: 27,  msg: "Misturando provocação com carinho...",      delay: 1300 },
    { value: 38,  msg: "Verificando se você ainda não fechou...",   delay: 1300 },
    { value: 51,  msg: "Ajustando o nível de drama...",             delay: 1300 },
    { value: 63,  msg: "Quase chegando numa parte importante...",   delay: 1300 },
    { value: 75,  msg: "Agora parece que vai acabar, né?",          delay: 1300 },
    { value: 87,  msg: "Quase lá. Mas quase mesmo.",                delay: 1300 },
    { value: 94,  msg: "Preparando o final...",                     delay: 1300 },
    { value: 99,  msg: "99%. Clássico.",                            delay: 2400 },
    { value: 99,  msg: "Ainda 99%. Não foi erro.",                  delay: 2400 },
    { value: 99,  msg: "Eu sei.",                                   delay: 2000 },
    { value: 99,  msg: "Respira. Falta pouco de verdade.",          delay: 2000 },
    { value: 100, msg: "Pronto.",                                   delay: 1400 }
  ];

  bar.style.width = "0%";
  pct.textContent = "0%";
  txt.textContent = steps[0].msg;

  let i = 0;

  function nextStep() {
    bar.style.width = steps[i].value + "%";
    pct.textContent = steps[i].value + "%";
    txt.textContent = steps[i].msg;

    const delay = steps[i].delay;
    i++;

    if (i < steps.length) {
      setTimeout(nextStep, delay);
    } else {
      setTimeout(showPasswordScreen, 1200);
    }
  }

  nextStep();
}

// ── SENHA ─────────────────────────────────────────────────────

function showPasswordScreen() {
  passwordAttempts = 0;
  document.getElementById("passwordInput").value    = "";
  document.getElementById("passwordText").textContent =
    "Talvez nem exista. Quem sabe.";
  showScreen("password");
}

function checkPassword() {
  passwordAttempts++;

  const txt   = document.getElementById("passwordText");
  const input = document.getElementById("passwordInput");

  if (passwordAttempts === 1) {
    txt.textContent = "Errada. Mas gostei da confiança.";
  } else if (passwordAttempts === 2) {
    txt.textContent = "Ainda não.";
  } else if (passwordAttempts === 3) {
    txt.textContent = "Última tentativa. Faz algum sentido agora?";
  } else {
    txt.textContent =
      "Tá bom, confesso: não existia senha. Foram " + passwordAttempts + " tentativas.";
    setTimeout(showFinal, 2200);
  }

  input.value = "";
}

// Confirmar com Enter
document.getElementById("passwordInput")
  .addEventListener("keydown", e => { if (e.key === "Enter") checkPassword(); });

// ── TELA FINAL ────────────────────────────────────────────────

function showFinal() {
  showScreen("final");
  finalIndex = 0;

  document.getElementById("storyText").textContent = "";
  document.getElementById("nextFinalBtn").classList.remove("hidden");
  document.getElementById("restartBtn").classList.add("hidden");

  nextFinalMessage();
}

function nextFinalMessage() {
  const el      = document.getElementById("storyText");
  const nextBtn = document.getElementById("nextFinalBtn");
  const rstBtn  = document.getElementById("restartBtn");

  if (finalIndex < finalMessages.length) {
    // Fade suave na troca de mensagem
    el.style.animation = "none";
    void el.offsetWidth; // reflow
    el.style.animation = "fadeIn 0.55s ease";
    el.textContent = finalMessages[finalIndex];
    finalIndex++;
  } else {
    nextBtn.classList.add("hidden");
    rstBtn.classList.remove("hidden");
    startFinalHearts();
  }
}

function startFinalHearts() {
  let count = 0;
  const iv = setInterval(() => {
    spawnHeart("final-heart", Math.random() * 14 + 20);
    spawnHeart("final-heart", Math.random() * 10 + 16);
    count++;
    if (count > 40) clearInterval(iv);
  }, 280);
}

// ── REINICIAR ─────────────────────────────────────────────────

function restartGame() {
  clearEverything();

  score            = 0;
  time             = 30;
  phase            = 1;
  passwordAttempts = 0;
  holdProgress     = 0;
  patienceTrolled  = false;
  finalIndex       = 0;

  document.getElementById("progress").style.width       = "0%";
  document.getElementById("holdProgress").style.width   = "0%";
  document.getElementById("loadingProgress").style.width = "0%";

  showScreen("home");
}

// ── LIMPAR TUDO ───────────────────────────────────────────────

function clearEverything() {
  clearInterval(timerInterval);
  clearInterval(itemInterval);
  clearInterval(holdInterval);
  document.querySelectorAll(".item").forEach(el => el.remove());
  document.querySelectorAll(".final-heart").forEach(el => el.remove());
}
