// ═══════════════════════════════════════════════════════════
// Jogo para minha chatinha ❤️ — script.js
// ═══════════════════════════════════════════════════════════

const finalMessages = [
  "Então, amor! Você chegou até aqui.",
  "Passou pelos corações, pelas estrelas, pelo quiz, segurou aquele botão irritante — e ainda ficou tentando uma senha que, sinceramente, nunca existiu.",
  "Eu fiz tudo isso porque queria ver você persistir por algo completamente sem sentido só porque era meu.",
  "E você foi.",
  "amor, você é a parte do meu dia que eu espero sem perceber. A pessoa que eu quero contar quando algo ruim acontece, e quando algo bom também.",
  "Não tem jeito mais bonito de dizer isso. Eu só te amo muito. ❤️"
];

let score = 0, timeLeft = 30, phase = 1;
let timerInterval = null, bgHeartInterval = null, holdInterval = null;
let phaseEnded = false, passwordAttempts = 0;
let holdProgress = 0, patienceTrolled = false, finalIndex = 0;

let canvas, ctx, canvasItems = [], animFrame = null;
let headerHeight = 0;

(function drawStars() {
  const sc = document.getElementById("starsCanvas");
  const sctx = sc.getContext("2d");
  sc.width = window.innerWidth;
  sc.height = window.innerHeight;

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * sc.width;
    const y = Math.random() * sc.height;
    const r = Math.random() * 1.2 + 0.3;
    const op = Math.random() * 0.55 + 0.15;

    sctx.beginPath();
    sctx.arc(x, y, r, 0, Math.PI * 2);
    sctx.fillStyle = `rgba(255,255,255,${op})`;
    sctx.fill();
  }
})();

function startBgHearts() {
  if (bgHeartInterval) return;
  bgHeartInterval = setInterval(() => spawnFloatHeart("floating-heart"), 1800);
}

function spawnFloatHeart(cls, size) {
  const h = document.createElement("div");
  h.className = cls;
  h.textContent = "❤️";
  h.style.left = Math.random() * 95 + "vw";
  h.style.fontSize = (size || Math.random() * 14 + 12) + "px";
  h.style.animationDuration = (Math.random() * 4 + 6) + "s";
  document.body.appendChild(h);
  h.addEventListener("animationend", () => h.remove());
}

startBgHearts();

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startGame() {
  clearEverything();
  score = 0;
  timeLeft = 30;
  phase = 1;
  phaseEnded = false;
  passwordAttempts = 0;
  holdProgress = 0;
  patienceTrolled = false;
  finalIndex = 0;
  startPhase();
}

const PHASES = {
  1: {
    label: "Fase 1 de 2",
    title: "Pega os corações",
    tip: "Toque nos corações. Bomba tira pontos. Parece simples.",
    duration: 30,
    goal: 120,
    items: [
      { emoji: "❤️", pts: 10, size: 48, speed: () => rand(180, 280) },
      { emoji: "💖", pts: 15, size: 52, speed: () => rand(200, 300) },
      { emoji: "💘", pts: 20, size: 44, speed: () => rand(220, 320) },
      { emoji: "💣", pts: -20, size: 44, speed: () => rand(260, 380) }
    ],
    weights: [40, 30, 20, 10],
    spawnMs: 700
  },

  2: {
    label: "Fase 2 de 2",
    title: "Agora são estrelas",
    tip: "Estrelas valem mais. As bombas continuam, claro.",
    duration: 30,
    goal: 150,
    items: [
      { emoji: "⭐", pts: 15, size: 48, speed: () => rand(220, 340) },
      { emoji: "✨", pts: 20, size: 44, speed: () => rand(240, 360) },
      { emoji: "🌟", pts: 25, size: 52, speed: () => rand(200, 320) },
      { emoji: "💣", pts: -20, size: 44, speed: () => rand(300, 420) }
    ],
    weights: [35, 30, 20, 15],
    spawnMs: 600
  }
};

