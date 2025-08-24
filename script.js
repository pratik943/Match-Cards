/* =======================
   ORIGINAL GAME LOGIC
======================= */
class AudioController {
  constructor() {
    this.bgMusic = new Audio('Assets/Audio/creepy.mp3');
    this.flipSound = new Audio('Assets/Audio/flip.wav');
    this.matchSound = new Audio('Assets/Audio/match.wav');
    this.victorySound = new Audio('Assets/Audio/victory.wav');
    this.gameOverSound = new Audio('Assets/Audio/gameOver.wav');
    this.bgMusic.volume = 0.5;
    this.bgMusic.loop = true;
  }
  startMusic() { this.bgMusic.play(); }
  stopMusic()  { this.bgMusic.pause(); this.bgMusic.currentTime = 0; }
  flip()       { this.flipSound.play(); }
  match()      { this.matchSound.play(); }
  victory()    { this.stopMusic(); this.victorySound.play(); }
  gameOver()   { this.stopMusic(); this.gameOverSound.play(); }
}

class MixOrMatch {
  constructor(totalTime, cards) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timeRemaining = totalTime;
    this.timer = document.getElementById('time-remaining');
    this.ticker = document.getElementById('flips');
    this.audioController = new AudioController();
  }
  startGame() {
    this.totalClicks = 0;
    this.timeRemaining = this.totalTime;
    this.cardToCheck = null;
    this.matchedCards = [];
    this.busy = true;
    setTimeout(() => {
      this.audioController.startMusic();
      this.shuffleCards(this.cardsArray);
      this.countdown = this.startCountdown();
      this.busy = false;
    }, 500);
    this.hideCards();
    this.timer.innerText = this.timeRemaining;
    this.ticker.innerText = this.totalClicks;
  }
  startCountdown() {
    return setInterval(() => {
      this.timeRemaining--;
      this.timer.innerText = this.timeRemaining;
      if (this.timeRemaining === 0) this.gameOver();
    }, 1000);
  }
  gameOver() {
    clearInterval(this.countdown);
    this.audioController.gameOver();
    document.getElementById('game-over-text').classList.add('visible');
  }
  victory() {
    clearInterval(this.countdown);
    this.audioController.victory();
    document.getElementById('victory-text').classList.add('visible');
  }
  hideCards() {
    this.cardsArray.forEach(card => {
      card.classList.remove('visible');
      card.classList.remove('matched');
    });
  }
  flipCard(card) {
    if (this.canFlipCard(card)) {
      this.audioController.flip();
      this.totalClicks++;
      this.ticker.innerText = this.totalClicks;
      card.classList.add('visible');

      if (this.cardToCheck) this.checkForCardMatch(card);
      else this.cardToCheck = card;
    }
  }
  checkForCardMatch(card) {
    if (this.getCardType(card) === this.getCardType(this.cardToCheck))
      this.cardMatch(card, this.cardToCheck);
    else
      this.cardMismatch(card, this.cardToCheck);
    this.cardToCheck = null;
  }
  cardMatch(card1, card2) {
    this.matchedCards.push(card1, card2);
    card1.classList.add('matched');
    card2.classList.add('matched');
    this.audioController.match();
    if (this.matchedCards.length === this.cardsArray.length) this.victory();
  }
  cardMismatch(card1, card2) {
    this.busy = true;
    setTimeout(() => {
      card1.classList.remove('visible');
      card2.classList.remove('visible');
      this.busy = false;
    }, 1000);
  }
  shuffleCards(cardsArray) { // Fisher–Yates
    for (let i = cardsArray.length - 1; i > 0; i--) {
      const randIndex = Math.floor(Math.random() * (i + 1));
      cardsArray[randIndex].style.order = i;
      cardsArray[i].style.order = randIndex;
    }
  }
  getCardType(card) { return card.getElementsByClassName('card-value')[0].src; }
  canFlipCard(card) { return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck; }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}

function ready() {
  const overlays = Array.from(document.getElementsByClassName('overlay-text'));
  const cards    = Array.from(document.getElementsByClassName('card'));
  const game     = new MixOrMatch(100, cards);

  overlays.forEach(overlay => {
    overlay.addEventListener('click', () => {
      overlay.classList.remove('visible');
      game.startGame();
    });
  });

  cards.forEach(card => {
    card.addEventListener('click', () => game.flipCard(card));
  });
}

