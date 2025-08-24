/* =======================
   GAME LOGIC
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
      card.classList.remove('visible', 'matched');
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
  shuffleCards(cardsArray) {
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
  cards.forEach(card => card.addEventListener('click', () => game.flipCard(card)));
}

/* ============================================
   FARCASTER MINIAPP — unified stage scaling
============================================ */
(function () {
  const inMiniapp = document.documentElement.classList.contains('in-miniapp');
  if (!inMiniapp) return;

  const body  = document.body;
  const title = document.querySelector('.page-title');
  const info  = document.querySelector('.game-info-container');
  const grid  = document.querySelector('.game-container');
  if (!(title && info && grid)) return;

  // Wrap content
  let stage = document.querySelector('.miniapp-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'miniapp-stage';
    body.insertBefore(stage, title);
    stage.appendChild(title);
    stage.appendChild(info);
    stage.appendChild(grid);
  }

  function fitStage() {
    stage.style.transform = 'none';
    const rect  = stage.getBoundingClientRect();
    const baseW = rect.width  || 1;
    const baseH = rect.height || 1;

    const vv = window.visualViewport;
    const availW = (vv?.width || window.innerWidth) - 20;
    const availH = (vv?.height || window.innerHeight) - 20;
    const scale = Math.min(availW / baseW, availH / baseH, 1);

    stage.style.transformOrigin = 'top center';
    stage.style.transform = `scale(${scale})`;
  }

  const requestFit = () => requestAnimationFrame(fitStage);
  window.addEventListener('resize', requestFit);
  window.addEventListener('orientationchange', () => setTimeout(requestFit, 100));
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', requestFit);
    visualViewport.addEventListener('scroll', requestFit);
  }

  window.addEventListener('load', requestFit, { once: true });
})();