function rand(a, b) {
  return Math.random() * (b - a) + a;
}

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }

  return items[items.length - 1];
}

function startPhase() {
  const cfg = PHASES[phase];

  score = 0;
  timeLeft = cfg.duration;
  phaseEnded = false;
  canvasItems = [];

  document.getElementById("phaseLabel").textContent = cfg.label;
  document.getElementById("phaseTitle").textContent = cfg.title;
  document.getElementById("tipText").textContent = cfg.tip;
  document.getElementById("score").textContent = 0;
  document.getElementById("goalDisplay").textContent = cfg.goal;
  document.getElementById("timer").textContent = timeLeft;
  document.getElementById("progress").style.width = "0%";
  document.getElementById("progressPct").textContent = "0%";

  showScreen("game");

  requestAnimationFrame(() => {
    setupCanvas();
    timerInterval = setInterval(tick, 1000);
    spawnInterval = setInterval(spawnItem, cfg.spawnMs);
    lastTs = null;
    animFrame = requestAnimationFrame(gameLoop);
  });
}

let spawnInterval = null;

function setupCanvas() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  const header = document.querySelector(".game-header");
  headerHeight = header ? header.offsetHeight : 120;

  const playH = window.innerHeight - headerHeight;

  canvas.width = window.innerWidth;
  canvas.height = playH;
  canvas.style.top = headerHeight + "px";
  canvas.style.height = playH + "px";

  canvas.removeEventListener("pointerdown", onCanvasTap);
  canvas.addEventListener("pointerdown", onCanvasTap, { passive: false });
}

function spawnItem() {
  if (phaseEnded || !canvas) return;

  const cfg = PHASES[phase];
  const item = weightedPick(cfg.items, cfg.weights);
  const size = item.size;
  const margin = size;

  canvasItems.push({
    emoji: item.emoji,
    pts: item.pts,
    size: size,
    x: margin + Math.random() * (canvas.width - margin * 2),
    y: -size,
    vy: item.speed(),
    alive: true,
    hit: false,
    scale: 1,
    alpha: 1
  });
}

let lastTs = null;

