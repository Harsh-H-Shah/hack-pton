# Live, Laugh, Plant 🌱

**Live, Laugh, Plant** is a gamified sustainability web app where users explore a 2D pixel world, scan products with AI-powered OCR, log eco-friendly actions, and get celebrated via iMessage by a Gemini-powered coaching agent.

## Features

- **2D Pixel World** — PixiJS sprite-based environment that evolves as you earn XP
- **AI Product Scanner** — Point your camera at any product; Gemini 2.5 Flash returns a carbon grade (A–F), emissions breakdown, and greenwashing flags
- **Action Tracker** — Log sustainability actions across 6 categories; earn XP and CO₂ savings
- **iMessage Agent** — Text what you did; the agent categorizes it and replies with a quirky plant-pun celebration
- **Dashboard** — Charts your impact by category over time

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Harsh-H-Shah/hack-pton.git
cd hack-pton

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in GEMINI_API_KEY, PHOTON_PROJECT_ID, PHOTON_SECRET

# 4. Run the web app
npm run dev        # http://localhost:3000

# 5. Run the iMessage agent (separate terminal)
npm run agent
```

## Project Structure

```
HackPrinceton/
├─ app/               # Next.js App Router pages & API routes
│  ├─ api/            # scan, actions, transport, world, stats
│  └─ globals.css     # Design system & component styles
├─ components/        # React components (WorldCanvas, Scanner, …)
├─ lib/               # gemini.js, db.js, worldState.js
├─ data/
│  └─ actions.json    # 6 categories + all action definitions
├─ agent/
│  └─ index.js        # Spectrum iMessage agent
└─ .env.local.example
```

## iMessage Agent (Photon / Spectrum)

The agent lives in `agent/index.js` and uses [spectrum-ts](https://github.com/photon-codes/spectrum-ts) to connect to the Photon iMessage relay.

### How it works

1. User texts the Photon-assigned iMessage number with a description of something eco-friendly they did (e.g. *"I biked to work today"* or *"planted a tree in my backyard"*).
2. The agent receives the message via Spectrum's cloud gRPC stream.
3. Gemini 2.5 Flash classifies the action into one of **6 categories** and generates a quirky plant-pun reply.
4. The agent sends the reply back via `space.send()`.

### Categories

| Emoji | Category | Example actions |
|-------|----------|----------------|
| 🚲 | Transport | Biked, walked, took transit, carpooled |
| 🥗 | Food | Ate vegan/vegetarian, bought local, zero food waste |
| ⚡ | Energy | Cold wash, air dry, unplugged devices, solar, thermostat |
| ♻️ | Waste | Recycled, composted, used reusables, repaired |
| 🛍️ | Shopping | Bought secondhand, sustainable brand, skipped purchase |
| 🌳 | Nature | Planted tree/sapling, community cleanup, pollinator plants, rainwater collection |

### Environment variables

| Variable | Description |
|----------|-------------|
| `PHOTON_PROJECT_ID` | Your Photon project UUID (from the dashboard) |
| `PHOTON_SECRET` | Your Photon project secret |
| `GEMINI_API_KEY` | Google Generative AI key |

### Running the agent

```bash
npm run agent
```

The agent must run in the **foreground** in its own terminal — it streams messages in real time and does not daemonize.

## License

MIT © Harsh Shah
