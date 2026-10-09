# In All Your Radiance • A Keepsake Memoir for Ritika Raj 🎂📖
Created with love by **Aditya Kaundal**  
*Built with the design aesthetic of HTWKR (How to Talk to White Kids about Racism)*

---

## 📂 Project Structure
```
Happy birthday Ritika/
├── index.html        # Main interactive digital book
├── style.css         # HTWKR-inspired dark cinematic & luxury paper styles
├── script.js         # Page turn physics, audio engine, and candle effects
├── particles-bg.js   # Live React Bits WebGL OGL particles background
├── design.md         # Full design specification and personalized content
├── components/       # React Bits components (Particles.jsx & Particles.css)
│   ├── Particles.jsx # React Bits OGL Particles component
│   └── Particles.css # Particles component CSS
├── assets/
│   ├── images/       # Place your photos here (photo1.jpg, photo2.jpg, photo3.jpg)
│   └── audio/        # Place your favorite nostalgia tracks (track1.mp3, etc.)
└── README.md         # Instructions and deployment guide
```

---

## 🚀 How to Preview Locally

Open PowerShell in this folder and run:
```powershell
npx serve .
```
or simply double-click **`index.html`** in File Explorer to open it in any web browser.

---

## 📷 Customizing Photos
Drop any photos of your shared memories into `assets/images/` (or `images/`):
- `book external cover.jpg` (Hardcover Book Front Cover — *Ritika in the Golden Poppy Field*)
- `photo1.jpg` / `cover photo.jpg` (Appears on Spread 1 — *The Horizon Ahead*)
- `photo2.jpg` / `IMG-20180922-WA0000.jpg` (Appears on Spread 2 — *Keep The Fire Alive*)
- `photo3.jpg` / `IMG-20200511-WA0022.jpg` (Appears on Spread 3 — *Just As You Are*)
- `photo4.jpg` / `IMG-20230507-WA0036.jpg` (Appears on Spread 4 — *Moments In Time*)
- `photo5.jpg` / `Snapchat-662946831.jpg` (Appears on Spread 4 — Candid Polaroid)
- `swing.jpg` (Appears on Spread 5 Left Page — *Do things that you like more often*)
- `mountain.jpg` (Appears on Spread 5 Right Page Polaroid — *Travel more*)
- `dress up more.jpg` (Appears on Spread 5 Right Page Polaroid — no caption)

*(If no photo is present, a minimalist gold constellation art illustration automatically renders as a graceful fallback.)*

---

## 🎶 How to Integrate Songs or a Playlist

You have **3 flexible ways** to add your songs:

### Method 1: Drop .mp3 Files (Recommended & 100% Offline)
1. Copy your `.mp3` audio files into `assets/audio/`.
2. Open [`script.js`](script.js). At the very top (lines 9–25), customize your songs:
```javascript
const PLAYLIST = [
  {
    title: "Janib",
    artist: "Arijit Singh & Sunidhi Chauhan",
    file: "assets/audio/janib.mp3"
  },
  {
    title: "Rani Mehlan Di",
    artist: "Mickey Singh",
    file: "assets/audio/track1.mp3"
  },
  {
    title: "Uff Teri Adaa",
    artist: "Karthik Calling Karthik",
    file: "assets/audio/track2.mp3"
  },
  {
    title: "Khumaar",
    artist: "Papon • Coke Studio",
    file: "assets/audio/track3.mp3"
  },
  {
    title: "Chaltay Rahein",
    artist: "Kaavish",
    file: "assets/audio/track4.mp3"
  },
  {
    title: "Nange Allava",
    artist: "Sanjith Hegde",
    file: "assets/audio/track5.mp3"
  }
];
```
*(The website will automatically render the playlist buttons and auto-play the next song when one ends! You can pause or resume music anytime using the Pause button in the bottom bar or on Spread 6.)*

### Method 2: Use Direct Web Links
Instead of local `.mp3` files, you can put any direct `.mp3` web link in the `file:` field:
```javascript
file: "https://your-domain.com/music/our-song.mp3"
```

### Method 3: Link Your Shared Spotify / YouTube Playlist
In [`script.js`](script.js), paste your playlist link into `EXTERNAL_PLAYLIST_URL`:
```javascript
const EXTERNAL_PLAYLIST_URL = "https://open.spotify.com/playlist/...";
```
An elegant burnt orange button will appear right under the vinyl player saying:  
`🎧 Open Our Playlist on Spotify ↗`

*(If no custom MP3s are provided yet, an ambient acoustic piano synthesizer plays automatically via the Web Audio API so the book is never silent!)*

---

## 🌐 Sharing & Deployment Plans

### 🚀 Plan A: Vercel Deployment (Permanent Free HTTPS Link)

Vercel provides a free, global, fast CDN with custom URL (e.g. `https://for-ritika.vercel.app`).

#### Method 1: Instant Vercel CLI (Fastest & Simplest from PowerShell)
1. In PowerShell inside `H:\Happy birthday Ritika`:
   ```powershell
   npx vercel
   ```
2. Follow the 3 quick prompts:
   - `Set up and deploy?` → Type **`y`**
   - `Which scope?` → Select your personal account
   - `Link to existing project?` → **`n`**
   - `What's your project's name?` → e.g. **`in-all-your-radiance`**
   - `In which directory is your code located?` → Press **Enter** (`./`)
3. Done! Vercel outputs your production link immediately (e.g., `https://in-all-your-radiance.vercel.app`).
4. To update anytime later, simply run:
   ```powershell
   npx vercel --prod
   ```

#### Method 2: Via GitHub Repo & Vercel Dashboard
1. Push this directory to your GitHub account:
   ```powershell
   git init
   git add .
   git commit -m "In All Your Radiance birthday book"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository.
4. Click **Deploy**. Any future commit automatically re-deploys in seconds.

---

### ⚡ Plan B: Share Localhost Instantly (Zero Deployment / Direct Live Tunnel)

If you want her to experience it right now running directly from your computer without uploading or deploying to any cloud service:

#### Method 1: Cloudflare Tunnel (100% Free, No Account Needed, HTTPS)
1. Start your local server in one PowerShell terminal:
   ```powershell
   npx serve .
   ```
   *(Note the port, e.g. `http://localhost:3000`)*
2. In a second PowerShell window, run Cloudflare's quick tunnel:
   ```powershell
   npx cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare gives you an instant, secure public HTTPS URL (e.g. `https://random-words.trycloudflare.com`) that anyone in the world can open on their phone or laptop as long as your terminal remains open!

#### Method 2: Localtunnel (Zero Install)
1. Start your local server:
   ```powershell
   npx serve .
   ```
2. In a second PowerShell window, run:
   ```powershell
   npx localtunnel --port 3000
   ```
3. Copy the generated `.loca.lt` URL and send it to her.

#### Method 3: Ngrok
```powershell
ngrok http 3000
```
Provides an instant `https://xxxx.ngrok-free.app` live tunnel.
