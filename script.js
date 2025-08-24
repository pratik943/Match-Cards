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
    stopMusic() { this.bgMusic.pause(); this.bgMusic.currentTime = 0; }
    flip()      { this.flipSound.play(); }
    match()     { this.matchSound.play(); }
    victory()   { this.stopMusic(); this.victorySound.play(); }
    gameOver()  { this.stopMusic(); this.gameOverSound.play(); }
}

class MixOrMatch {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining')
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
    shuffleCards(cardsArray) { // Fisher-Yates
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
   Farcaster Miniapp — exact-fit zoom (iOS + Android)
============================================ */
(function () {
  if (!document.documentElement.classList.contains('in-miniapp')) return;

  const body  = document.body;
  const title = document.querySelector('.page-title');
  const info  = document.querySelector('.game-info-container');
  const grid  = document.querySelector('.game-container');
  if (!(title && info && grid)) return;

  // Wrap the main UI in a stage we can scale
  let stage = document.querySelector('.miniapp-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'miniapp-stage';
    body.insertBefore(stage, title); // keep order
    stage.appendChild(title);
    stage.appendChild(info);
    stage.appendChild(grid);
  }

  let rafId = 0, timerId = 0;
  const requestFit = (ms = 0) => {
    if (rafId) cancelAnimationFrame(rafId);
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => { rafId = requestAnimationFrame(fitStage); }, ms);
  };

  // Use the smallest of multiple viewport candidates (Android-safe)
  function getAvailSize() {
    const vv = window.visualViewport;
    const candW = [vv && vv.width, window.innerWidth, document.documentElement.clientWidth].filter(Boolean);
    const candH = [vv && vv.height, window.innerHeight, document.documentElement.clientHeight].filter(Boolean);

    // Conservative breathing room, device-agnostic
    const sidePad   = 24; // px
    const topPad    = 16; // px
    const bottomPad = 22; // px

    const w = Math.max(0, Math.min.apply(null, candW) - sidePad * 2);
    const h = Math.max(0, Math.min.apply(null, candH) - (topPad + bottomPad));
    return { w, h };
  }

  function fitStage() {
    // Measure unscaled intrinsic size
    stage.style.transform = 'none';
    const rect = stage.getBoundingClientRect();
    const baseW = rect.width  || 1;
    const baseH = rect.height || 1;

    const { w: availW, h: availH } = getAvailSize();
    let scale = Math.min(availW / baseW, availH / baseH, 1);

    if (!isFinite(scale) || scale <= 0) {
      stage.style.transform = 'scale(1)';
      requestFit(50);
      return;
    }

    stage.style.transformOrigin = 'top center';
    stage.style.transform = `scale(${scale})`;
    stage.style.marginLeft = 'auto';
    stage.style.marginRight = 'auto';
    stage.style.padding = '6px 0 10px'; // soft cushion inside stage
  }

  // React to layout & viewport changes
  new ResizeObserver(() => requestFit(0)).observe(stage);
  new MutationObserver(() => requestFit(0)).observe(stage, { attributes: true, childList: true, subtree: true });

  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', () => requestFit(0));
    vv.addEventListener('scroll', () => requestFit(0));
  }
  window.addEventListener('resize', () => requestFit(0));
  window.addEventListener('orientationchange', () => requestFit(100));
  window.addEventListener('pageshow', () => requestFit(100)); // Android restore/bfcache
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestFit(100);
  });

  // Initial fit — wait for fonts/images & let layout settle
  async function readyThenFit() {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
    const imgs = Array.from(stage.querySelectorAll('img'));
    await Promise.allSettled(imgs.map(img => img.complete ? Promise.resolve()
      : new Promise(res => { img.addEventListener('load', res, { once:true }); img.addEventListener('error', res, { once:true }); })));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    requestFit(0);
    setTimeout(() => requestFit(140), 140);  // handle Android URL bar animation
    setTimeout(() => requestFit(280), 280);
  }

  if (document.readyState === 'complete') readyThenFit();
  else window.addEventListener('load', readyThenFit, { once: true });
})();