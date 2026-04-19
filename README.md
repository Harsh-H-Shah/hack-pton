# Live, Laugh, Plant 🌱

**Live, Laugh, Plant** is a gamified sustainability web app that lets users explore a 3D world, scan products with OCR, and track their eco‑friendly actions.  The project includes:

- A **Next.js** front‑end with a retro‑styled 3D environment built on `react‑three‑fiber` and `@react‑three/drei`.
- An **AI‑powered scanner** powered by Google Gemini that returns structured carbon‑emission data.
- A **Photon agent** that listens for iMessage events and replies with a simple "hello world" (can be extended to categorize actions).
- A **rebranded UI** using modern `Inter` and `Outfit` fonts for high visibility.

## Quick Start

```bash
# 1. Clone the repo (if you haven't already)
git clone https://github.com/Harsh-H-Shah/hack-pton.git
cd hack-pton

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local   # copy the example file
# Edit .env.local and fill in your:
#   PHOTON_PROJECT_ID, PHOTON_SECRET, IMESSAGE_DEVICE_ID (e.g. iPhone8)
#   (optional) IMESSAGE_APP_NAME, GEMINI_API_KEY

# 4. Run the web app
npm run dev   # starts Next.js on http://localhost:3000

# 5. Run the Photon iMessage agent (in a separate terminal)
npm run agent
```

## Project Structure

```
HackPrinceton/
├─ app/                # Next.js pages & layout
│  ├─ globals.css      # Global CSS with new font tokens
│  └─ …                # other pages (dashboard, scan, etc.)
├─ components/        # React components (WorldCanvas, Navbar, …)
├─ lib/               # Gemini helper utilities
├─ agent/             # Photon iMessage agent (index.js)
├─ .env.local         # Private env vars (not committed)
└─ README.md          # <‑‑ you are reading this
```

## Agent Details

The agent lives in `agent/index.js` and uses the **spectrum‑ts** library to connect to Photon.  It loads configuration from `.env.local` and replies to any incoming iMessage text with `"hello world"`.  To extend it:

1. Implement your own `categorizeAndRespond` function (see the commented‑out code in `index.js`).
2. Replace the simple `await space.send("hello world")` with the response from that function.

## Styling & Branding

- Fonts: `Inter` (body) and `Outfit` (retro UI) are loaded via `next/font/google` in `app/layout.js`.
- Colors: Dark‑mode palette with high contrast for readability.
- All occurrences of **EcoVerse** have been replaced with **Live, Laugh, Plant**.

## Contributing

Feel free to open issues or submit pull requests.  For new features, follow the existing design system and keep the UI consistent with the high‑visibility guidelines.

## License

MIT © Harsh Shah
