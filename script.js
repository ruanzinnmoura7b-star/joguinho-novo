// ============================================================
//  script.js — Quase Lá ❤️
// ============================================================

// ------ CONFIGURAÇÕES ----------------------------------------

const FASES = [
  {
    titulo: "Fase 1 — Clica nos corações!",
    dica: "Clique/toque nos ❤️ antes que caiam!",
    duracao: 30,
    meta: 10,
    emojis: { bom: ["❤️"], ruim: ["💀", "🐛"] },
    velocidade: [3000, 5000],
    intervalo: 900,
  },
  {
    titulo: "Fase 2 — Só os corações rosa!",
    dica: "Clique APENAS nos 🩷 — os outros vão te prejudicar!",
    duracao: 30,
    meta: 12,
    emojis: { bom: ["🩷"], ruim: ["💔", "👾", "🕷️"] },
    velocidade: [2500, 4000],
    intervalo: 750,
  },
  {
    titulo: "Fase 3 — Modo caos!",
    dica: "Pega tudo que for coração — rápido!",
    duracao: 30,
    meta: 15,
    emojis: { bom: ["❤️", "🩷", "💕", "💖"], ruim: ["💀", "👾", "🕷️", "🐛"] },
    velocidade: [1800, 3200],
    intervalo: 550,
  },
];

const MENSAGENS_ENTRE_FASES = [
  {
    titulo: "Fase 1 concluída! 🎉",
    texto: "Você passou! Claro, eu sabia que você ia conseguir... 😌 Bora pra próxima?",
    btn: "Próxima fase →",
  },
  {
    titulo: "Metade do caminho! 💪",
    texto: "Tô impressionado(a), sério. Mais uma fase e a surpresa é sua!",
    btn: "Última fase →",
  },
];

const SENHA = "te amo";          // ← mude se quiser
const DICA_SENHA = "São as duas palavras mais importantes que eu já disse pra você 💬";

const HISTORIA_FINAL = [
  "Você jogou, lutou, aguentou o cronômetro e ainda digitou a senha certa...",
  "Isso prova o que eu já sabia: você toparia qualquer coisa comigo. 🥹",
  "E eu quero que você saiba que eu sinto o mesmo. Cada dia com você é meu jogo favorito.",
  "Então... a surpresa é essa: eu te amo. De verdade. Muito. ❤️",
];

// ------ ESTADO -----------------------------------------------

let faseAtual = 0;
let pontos = 0;
let tempoRestante = 0;
let timerInterval = null;
let spawnInterval = null;
let historicoIdx = 0;

// ------ UTILITÁRIOS ------------------------------------------