function gameLoop(ts) {
  if (!canvas || !ctx) return;

  if (!lastTs) lastTs = ts;
  const dt = Math.min((ts - lastTs) / 1000, 0.1);
  lastTs = ts;

  const h = canvas.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = canvasItems.length - 1; i >= 0; i--) {
    const it = canvasItems[i];

    if (it.hit) {
      it.scale += dt * 6;
      it.alpha -= dt * 5;

      if (it.alpha <= 0) {
        canvasItems.splice(i, 1);
        continue;
      }
    } else {
      it.y += it.vy * dt;

      if (it.y > h + it.size + 20) {
        canvasItems.splice(i, 1);
        continue;
      }
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, it.alpha);
    ctx.font = `${it.size * it.scale}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(it.emoji, it.x, it.y);
    ctx.restore();
  }

  if (!phaseEnded) {
    animFrame = requestAnimationFrame(gameLoop);
  }
}

function onCanvasTap(e) {
  e.preventDefault();

  if (phaseEnded) return;

  const rect = canvas.getBoundingClientRect();
  const rawTouches = e.changedTouches ? Array.from(e.changedTouches) : [e];

  for (let t = 0; t < rawTouches.length; t++) {
    const touch = rawTouches[t];
    const tx = (touch.clientX !== undefined ? touch.clientX : touch.x) - rect.left;
    const ty = (touch.clientY !== undefined ? touch.clientY : touch.y) - rect.top;

    for (let i = canvasItems.length - 1; i >= 0; i--) {
      const it = canvasItems[i];

      if (it.hit) continue;

      const dx = tx - it.x;
      const dy = ty - it.y;
      const hitR = it.size * 0.75;

      if (dx * dx + dy * dy < hitR * hitR) {
        it.hit = true;
        score = Math.max(0, score + it.pts);

        document.getElementById("score").textContent = score;

        const cfg = PHASES[phase];
        const pct = Math.min((score / cfg.goal) * 100, 100);

        document.getElementById("progress").style.width = pct + "%";
        document.getElementById("progressPct").textContent = Math.floor(pct) + "%";

        if (it.pts > 0) spawnFloatHeart("floating-heart", 22);
        if (score >= cfg.goal) endPhase();

        break;
      }
    }
  }
}

function tick() {
  timeLeft--;
  document.getElementById("timer").textContent = timeLeft;

  if (timeLeft <= 0) endPhase();
}

function endPhase() {
  if (phaseEnded) return;

  phaseEnded = true;

  clearInterval(timerInterval);
  timerInterval = null;

  clearInterval(spawnInterval);
  spawnInterval = null;

  cancelAnimationFrame(animFrame);
  animFrame = null;
  lastTs = null;

  canvas && canvas.removeEventListener("pointerdown", onCanvasTap);
  canvasItems = [];

  if (phase === 1) {
    showMessage(
      "Ok, passou.",
      "Confesso que esperava menos habilidade. Vou ter que dificultar.",
      "Continuar para fase 2",
      () => {
        phase = 2;
        startPhase();
      }
    );
  } else {
    showMessage(
      "Impressionante.",
      "Tá bom amor, nao vou subestimar voce mais. Agora vamos ver se você sabe sobre mim.",
      "Começar quiz",
      startQuiz
    );
  }
}

function showMessage(title, text, btnText, action) {
  showScreen("message");

  const oldQuiz = document.getElementById("quizOptions");
  if (oldQuiz) oldQuiz.remove();

  document.getElementById("messageTitle").textContent = title;
  document.getElementById("messageText").textContent = text;

  const tag = document.getElementById("messageTag");
  if (tag) tag.textContent = "mensagem";

  const btn = document.getElementById("messageBtn");
  btn.style.display = "block";
  btn.textContent = btnText;
  btn.onclick = action;
}

// ── QUIZ SOBRE MIM ────────────────────────────────────────

const quizQuestions = [
  {
    question: "Qual a data do meu aniversário?",
    options: ["04/07", "04/08", "25/07", "25/08"],
    answer: 0
  },
  {
    question: "Quando eu fico com raiva, eu faço mais o quê?",
    options: ["Fico calado", "Falo logo", "Faço drama", "Finjo que nem liguei"],
    answer: 0
  },
  {
    question: "qual parte do seu corpo é meu preferido?",
    options: ["bunda" ,"cabelo", "peito kkk", "sua ppk", "ou tudo junto"],
    answer: 3
  }
];

let quizIndex = 0;
let quizScore = 0;

function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quizQuestions[quizIndex];

  showScreen("message");

  const tag = document.getElementById("messageTag");
  if (tag) tag.textContent = `quiz ${quizIndex + 1}/${quizQuestions.length}`;

  document.getElementById("messageTitle").textContent = q.question;
  document.getElementById("messageText").textContent = "Escolhe com cuidado, amor.";

  const btn = document.getElementById("messageBtn");
  btn.style.display = "none";

  const oldBox = document.getElementById("quizOptions");
  if (oldBox) oldBox.remove();

  const box = document.createElement("div");
  box.id = "quizOptions";

  q.options.forEach((option, i) => {
    const optionBtn = document.createElement("button");
    optionBtn.className = "btn-primary";
    optionBtn.textContent = option;
    optionBtn.style.marginTop = "12px";
    optionBtn.onclick = () => answerQuiz(i);
    box.appendChild(optionBtn);
  });

  document.querySelector("#message .card").appendChild(box);
}

function answerQuiz(choice) {
  const q = quizQuestions[quizIndex];
  const acertou = choice === q.answer;

  if (acertou) {
    quizScore++;

    if (quizIndex === 0) {
      document.getElementById("messageText").textContent = "aí sim, essa você não podia esquecer mesmo";
    } else {
      document.getElementById("messageText").textContent = "boa amor, eu sabia que tu lembrava";
    }
  } else {
    if (quizIndex === 0) {
      document.getElementById("messageText").textContent = "meu deus amor... justo meu aniversário?";
    } else {
      document.getElementById("messageText").textContent = "meu deus amor… decepcionado de verdade";
    }
  }

  const box = document.getElementById("quizOptions");
  if (box) box.remove();

  const btn = document.getElementById("messageBtn");
  btn.style.display = "block";
  btn.textContent = quizIndex + 1 < quizQuestions.length ? "Próxima" : "Continuar";
  btn.onclick = nextQuizQuestion;
}

function nextQuizQuestion() {
  quizIndex++;

  if (quizIndex < quizQuestions.length) {
    showQuizQuestion();
  } else {
    showMessage(
      "Tá bom, terminou.",
      `Você acertou ${quizScore} de ${quizQuestions.length}. Vou guardar esse resultado, viu.`,
      "Continuar",
      startPatienceTest
    );
  }
}

// ── TESTE DE PACIÊNCIA ────────────────────────────────────

function startPatienceTest() {
  holdProgress = 0;
  patienceTrolled = false;

  const ring = document.getElementById("ringFg");
  const emoji = document.getElementById("holdEmoji");
  const pText = document.getElementById("patienceText");
  const CIRCUM = 314;

  ring.style.strokeDashoffset = CIRCUM;
  emoji.textContent = "";
  pText.textContent = "Segure até completar. Se soltar, regride um pouco.";

  showScreen("patience");

  const oldBtn = document.getElementById("holdBtn");
  const btn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(btn, oldBtn);

  function updateRing() {
    const pct = Math.min(holdProgress, 100) / 100;
    ring.style.strokeDashoffset = CIRCUM * (1 - pct);

    if (pct > 0.6) emoji.textContent = "❤️";
    else if (pct > 0.3) emoji.textContent = "💗";
    else emoji.textContent = "";
  }

  function onDown(e) {
    e.preventDefault();
    clearInterval(holdInterval);

    holdInterval = setInterval(() => {
      holdProgress += 1.8;

      if (holdProgress >= 52 && !patienceTrolled) {
        patienceTrolled = true;
        holdProgress = 18;
        pText.textContent = "Escorregou da minha mão. Continua!";
        emoji.textContent = "";
      }

      updateRing();

      if (holdProgress >= 100) {
        clearInterval(holdInterval);
        emoji.textContent = "❤️";
        pText.textContent = "Pronto. Isso foi mais difícil do que parecia.";
        setTimeout(startFakeLoading, 1400);
      }
    }, 110);
  }

  function onUp() {
    clearInterval(holdInterval);
    holdProgress = Math.max(0, holdProgress - 8);
    updateRing();
  }

  btn.addEventListener("pointerdown", onDown, { passive: false });
  btn.addEventListener("pointerup", onUp);
  btn.addEventListener("pointerleave", onUp);
  btn.addEventListener("touchend", onUp);
}

function startFakeLoading() {
  showScreen("loading");

  const ring = document.getElementById("loadingRing");
  const pct = document.getElementById("loadingPercent");
  const txt = document.getElementById("loadingText");
  const CIRCUM = 201;

  const steps = [
    { v: 0, msg: "Iniciando...", delay: 800 },
    { v: 7, msg: "Separando o suspense...", delay: 1300 },
    { v: 16, msg: "Organizando uma dose de caos...", delay: 1300 },
    { v: 27, msg: "Misturando provocação com carinho...", delay: 1300 },
    { v: 38, msg: "Verificando se você ainda não fechou...", delay: 1300 },
    { v: 51, msg: "Ajustando o nível de drama...", delay: 1300 },
    { v: 63, msg: "Quase chegando numa parte importante...", delay: 1300 },
    { v: 75, msg: "Agora parece que vai acabar, né?", delay: 1300 },
    { v: 87, msg: "Quase lá. Mas quase mesmo.", delay: 1300 },
    { v: 94, msg: "Preparando o final...", delay: 1300 },
    { v: 99, msg: "99%. Clássico.", delay: 2400 },
    { v: 99, msg: "Ainda 99%. Não foi erro.", delay: 2400 },
    { v: 99, msg: "Eu sei.", delay: 2000 },
    { v: 99, msg: "Respira. Falta pouco de verdade.", delay: 2000 },
    { v: 100, msg: "Pronto.", delay: 1400 }
  ];

  ring.style.strokeDashoffset = CIRCUM;
  pct.textContent = "0%";
  txt.textContent = steps[0].msg;

  let i = 0;

  function next() {
    const s = steps[i];

    ring.style.strokeDashoffset = CIRCUM * (1 - s.v / 100);
    pct.textContent = s.v + "%";
    txt.textContent = s.msg;

    i++;

    if (i < steps.length) setTimeout(next, s.delay);
    else setTimeout(showPasswordScreen, 1200);
  }

  next();
}

function showPasswordScreen() {
  passwordAttempts = 0;

  document.getElementById("passwordInput").value = "";
  document.getElementById("passwordText").textContent = "Talvez nem exista. Quem sabe.";

  showScreen("password");

  setTimeout(() => document.getElementById("passwordInput").focus(), 300);
}

function checkPassword() {
  passwordAttempts++;

  const txt = document.getElementById("passwordText");
  const input = document.getElementById("passwordInput");

  if (passwordAttempts === 1) {
    txt.textContent = "Errada. Mas gostei da confiança.";
  } else if (passwordAttempts === 2) {
    txt.textContent = "Ainda não.";
  } else if (passwordAttempts === 3) {
    txt.textContent = "Última tentativa. Faz algum sentido agora?";
  } else {
    txt.textContent = "Tá bom, confesso: não existia senha. Foram " + passwordAttempts + " tentativas.";
    setTimeout(showFinal, 2200);
  }

  input.value = "";
}

document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
});

function showFinal() {
  showScreen("final");

  finalIndex = 0;

  document.getElementById("storyText").textContent = "";
  document.getElementById("nextFinalBtn").classList.remove("hidden");
  document.getElementById("restartBtn").classList.add("hidden");

  nextFinalMessage();
}

function nextFinalMessage() {
  const el = document.getElementById("storyText");
  const nextBtn = document.getElementById("nextFinalBtn");
  const rstBtn = document.getElementById("restartBtn");

  if (finalIndex < finalMessages.length) {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "fadeUp 0.5s ease both";
    el.textContent = finalMessages[finalIndex++];
  } else {
    nextBtn.classList.add("hidden");
    rstBtn.classList.remove("hidden");
    startFinalHearts();
  }
}

function startFinalHearts() {
  let n = 0;

  const iv = setInterval(() => {
    spawnFloatHeart("final-heart", Math.random() * 16 + 20);
    spawnFloatHeart("final-heart", Math.random() * 10 + 14);

    if (++n > 40) clearInterval(iv);
  }, 260);
}

function restartGame() {
  clearEverything();

  score = 0;
  timeLeft = 30;
  phase = 1;
  phaseEnded = false;
  passwordAttempts = 0;
  holdProgress = 0;
  patienceTrolled = false;
  finalIndex = 0;

  document.getElementById("progress").style.width = "0%";

  showScreen("home");
}

function clearEverything() {
  clearInterval(timerInterval);
  timerInterval = null;

  clearInterval(spawnInterval);
  spawnInterval = null;

  clearInterval(holdInterval);
  holdInterval = null;

  cancelAnimationFrame(animFrame);
  animFrame = null;
  lastTs = null;

  phaseEnded = true;
  canvasItems = [];

  if (canvas) canvas.removeEventListener("pointerdown", onCanvasTap);

  document.querySelectorAll(".final-heart").forEach(el => el.remove());

  const oldQuiz = document.getElementById("quizOptions");
  if (oldQuiz) oldQuiz.remove();
}