/* ============================================
   FARCASTER MINIAPP — unified exact-fit wrapper
   - Works on iOS + Android
   - Forces 4×4 (CSS handles columns), desktop size,
     then scales one wrapper to fit viewport.
============================================ */
(function () {
  // Only run inside Farcaster (classes are added in index.html SDK script)
  const inMiniapp = document.documentElement.classList.contains('in-miniapp') ||
                    document.body.classList.contains('in-miniapp');
  if (!inMiniapp) return;

  const body  = document.body;
  const title = document.querySelector('.page-title');
  const info  = document.querySelector('.game-info-container');
  const grid  = document.querySelector('.game-container');
  if (!(title && info && grid)) return;

  // Create a single stage wrapper (idempotent)
  let stage = document.querySelector('.miniapp-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'miniapp-stage';
    // Keep DOM order: title → info → grid (move them into stage)
    body.insertBefore(stage, title);
    stage.appendChild(title);
    stage.appendChild(info);
    stage.appendChild(grid);
  }

  // Debounced fit
  let rafId = 0, tId = 0;
  const requestFit = (ms = 0) => {
    if (rafId) cancelAnimationFrame(rafId);
    if (tId) clearTimeout(tId);
    tId = setTimeout(() => { rafId = requestAnimationFrame(fitStage); }, ms);
  };

  // Small, device-agnostic breathing room
  const PADS = { side: 24, top: 12, bottom: 20 };

  // Use the smallest reliable viewport candidate
  function getAvailSize() {
    const vv = window.visualViewport;
    const widths  = [vv && vv.width,  window.innerWidth,  document.documentElement.clientWidth].filter(Boolean);
    const heights = [vv && vv.height, window.innerHeight, document.documentElement.clientHeight].filter(Boolean);
    const w = Math.max(0, Math.min.apply(null, widths)  - PADS.side * 2);
    const h = Math.max(0, Math.min.apply(null, heights) - (PADS.top + PADS.bottom));
    return { w, h };
  }

  function fitStage() {
    // Measure unscaled intrinsic size
    stage.style.transform = 'none';
    const rect  = stage.getBoundingClientRect();
    const baseW = rect.width  || 1;
    const baseH = rect.height || 1;

    const { w: availW, h: availH } = getAvailSize();
    let scale = Math.min(availW / baseW, availH / baseH, 1);

    if (!isFinite(scale) || scale <= 0) {
      stage.style.transform = 'scale(1)';
      // try again shortly (Android URL bar anim etc.)
      requestFit(80);
      return;
    }

    stage.style.transformOrigin = 'top center';
    stage.style.transform = `scale(${scale})`;
    stage.style.marginLeft = 'auto';
    stage.style.marginRight = 'auto';
  }

  // Observe layout & viewport changes
  const ro = new ResizeObserver(() => requestFit(0));
  ro.observe(stage);

  const mo = new MutationObserver(() => requestFit(0));
  mo.observe(stage, { attributes: true, childList: true, subtree: true });

  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', () => requestFit(0));
    vv.addEventListener('scroll', () => requestFit(0));
  }
  window.addEventListener('resize', () => requestFit(0));
  window.addEventListener('orientationchange', () => requestFit(100));
  window.addEventListener('pageshow', () => requestFit(120)); // Android restore/bfcache
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestFit(120);
  });

  // First fit: wait for fonts + images, then settle
  async function firstFit() {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
    const imgs = Array.from(stage.querySelectorAll('img'));
    await Promise.allSettled(imgs.map(img => img.complete ? Promise.resolve()
      : new Promise(res => { img.addEventListener('load', res, { once:true }); img.addEventListener('error', res, { once:true }); })));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    requestFit(0);
    setTimeout(() => requestFit(140), 140); // settle pass for Android URL bar
    setTimeout(() => requestFit(300), 300);
  }

  if (document.readyState === 'complete') firstFit();
  else window.addEventListener('load', firstFit, { once: true });
})();