function mostrarTela(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function dispararCoracao(fixo = false) {
  const h = document.createElement("div");
  h.className = fixo ? "final-heart" : "floating-heart";
  h.textContent = "❤️";
  h.style.left = rand(5, 90) + "vw";
  h.style.fontSize = rand(18, 38) + "px";
  h.style.animationDuration = rand(5, 9) + "s";
  document.body.appendChild(h);
  h.addEventListener("animationend", () => h.remove());
}

// ------ INÍCIO -----------------------------------------------

function startGame() {
  faseAtual = 0;
  pontos = 0;
  historicoIdx = 0;
  iniciarFase();
}

// ------ FASE -------------------------------------------------

function iniciarFase() {
  const fase = FASES[faseAtual];
  pontos = 0;

  document.getElementById("phaseTitle").textContent = fase.titulo;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = fase.duracao;
  document.getElementById("tipText").textContent = fase.dica;
  document.getElementById("progress").style.width = "0%";
  document.getElementById("gameArea").innerHTML = "";

  mostrarTela("game");

  tempoRestante = fase.duracao;
  timerInterval = setInterval(tickTimer, 1000);
  spawnInterval = setInterval(spawnItem, fase.intervalo);
}

function tickTimer() {
  tempoRestante--;
  document.getElementById("timer").textContent = tempoRestante;
  if (tempoRestante <= 0) terminarFase();
}

function spawnItem() {
  const fase = FASES[faseAtual];
  const area = document.getElementById("gameArea");

  // Decide se é bom ou ruim (70% bom)
  const lista = Math.random() < 0.70 ? fase.emojis.bom : fase.emojis.ruim;
  const emoji = lista[Math.floor(Math.random() * lista.length)];
  const eBom = fase.emojis.bom.includes(emoji);

  const el = document.createElement("div");
  el.className = "item";
  el.textContent = emoji;
  el.style.left = rand(5, 85) + "vw";

  const dur = rand(fase.velocidade[0], fase.velocidade[1]);
  el.style.animationDuration = dur + "ms";

  el.addEventListener("click", () => clicarItem(el, eBom));
  el.addEventListener("touchstart", (e) => { e.preventDefault(); clicarItem(el, eBom); }, { passive: false });

  area.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

function clicarItem(el, eBom) {
  if (!el.parentNode) return;
  el.remove();

  const fase = FASES[faseAtual];
  if (eBom) {
    pontos++;
    dispararCoracao();
  } else {
    pontos = Math.max(0, pontos - 2);
  }

  document.getElementById("score").textContent = pontos;
  const pct = Math.min((pontos / fase.meta) * 100, 100);
  document.getElementById("progress").style.width = pct + "%";
}

function terminarFase() {
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  document.getElementById("gameArea").innerHTML = "";

  const fase = FASES[faseAtual];
  const passou = pontos >= fase.meta;

  if (!passou) {
    // Falhou — tenta de novo
    mostrarMensagem(
      "Quase lá... 😅",
      `Você fez ${pontos} pontos, mas precisava de ${fase.meta}. Tenta de novo!`,
      "Tentar de novo",
      () => iniciarFase()
    );
    return;
  }

  faseAtual++;

  if (faseAtual < FASES.length) {
    // Mensagem entre fases
    const msg = MENSAGENS_ENTRE_FASES[faseAtual - 1];
    mostrarMensagem(msg.titulo, msg.texto, msg.btn, () => iniciarFase());
  } else {
    // Passou tudo — vai para o teste de paciência
    iniciarPaciencia();
  }
}

// ------ MENSAGEM INTERMEDIÁRIA --------------------------------

function mostrarMensagem(titulo, texto, btnTexto, callback) {
  document.getElementById("messageTitle").textContent = titulo;
  document.getElementById("messageText").textContent = texto;
  const btn = document.getElementById("messageBtn");
  btn.textContent = btnTexto;
  btn.onclick = callback;
  mostrarTela("message");
}

// ------ TESTE DE PACIÊNCIA -----------------------------------

let holdTimer = null;
let holdProgress = 0;
const HOLD_DURATION = 5000; // ms

function iniciarPaciencia() {
  document.getElementById("patienceText").textContent =
    "Segura por 5 segundos sem soltar... confio em você 👀";
  document.getElementById("holdProgress").style.width = "0%";
  holdProgress = 0;
  mostrarTela("patience");

  const btn = document.getElementById("holdBtn");
  btn.onmousedown = iniciarHold;
  btn.ontouchstart = (e) => { e.preventDefault(); iniciarHold(); };
  btn.onmouseup = cancelarHold;
  btn.onmouseleave = cancelarHold;
  btn.ontouchend = cancelarHold;
}

function iniciarHold() {
  if (holdTimer) return;
  const inicio = Date.now();

  holdTimer = setInterval(() => {
    holdProgress = ((Date.now() - inicio) / HOLD_DURATION) * 100;
    document.getElementById("holdProgress").style.width = holdProgress + "%";
    document.getElementById("patienceText").textContent =
      holdProgress < 50 ? "Aguenta... 😤" : "Tão perto! 😍";

    if (holdProgress >= 100) {
      clearInterval(holdTimer);
      holdTimer = null;
      iniciarLoading();
    }
  }, 50);
}

function cancelarHold() {
  if (!holdTimer) return;
  clearInterval(holdTimer);
  holdTimer = null;
  holdProgress = 0;
  document.getElementById("holdProgress").style.width = "0%";
  document.getElementById("patienceText").textContent =
    "Soltou! 😂 Tenta de novo, vai...";
}

// ------ LOADING ----------------------------------------------

const LOADING_TEXTOS = [
  "Coletando memórias afetivas...",
  "Calibrando o nível de fofura...",
  "Procurando palavras certas...",
  "Organizando sentimentos na ordem certa...",
  "Quase pronto... ❤️",
];

function iniciarLoading() {
  mostrarTela("loading");
  let pct = 0;
  let textoIdx = 0;

  document.getElementById("loadingPercent").textContent = "0%";
  document.getElementById("loadingProgress").style.width = "0%";
  document.getElementById("loadingText").textContent = LOADING_TEXTOS[0];

  const iv = setInterval(() => {
    pct += rand(1, 4);
    if (pct >= 100) pct = 100;

    document.getElementById("loadingPercent").textContent = Math.floor(pct) + "%";
    document.getElementById("loadingProgress").style.width = pct + "%";

    const novoIdx = Math.min(Math.floor((pct / 100) * LOADING_TEXTOS.length), LOADING_TEXTOS.length - 1);
    if (novoIdx !== textoIdx) {
      textoIdx = novoIdx;
      document.getElementById("loadingText").textContent = LOADING_TEXTOS[textoIdx];
    }

    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(iniciarSenha, 600);
    }
  }, 80);
}

// ------ SENHA ------------------------------------------------

function iniciarSenha() {
  document.getElementById("passwordText").textContent = DICA_SENHA;
  document.getElementById("passwordInput").value = "";
  mostrarTela("password");
}

function checkPassword() {
  const input = document.getElementById("passwordInput").value.trim().toLowerCase();
  if (input === SENHA.toLowerCase()) {
    iniciarFinal();
  } else {
    document.getElementById("passwordText").textContent =
      "Errou! 😂 Pensa bem... " + DICA_SENHA;
    document.getElementById("passwordInput").value = "";
  }
}

// Permite confirmar com Enter
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("passwordInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
  });
});

