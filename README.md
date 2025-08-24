# 🎃 Mix-Or-Match — Farcaster Miniapp  

A spooky **card matching game** adapted into a **Farcaster Miniapp**.  
Play by flipping cards and matching all pairs before the timer runs out.  

---

## ✨ Features  
- 🎵 Background music + sound effects (flip, match, win, lose)  
- 🕸️ Creepy custom fonts, cursors, and Halloween assets  
- 🃏 16 cards (8 pairs), fully shuffleable  
- ⏱️ Countdown timer + flip counter  
- 🏆 Win and Game Over overlays  
- 📱 Responsive layout — fits web browsers & Farcaster Miniapp frames  
- ⚡ Auto-scaling stage so the game fits **exactly** inside the miniapp viewport  

---

## 📂 Project Structure  
```
.
├── index.html       # Main HTML, includes Farcaster miniapp meta + SDK
├── styles.css       # Game styling + responsive + miniapp overrides
├── script.js        # Game logic + Farcaster miniapp zoom/fit helper
└── Assets/
    ├── Audio/       # creepy.mp3, flip.wav, match.wav, victory.wav, gameOver.wav
    ├── Cursors/     # Ghost.cur, GhostHover.cur
    ├── Fonts/       # Creepy.woff, Lunacy.woff
    └── Images/      # Bat.png, Bones.png, Pumpkin.png, etc.
```

---

## 🚀 Getting Started  

### 1. Clone & Install  
```bash
git clone https://github.com/your-username/mix-or-match-miniapp.git
cd mix-or-match-miniapp
```

No build step is required — plain HTML/CSS/JS.  

### 2. Run Locally  
Just open `index.html` in a browser:  
```bash
open index.html   # macOS
start index.html  # Windows
```

Or serve via a dev server (to avoid file:// audio/font issues):  
```bash
npx serve .
```

### 3. Deploy  
Deploy to **Vercel**, **Netlify**, or any static host.  
Example:  
```bash
vercel deploy
```

---

## 🪄 Farcaster Miniapp Setup  

### Miniapp Meta (already inside `index.html`)  
```html
<meta name="fc:miniapp" content='{
  "version":"1",
  "imageUrl":"https://yourdomain.com/image.png",
  "button":{
    "title":"Play Now",
    "action":{
      "type":"launch_frame",
      "name":"Mix Or Match",
      "url":"https://yourdomain.com",
      "splashImageUrl":"https://yourdomain.com/splash.png",
      "splashBackgroundColor":"#111111"
    }
  }
}' />
```

### Miniapp SDK Integration  
```html
<script type="module">
  import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk';
  (async () => {
    try { document.body.classList.add('in-miniapp'); } catch {}
    await sdk.actions.ready(); // tells Farcaster "miniapp is ready"
  })();
</script>
```

---

## 📱 Miniapp Fit Logic  
- Keeps the **desktop board (4×4)** intact  
- Measures the **real Farcaster miniapp viewport**  
- Auto-scales & centers the whole stage  
- Re-fits on resize, rotation, or overlay changes  

👉 Code is at the bottom of `script.js`.  

---

## 🖼️ Preview  
- **Web:** [https://match-cards-ruby.vercel.app](https://match-cards-ruby.vercel.app)  
- **Miniapp:** Open in Warpcast or miniapps.farcaster.xyz  

---

## 🙏 Credits  
- Farcaster Miniapp SDK: [farcasterxyz/miniapp-sdk](https://github.com/farcasterxyz/miniapp-sdk)  
- Adaptation: [@pratiksharma.eth](https://warpcast.com/pratiksharma.eth)  

---

## 📜 License  
MIT — free to use & remix.  
