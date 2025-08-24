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
    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
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
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
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
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }
    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else 
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    shuffleCards(cardsArray) { // Fisher-Yates Shuffle Algorithm.
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            cardsArray[randIndex].style.order = i;
            cardsArray[i].style.order = randIndex;
        }
    }
    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MixOrMatch(100, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}
// === Farcaster miniapp: robust exact-fit zoom ===
(function () {
  if (!document.documentElement.classList.contains('in-miniapp')) return;

  const body  = document.body;
  const title = document.querySelector('.page-title');
  const info  = document.querySelector('.game-info-container');
  const grid  = document.querySelector('.game-container');
  if (!(title && info && grid)) return;

  // Stage wrapper we can scale
  let stage = document.querySelector('.miniapp-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'miniapp-stage';
    body.insertBefore(stage, title);
    stage.appendChild(title);
    stage.appendChild(info);
    stage.appendChild(grid);
  }

  // Debounced, resilient fit
  let rafId = 0, timerId = 0;
  function requestFit(ms = 0) {
    if (rafId) cancelAnimationFrame(rafId);
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      rafId = requestAnimationFrame(fitStage);
    }, ms);
  }

  function fitStage() {
    // Temporarily remove scale to measure natural size
    stage.style.transform = 'none';

    // Safety padding so UI chrome doesn't overlap
    const sidePad = 16;
    const topPad = 8;
    const bottomPad = 10;

    const vv = window.visualViewport || window; // iOS often more accurate
    const availW = Math.max(0, (vv.width  || window.innerWidth)  - sidePad * 2);
    const availH = Math.max(0, (vv.height || window.innerHeight) - (topPad + bottomPad));

    // Measure after current layout
    const rect = stage.getBoundingClientRect();
    const baseW = rect.width  || 1;
    const baseH = rect.height || 1;

    const scale = Math.min(availW / baseW, availH / baseH, 1);
    stage.style.transformOrigin = 'top center';
    stage.style.transform = `scale(${scale})`;

    // Center horizontally
    stage.style.marginLeft = 'auto';
    stage.style.marginRight = 'auto';
  }

  // Refit on things that can change layout
  const ro = new ResizeObserver(() => requestFit(0));
  ro.observe(stage);

  // Overlays appearing/disappearing, font swaps, image loads, etc.
  const mo = new MutationObserver(() => requestFit(0));
  mo.observe(stage, { attributes: true, childList: true, subtree: true });

  // Visual viewport changes (keyboard, system bars, rotate)
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', () => requestFit(0));
    vv.addEventListener('scroll', () => requestFit(0));
  }
  window.addEventListener('resize', () => requestFit(0));
  window.addEventListener('orientationchange', () => requestFit(50));

  // Wait for fonts & images before first fit to avoid “zoomed” first frame
  async function readyThenFit() {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
    // Wait for all images in stage
    const imgs = Array.from(stage.querySelectorAll('img'));
    await Promise.allSettled(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => { img.addEventListener('load', res, { once:true }); img.addEventListener('error', res, { once:true }); });
    }));
    // Double RAF + small timeout lets Safari settle its viewport height
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    requestFit(10);
  }

  // Initial fit after DOM & (most) resources
  if (document.readyState === 'complete') readyThenFit();
  else window.addEventListener('load', readyThenFit, { once: true });
})();