// ------ TELA FINAL -------------------------------------------

let finalIdx = 0;
let typingInterval = null;

function iniciarFinal() {
  finalIdx = 0;
  mostrarTela("final");
  document.getElementById("nextFinalBtn").classList.add("hidden");
  document.getElementById("restartBtn").classList.add("hidden");
  escreverTextoFinal();

  // Corações flutuando
  const heartLoop = setInterval(() => {
    dispararCoracao(true);
    dispararCoracao(true);
  }, 800);
  setTimeout(() => clearInterval(heartLoop), 15000);
}

function escreverTextoFinal() {
  const el = document.getElementById("storyText");
  el.textContent = "";
  const texto = HISTORIA_FINAL[finalIdx];
  let i = 0;

  if (typingInterval) clearInterval(typingInterval);

  typingInterval = setInterval(() => {
    el.textContent += texto[i];
    i++;
    if (i >= texto.length) {
      clearInterval(typingInterval);
      typingInterval = null;

      const isLast = finalIdx === HISTORIA_FINAL.length - 1;
      const btn = isLast
        ? document.getElementById("restartBtn")
        : document.getElementById("nextFinalBtn");

      btn.classList.remove("hidden");
    }
  }, 38);
}

function nextFinalMessage() {
  document.getElementById("nextFinalBtn").classList.add("hidden");
  finalIdx++;
  escreverTextoFinal();
}

function restartGame() {
  document.getElementById("restartBtn").classList.add("hidden");
  document.getElementById("storyText").textContent = "";
  startGame();
}
