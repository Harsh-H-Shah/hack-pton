# EcoVerse — Implementation Plan (6-Hour Hackathon)

## Concept
A **2D interactive world** that visually evolves as the user logs sustainable choices. The world is themed to the user's actual environment (home, office, or neighborhood). More green actions = better-looking world. Gamified with XP, tiers, streaks, and celebrations.

**The 2D world is the differentiator** — a WebGL-rendered sprite scene (PixiJS) using real game assets from Kenney.nl. Elements unlock and animate smoothly as the user takes action. The scene looks like a real game, not a web UI.

---

## Stack

| Layer | Choice | Reason |
|-------|--------|---------|
| Framework | Next.js 14 (App Router) | API routes + React, no separate backend |
| DB | SQLite via `better-sqlite3` | Zero config, file-based |
| AI | Gemini 2.0 Flash (vision + text) | Product scanner + transport distance only |
| **2D World** | **PixiJS + `@pixi/react`** | WebGL sprite renderer; official React bindings; 450KB vs Phaser's 980KB; no physics overhead needed |
| **UI Animations** | **GSAP + `@gsap/react`** | Now 100% free (Webflow acquisition); `useGSAP()` hook; handles XP pop-ups, progress bar, counters better than CSS keyframes |
| **Celebration** | **Lottie + `lottie-react`** | Free eco/sustainability animations from LottieFiles; tier-up modal with a proper animated celebration |
| **Game Assets** | **Kenney.nl (CC0)** | 60K+ free public domain sprites; Nature Kit + Modular Buildings covers all our scene needs |
| Charts | Recharts | Easy donut/bar charts in React |
| Styling | CSS Modules + CSS variables | No Tailwind needed |
| iMessage | Photon Spectrum (`spectrum-ts`) | Bonus feature if time allows |
| Auth | None | Single `default-user`, localStorage ID |

---

## The 2D World System

### Core Idea
The world is a **layered CSS scene** — absolutely positioned divs/SVGs forming a background-to-foreground scene. The scene:
1. Has a **tier-driven visual state** (sky color, grass health, smog, light quality)
2. Has **unlockable elements** tied to action categories logged by the user
3. Changes **smoothly via CSS transitions** — no page reloads

### Environment Types (user picks on first visit)
```
🏠 Home       — house + yard + neighborhood street
🏢 Office     — office building + plaza + city backdrop  
🏙️ Neighborhood — park + shops + streets
```
Stored in DB and localStorage. Cannot be changed after selection (keeps scope tight).

### Tier Visual States

| Tier | Name | XP | Sky | Ground | Vibe |
|------|------|----|-----|--------|------|
| 1 | Barren | 0 | Dark grey, smog clouds | Dead grey grass, litter | Bleak post-industrial |
| 2 | Stirring | 50 | Overcast, lighter | Patchy yellow-green | First signs of life |
| 3 | Growing | 150 | Partly cloudy, blue | Green grass | Hopeful |
| 4 | Thriving | 350 | Clear blue, sun visible | Lush green, flowers | Vibrant |
| 5 | Flourishing | 700 | Bright blue, birds | Full greenery, trees | Joyful |
| 6 | Eden | 1200 | Golden hour glow | Rich ecosystem | Paradise |

### Unlockable Scene Elements

Each category has elements that appear progressively as the user logs actions in that category.

**Home environment unlockables:**
- Transport (5+ actions): Bike in driveway, EV charger, bus stop sign
- Food (5+ actions): Vegetable garden, fruit tree, worm bin
- Energy (5+ actions): Solar panels on roof, clothesline, LED lights glowing warm
- Waste (5+ actions): Compost bin, recycling station, clean street
- Shopping (5+ actions): Local market sign, library book exchange box

**Office environment unlockables:**
- Transport: Bike rack full, bus shelter, carpool spots
- Food: Office garden box, water refill station, reusable mug collection
- Energy: Green roof plants, solar facade panels, daylight flooding in
- Waste: Recycling & compost bins, paperless signs
- Shopping: Zero-waste supply cabinet, sustainability board

**Neighborhood environment unlockables:**
- Transport: Protected bike lane, transit shelter, pedestrian crossings
- Food: Community garden beds, farmer's market stall
- Energy: Street solar lamps, community wind turbine
- Waste: Public compost station, clean sidewalks, zero-litter park
- Shopping: Local shops thriving, library, repair cafe

### Scene Implementation (PixiJS WebGL Sprites)

The world is a `<Stage>` (PixiJS canvas) with layered `<Container>` groups. Sprites come from Kenney.nl PNG packs loaded as textures at startup.

```
<Stage width={800} height={450} options={{ backgroundColor: tierSkyColor }}>
  ├── <Graphics> — sky gradient rectangle, changes color by tier
  ├── <SmogOverlay> — tinted overlay, alpha 0.6→0 across tiers 1→4
  ├── <CloudContainer> — 3-4 animated Sprite clouds (kenney cloudA.png)
  ├── <BackgroundContainer> — distant trees/buildings, parallax slow
  ├── <StructureContainer> — main building sprites + unlocked upgrades
  │     Home:   houseA.png + roof.png + solar panels on unlock
  │     Office: buildingA.png + green roof tiles on unlock
  │     Neighborhood: houseTall.png row + parkTile.png
  ├── <GroundContainer> — ground tile row (color tinted by tier)
  │     + garden.png, bike.png, bin.png, etc. on category unlock
  └── <ForegroundContainer> — trees (tier-gated), birds (tier 5+)
</Stage>
```

**Why PixiJS over CSS:**
- Real sprites from Kenney look like an actual game, not a web page
- WebGL = 60fps smooth transitions even with 20+ sprites
- PixiJS `Ticker` drives cloud drift, tree sway, bird flight natively
- Particle emitter (built into PixiJS) for XP sparkles when action logged
- `@pixi/react` makes every sprite a React component — fits our data-driven unlock system naturally

**Sprite unlocking pattern:**
```jsx
{unlocked.has('home-energy-1') && (
  <Sprite texture={textures.solarPanel} x={380} y={120}
    ref={el => { if (el) gsap.from(el, { alpha: 0, y: 140, duration: 0.8 }); }} />
)}
```
GSAP animates the sprite in when it first renders (pop + drop from above).

---

## Project Structure

```
ecoverse/
├── app/
│   ├── globals.css              # Design system + CSS variables
│   ├── layout.js                # Root layout, Navbar
│   ├── page.js                  # HOME: World + quick actions + stats
│   ├── onboarding/page.js       # Environment selector (first visit only)
│   ├── log/page.js              # Full action logging
│   ├── scan/page.js             # Product scanner (camera/upload)
│   ├── dashboard/page.js        # Impact charts + stats
│   ├── transport/page.js        # Route carbon comparator
│   └── api/
│       ├── actions/route.js     # POST log action, GET history
│       ├── world/route.js       # GET world state
│       ├── scan/route.js        # POST image → Gemini → sustainability grade
│       ├── transport/route.js   # POST origin+dest → carbon comparison
│       └── stats/route.js       # GET user stats + equivalencies
├── agent/
│   └── index.mjs                # Photon iMessage agent (bonus)
├── components/
│   ├── Navbar.js
│   ├── world/
│   │   ├── WorldScene.js        # Master 2D scene container
│   │   ├── SkyLayer.js          # Sky + clouds + sun
│   │   ├── StructureLayer.js    # Main building + upgrades
│   │   ├── GroundLayer.js       # Grass + ground elements
│   │   └── worldElements.js     # All unlockable element definitions
│   ├── actions/
│   │   ├── ActionCard.js        # Tappable action card
│   │   ├── ActionGrid.js        # Category tabs + card grid
│   │   └── CustomActionInput.js # Free-text action + Gemini estimate
│   ├── ui/
│   │   ├── TierProgress.js      # XP progress bar
│   │   ├── ImpactCounter.js     # Animated count-up number
│   │   ├── CelebrationModal.js  # Tier-up celebration overlay
│   │   └── EquivalencyCards.js  # "= X trees planted" cards
│   ├── scanner/
│   │   ├── Scanner.js           # Camera/upload input
│   │   └── ScanResult.js        # Grade display + greenwashing alert
│   ├── dashboard/
│   │   ├── CategoryChart.js     # Recharts donut by category
│   │   └── ActionTimeline.js    # Scrollable action history
│   └── transport/
│       └── TransportCompare.js  # Route comparison UI
├── lib/
│   ├── db.js                    # SQLite init + queries
│   ├── gemini.js                # All Gemini calls
│   ├── tiers.js                 # Tier definitions + getTierForXp()
│   ├── actions.js               # Action catalog + helpers
│   ├── impact.js                # CO₂ equivalency formulas
│   └── worldState.js            # Compute which elements are unlocked
├── data/
│   └── actions.json             # Action catalog (categories + actions)
└── package.json
```

---

## Build Order

### PHASE 1 — Foundation (45 min)
**Goal:** Scaffold project, DB, data layer working.

#### 1.0 Download game assets FIRST (do this while waiting for npm install)

**Kenney.nl — free CC0, no account needed:**
- Nature Kit: https://kenney.nl/assets/nature-kit — trees, grass, bushes, rocks (330 PNG sprites)
- Modular Buildings: https://kenney.nl/assets/modular-buildings — house/office components
- City Kit (Suburban): https://kenney.nl/assets/city-kit-suburban — street furniture, fences
- (Optional) Background Elements: https://kenney.nl/assets/background-elements-redux — clouds, sun, sky layers

Place extracted PNGs in `public/assets/kenney/`. You only need ~20-30 sprites total — cherry-pick the ones matching our scene elements list in Phase 3.

**LottieFiles — free eco animations for tier-up celebration:**
- Search "plant growth" and "celebration confetti" at https://lottiefiles.com/free-animations/nature
- Download 2-3 JSON files → `public/animations/`

#### 1.1 Init Next.js + install deps
```bash
npx create-next-app@latest ecoverse --app --js --no-tailwind --src-dir=no
cd ecoverse
npm install better-sqlite3 @google/generative-ai recharts spectrum-ts
npm install pixi.js @pixi/react gsap @gsap/react lottie-react
```

**Bundle note:** PixiJS (~450KB) + GSAP (~70KB) + lottie-react (~40KB) ≈ 560KB extra. Totally fine for a hackathon demo running locally.

#### 1.2 `data/actions.json`
```json
{
  "categories": [
    {
      "id": "transport", "name": "Transport", "emoji": "🚲", "color": "#10b981",
      "actions": [
        { "id": "bike",    "label": "Biked instead of drove",  "xp": 15, "co2": 2.3 },
        { "id": "walk",    "label": "Walked instead of drove", "xp": 10, "co2": 1.8 },
        { "id": "transit", "label": "Took public transit",     "xp": 8,  "co2": 1.5 },
        { "id": "carpool", "label": "Carpooled",               "xp": 6,  "co2": 1.0 }
      ]
    },
    {
      "id": "food", "name": "Food", "emoji": "🥗", "color": "#f59e0b",
      "actions": [
        { "id": "veggie",   "label": "Ate vegetarian meal",    "xp": 8,  "co2": 1.2 },
        { "id": "vegan",    "label": "Ate vegan meal",         "xp": 10, "co2": 1.8 },
        { "id": "local",    "label": "Bought local produce",   "xp": 5,  "co2": 0.5 },
        { "id": "no-waste", "label": "Zero food waste today",  "xp": 7,  "co2": 0.8 }
      ]
    },
    {
      "id": "energy", "name": "Energy", "emoji": "⚡", "color": "#3b82f6",
      "actions": [
        { "id": "air-dry",    "label": "Air-dried laundry",        "xp": 6, "co2": 0.8 },
        { "id": "cold-wash",  "label": "Cold water wash",          "xp": 5, "co2": 0.6 },
        { "id": "lights-off", "label": "Turned off unused lights", "xp": 2, "co2": 0.1 },
        { "id": "unplug",     "label": "Unplugged devices",        "xp": 3, "co2": 0.2 }
      ]
    },
    {
      "id": "waste", "name": "Waste", "emoji": "♻️", "color": "#8b5cf6",
      "actions": [
        { "id": "recycle",  "label": "Recycled properly",              "xp": 5,  "co2": 0.4 },
        { "id": "reusable", "label": "Used reusable bag/bottle",       "xp": 3,  "co2": 0.2 },
        { "id": "compost",  "label": "Composted food scraps",          "xp": 6,  "co2": 0.5 },
        { "id": "repair",   "label": "Repaired instead of replaced",   "xp": 10, "co2": 2.0 }
      ]
    },
    {
      "id": "shopping", "name": "Shopping", "emoji": "🛍️", "color": "#ec4899",
      "actions": [
        { "id": "secondhand",       "label": "Bought secondhand",            "xp": 12, "co2": 3.0 },
        { "id": "sustainable-brand","label": "Chose sustainable brand",      "xp": 8,  "co2": 1.5 },
        { "id": "minimal",          "label": "Skipped unnecessary purchase", "xp": 5,  "co2": 1.0 }
      ]
    }
  ]
}
```

#### 1.3 `lib/tiers.js`
```js
export const TIERS = [
  { id: 1, name: "Barren",      minXp: 0,    emoji: "🌫️", description: "A grey, polluted landscape. Every action helps." },
  { id: 2, name: "Stirring",    minXp: 50,   emoji: "🌱", description: "The first signs of life are appearing." },
  { id: 3, name: "Growing",     minXp: 150,  emoji: "🌿", description: "Green patches spread. The air is clearing." },
  { id: 4, name: "Thriving",    minXp: 350,  emoji: "🌳", description: "A healthy ecosystem is taking shape." },
  { id: 5, name: "Flourishing", minXp: 700,  emoji: "🌸", description: "Nature is abundant. Wildlife has returned." },
  { id: 6, name: "Eden",        minXp: 1200, emoji: "🌍", description: "A paradise. Your choices changed the world." },
];

export function getTierForXp(xp) {
  return [...TIERS].reverse().find(t => xp >= t.minXp) ?? TIERS[0];
}

export function getNextTier(xp) {
  return TIERS.find(t => t.minXp > xp) ?? null;
}
```

#### 1.4 `lib/db.js`
Auto-creates SQLite DB at `./ecoverse.db`. Tables:
- `users(id TEXT PK, name TEXT, environment TEXT, total_xp INT, total_co2_saved REAL, streak_days INT, last_action_date TEXT, created_at TEXT)`
- `actions(id TEXT PK, user_id TEXT, action_id TEXT, category TEXT, xp_earned INT, co2_saved REAL, description TEXT, created_at TEXT)`
- `category_counts(user_id TEXT, category TEXT, count INT, PRIMARY KEY(user_id, category))`

Export functions:
- `getOrCreateUser(id)` — returns user row, creates with defaults if missing
- `setEnvironment(userId, environment)` — sets home/office/neighborhood
- `logAction(userId, actionId, category, xp, co2, description)` — inserts action + updates user totals + updates category_counts
- `getActions(userId, limit=20)` — recent actions
- `getUserStats(userId)` — user row + category breakdown
- `getCategoryCounts(userId)` — `{ transport: 5, food: 3, ... }`

#### 1.5 `lib/actions.js`
- `getActionById(id)` — lookup from catalog
- `getAllCategories()` — all categories with their actions
- `getCategoryById(id)` — single category

#### 1.6 `lib/impact.js`
```js
export function calculateEquivalencies(totalCo2Kg) {
  return {
    treesPlanted:   +(totalCo2Kg / 22).toFixed(1),    // 22 kg/year per tree
    carMilesSaved:  +(totalCo2Kg / 0.404).toFixed(0), // 0.404 kg/mile
    phoneCharges:   +(totalCo2Kg / 0.008).toFixed(0), // 0.008 kg/charge
    flightsOffset:  +(totalCo2Kg / 250).toFixed(2),   // 250 kg/domestic flight
  };
}
```

#### 1.7 `lib/worldState.js`
Computes which scene elements are unlocked based on category counts and tier.

```js
// UNLOCK_THRESHOLDS: { environment: { category: [threshold1, threshold2, threshold3] } }
// Returns { unlockedElements: Set<string>, tier: TierObject }
export function computeWorldState(userId, categoryCounts, totalXp, environment) { ... }
```

Each element has a string ID like `"home-transport-bike"`. The WorldScene component reads these to know what to render.

**End of Phase 1 checkpoint:** Run `node -e "require('./lib/db.js')"` — DB file created, no errors.

---

### PHASE 2 — API Routes (45 min)
**Goal:** All endpoints working before any UI.

#### 2.1 `app/api/actions/route.js`
- **POST** `{ actionId, userId? }` → log action → return `{ success, xp, co2, newTotalXp, tierChanged, newTier }`
- **GET** `?userId=` → recent 20 actions
- Default userId: `"default-user"`

#### 2.2 `app/api/stats/route.js`
- **GET** `?userId=` → `{ user, equivalencies, tier, nextTier, categoryCounts, recentActions }`

#### 2.3 `app/api/world/route.js`
- **GET** `?userId=` → `{ tier, environment, unlockedElements[], totalXp, nextTierXp, categoryCounts }`
- Calls `computeWorldState()` from `lib/worldState.js`
- No Gemini needed — world state is computed from DB data

#### 2.4 `app/api/scan/route.js`
- **POST** `{ imageBase64, userId? }` → Gemini Vision → return grade + analysis
- Gemini prompt returns JSON: `{ grade, productName, materials, carbonImpact, concerns, alternatives, isGreenwashing, greenwashingExplanation, xpReward }`

#### 2.5 `app/api/transport/route.js`
- **POST** `{ origin, destination }` → Gemini estimates distance in km → calculate CO₂ per mode
- EPA emission factors:
  - Car: 0.21 kg/km
  - Bus: 0.089 kg/km
  - Train: 0.041 kg/km
  - Bike/Walk: 0 kg/km
  - Flight: 0.255 kg/km
- Return `{ distanceKm, modes: [{ mode, emoji, co2Kg, label, savingsVsCar }] }`

#### 2.6 `lib/gemini.js`
Single module, exports:
- `analyzeProduct(base64Image)` — vision analysis for scanner
- `estimateDistance(origin, destination)` — returns `{ distanceKm, confidence }`
- `parseActionFromText(text)` — for iMessage agent: maps "biked to class" → `{ actionId: "bike", confidence }`
- `estimateCustomAction(description)` — returns `{ co2Kg, xp, reasoning }` for free-text logging

Uses `@google/generative-ai`. Models:
- `gemini-2.0-flash` for text
- `gemini-2.0-flash` with image part for vision (same model handles both)

All functions: wrap in try/catch, return `null` on failure, log error.

**End of Phase 2 checkpoint:** `curl -X POST http://localhost:3000/api/actions -H 'Content-Type: application/json' -d '{"actionId":"bike"}'` → returns XP.

---

### PHASE 3 — 2D World Scene with PixiJS (1 hr)
**Goal:** The hero feature — a real-looking 2D game world that responds to user's actions.

#### 3.1 `lib/worldElements.js` (element definitions)
Data-driven config for every unlockable sprite:

```js
// Each entry: which environment it appears in, what category count unlocks it,
// which Kenney sprite file to use, and where to place it on the canvas (800×450)
export const WORLD_ELEMENTS = {
  // --- HOME ---
  "home-transport-1": { env:"home", category:"transport", threshold:3,  sprite:"bike.png",        x:130, y:340, scale:0.8,  label:"Your bike"     },
  "home-transport-2": { env:"home", category:"transport", threshold:8,  sprite:"chargingStation.png", x:650,y:310, scale:0.7, label:"EV charger"   },
  "home-food-1":      { env:"home", category:"food",      threshold:3,  sprite:"plantSmall.png",  x:490, y:355, scale:1.0,  label:"Garden bed"    },
  "home-food-2":      { env:"home", category:"food",      threshold:8,  sprite:"plantLarge.png",  x:530, y:335, scale:1.0,  label:"Veggie patch"  },
  "home-energy-1":    { env:"home", category:"energy",    threshold:3,  sprite:"solarPanel.png",  x:360, y:148, scale:0.9,  label:"Solar panels"  },
  "home-energy-2":    { env:"home", category:"energy",    threshold:8,  sprite:"clothesline.png", x:210, y:300, scale:0.8,  label:"Clothesline"   },
  "home-waste-1":     { env:"home", category:"waste",     threshold:3,  sprite:"trashBin.png",    x:600, y:360, scale:0.75, label:"Compost bin"   },
  "home-shopping-1":  { env:"home", category:"shopping",  threshold:3,  sprite:"mailbox.png",     x:50,  y:345, scale:0.8,  label:"Library box"   },
  // --- OFFICE ---
  "office-transport-1":{ env:"office", category:"transport", threshold:3, sprite:"bikeRack.png",   x:90,  y:340, scale:0.9,  label:"Bike rack"    },
  "office-transport-2":{ env:"office", category:"transport", threshold:8, sprite:"busShelter.png", x:680, y:320, scale:0.8,  label:"Bus shelter"  },
  "office-food-1":    { env:"office", category:"food",      threshold:3,  sprite:"plantBox.png",   x:500, y:350, scale:0.9,  label:"Office garden"},
  "office-energy-1":  { env:"office", category:"energy",    threshold:3,  sprite:"solarPanel.png", x:340, y:120, scale:1.0,  label:"Solar facade" },
  "office-waste-1":   { env:"office", category:"waste",     threshold:3,  sprite:"trashBin.png",   x:230, y:345, scale:0.85, label:"Recycling bin"},
  // --- NEIGHBORHOOD ---
  "nbhd-transport-1": { env:"neighborhood", category:"transport", threshold:3, sprite:"roadStraight.png", x:400, y:380, scale:1.2, label:"Bike lane"    },
  "nbhd-food-1":      { env:"neighborhood", category:"food",      threshold:3, sprite:"plantLarge.png",   x:580, y:330, scale:1.1, label:"Community garden"},
  "nbhd-energy-1":    { env:"neighborhood", category:"energy",    threshold:3, sprite:"lampPost.png",     x:140, y:290, scale:0.9, label:"Solar lamp"   },
  // --- TIER-GATED (all environments) ---
  "tree-tier-3-l":    { env:"all", tier:3, sprite:"treeLarge.png",  x:680, y:270, scale:1.2, label:"Tree"   },
  "tree-tier-3-r":    { env:"all", tier:3, sprite:"treeSmall.png",  x:40,  y:300, scale:1.0, label:"Tree"   },
  "tree-tier-4":      { env:"all", tier:4, sprite:"treeTall.png",   x:720, y:240, scale:1.3, label:"Forest" },
  "bird-tier-5":      { env:"all", tier:5, sprite:"bird.png",       x:600, y:80,  scale:0.6, label:"Birds returned!" },
};
```

#### 3.2 `lib/worldState.js` (unchanged from original)
```js
import { WORLD_ELEMENTS } from './worldElements.js';
import { getTierForXp } from './tiers.js';

export function computeWorldState(environment, categoryCounts, totalXp) {
  const tier = getTierForXp(totalXp);
  const unlocked = new Set();

  for (const [id, el] of Object.entries(WORLD_ELEMENTS)) {
    if (el.env !== "all" && el.env !== environment) continue;
    if (el.tier && tier.id >= el.tier) { unlocked.add(id); continue; }
    if (el.category && (categoryCounts[el.category] ?? 0) >= el.threshold) {
      unlocked.add(id);
    }
  }

  return { tier, unlockedElements: [...unlocked] };
}
```

#### 3.3 `components/world/useTextures.js`
Custom hook to preload all Kenney sprites once on mount using PixiJS Assets API:
```js
import { Assets } from 'pixi.js';
// Loads all sprites from /public/assets/kenney/ → returns { textures } map
// Uses Assets.load([...urls]) which batches with a single network round-trip
```

#### 3.4 `components/world/WorldScene.js`
`"use client"` — wraps the PixiJS Stage. Uses `@pixi/react`'s `<Stage>`.

```jsx
import { Stage, Container, Sprite, Graphics } from '@pixi/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Sky color per tier (interpolated)
const SKY_COLORS = [0x3a3a4a, 0x506a60, 0x5b9bd5, 0x87ceeb, 0x1e90ff, 0xffd580];

export default function WorldScene({ environment, tier, unlockedElements }) {
  const { textures, loaded } = useTextures();
  
  if (!loaded) return <WorldSkeleton />; // CSS shimmer placeholder

  return (
    <Stage width={800} height={450} options={{ backgroundColor: SKY_COLORS[tier.id - 1], antialias: true }}>
      {/* Smog overlay — alpha decreases with tier */}
      <SmogLayer tierAlpha={Math.max(0, (5 - tier.id) * 0.15)} />
      {/* Scrolling clouds */}
      <CloudLayer textures={textures} />
      {/* Main building */}
      <StructureLayer environment={environment} tier={tier} textures={textures} unlocked={unlockedElements} />
      {/* Ground + ground-level unlockables */}
      <GroundLayer tier={tier} textures={textures} unlocked={unlockedElements} 
                   elements={Object.entries(WORLD_ELEMENTS).filter(([,e]) => e.layer !== 'structure')} />
      {/* XP sparkle particle container (activated from parent via ref) */}
      <SparkleLayer ref={sparkleRef} textures={textures} />
    </Stage>
  );
}
```

#### 3.5 `components/world/StructureLayer.js`
- Renders main building sprite based on `environment` prop
  - `home` → `houseA.png` centered at x=400
  - `office` → `buildingA.png` centered at x=400
  - `neighborhood` → row of `houseTall.png` tiles
- Structure-layer unlocked sprites rendered on top with GSAP entry animation

#### 3.6 `components/world/GroundLayer.js`
- Ground: `<Graphics>` rectangle, color tinted by tier (brown → green)
- Tile grass sprites along the ground line
- For each ground-layer element: if in `unlocked` set, render `<Sprite>` + GSAP `from({ alpha:0, y: el.y+30 })` on first mount

#### 3.7 `components/world/CloudLayer.js`
- 3 clouds positioned at different x offsets
- `useTick` from `@pixi/react` — moves clouds right, wraps at canvas edge
- Cloud alpha: 0.4 at tier 1 (smoggy grey), 0.9 at tier 4+ (white fluffy)

#### 3.8 XP Sparkle on action log
When user logs an action, parent calls `sparkleRef.current.burst(x, y)`:
- Creates 12 particles using PixiJS `ParticleContainer`
- Each particle: star texture, random velocity, GSAP timeline (rise + fade)
- Total duration: 800ms

**End of Phase 3 checkpoint:** Navigate to `/` — see a real sprite-based scene. Manually add elements to `unlockedElements` array and verify sprites pop in with GSAP animation.

---

### PHASE 4 — Home Page + Action Logging (1 hr)
**Goal:** The primary user flow — fully working.

#### 4.1 `app/onboarding/page.js`
Shown only on first visit (check `localStorage.getItem('ecoverse-env')`).
- 3 large cards: 🏠 Home, 🏢 Office, 🏙️ Neighborhood
- On select: POST `/api/world` with `{ environment }`, save to localStorage, redirect to `/`

#### 4.2 `components/ui/TierProgress.js`
- Props: `{ currentXp, tier, nextTier }`
- Bar: `width: ${(xp - tier.minXp) / (nextTier.minXp - tier.minXp) * 100}%`
- Label: "Tier 3: Growing — 245 XP · 105 to Thriving"

#### 4.3 `components/ui/CelebrationModal.js`
- Full-screen overlay, z-index 1000
- **Lottie animation** (`lottie-react`) — use a "plant growth" or "confetti" JSON from LottieFiles at `/public/animations/celebration.json`
- GSAP timeline for the modal itself: scale from 0.8 → 1 + fade in (0.4s elastic)
- Shows new tier name + emoji + description
- Auto-dismiss 4 seconds or tap to close
- Triggers world state refetch after dismiss (new sprites unlock)

#### 4.4 `components/actions/ActionCard.js`
- Props: `{ action, onLog, justLogged }`
- Large tap target (min 56px height)
- Shows: `action.emoji` (from category) + `action.label` + `+${action.xp} XP`
- `justLogged` prop triggers GSAP animation:
  ```js
  useGSAP(() => {
    if (justLogged) {
      gsap.fromTo(cardRef.current,
        { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        { boxShadow: '0 0 20px 4px rgba(16,185,129,0.6)', duration: 0.3,
          yoyo: true, repeat: 1 });
      gsap.fromTo(xpPopRef.current, { y: 0, opacity: 1 }, { y: -40, opacity: 0, duration: 0.7 });
    }
  }, [justLogged]);
  ```

#### 4.5 `components/actions/ActionGrid.js`
- Props: `{ categories, onLogAction, loggedState }`
- Horizontal scrollable category tabs
- ActionCard grid (2 columns on mobile, 3 on desktop)
- Passes `justLogged` to cards based on `loggedState` map

#### 4.6 `app/page.js` (Home)
```
Layout (top to bottom):
1. WorldScene    — hero, ~50vh, full width
2. TierProgress  — just below world
3. Stats Row     — 3 mini cards: CO₂ Saved | Streak | Actions Today  
4. Quick Actions — top 4 most-common (2 per category row, horizontal scroll)
5. "Log All Actions →" button
```

State management:
- `useEffect` on mount: fetch `/api/world?userId=default-user` and `/api/stats?userId=default-user`
- On first visit: redirect to `/onboarding` if no environment set
- Action tap: optimistic XP increment locally, POST to `/api/actions`, sync response
- If `tierChanged`: show CelebrationModal, then refetch world state (new elements unlock)

#### 4.7 `app/log/page.js`
```
Layout:
1. ActionGrid (all categories, all actions)
2. Custom Action — text input + "Estimate Impact" → Gemini estimates CO₂ → confirmation card
3. Recent Actions — last 20, with timestamp + category emoji
```

**End of Phase 4 checkpoint:** Open on phone via LAN IP. Tap 15+ actions, see XP accumulate, world elements unlock, celebrate tier-up.

---

### PHASE 5 — Product Scanner (45 min)
**Goal:** Camera → Gemini → sustainability grade. Phone-first.

#### 5.1 `components/scanner/Scanner.js`
```jsx
<input type="file" accept="image/*" capture="environment" onChange={handleCapture} />
```
- On capture: FileReader → base64 → call `onScan(base64)`
- Show image preview while loading
- Large camera button, centered, ≥64px touch target

#### 5.2 `components/scanner/ScanResult.js`
- Props: `{ result }` where result is Gemini's parsed JSON
- Grade badge: A=`#10b981`, B=`#84cc16`, C=`#f59e0b`, D=`#ef4444`, F=`#7f1d1d`
- Product name + materials list
- Carbon impact pill (low/medium/high with colors)
- Concerns list with ⚠️
- Alternatives list with ✅
- **Greenwashing alert**: if `isGreenwashing`, red banner "⚠️ Potential Greenwashing: {explanation}"
- "Earn {xpReward} XP for scanning!" button → POST `/api/actions` with custom scan action

#### 5.3 `app/scan/page.js`
```
1. Scanner (camera/upload)
2. ScanResult (renders after scan)
3. Tips: "What to scan? Packaged food, cleaning products, clothing labels"
```

**End of Phase 5 checkpoint:** Open /scan on phone, photo a snack package, get a grade within 3 seconds.

---

### PHASE 6 — Dashboard (30 min)
**Goal:** Show impact in a compelling way.

#### 6.1 `components/ui/ImpactCounter.js`
- Props: `{ value, label, unit, decimals }`
- Use GSAP to animate a counter object from 0 → value:
  ```js
  useGSAP(() => {
    gsap.to(counter, { val: value, duration: 1.5, ease: "power2.out",
      onUpdate: () => setDisplay(counter.val.toFixed(decimals)) });
  }, [value]);
  ```
- Cleaner than manual `requestAnimationFrame` and respects reduced-motion via GSAP's built-in check

#### 6.2 `components/ui/EquivalencyCards.js`
- Props: `{ equivalencies }` from `lib/impact.js`
- 2×2 grid: 🌳 Trees Planted / 🚗 Car Miles Avoided / 📱 Phones Charged / ✈️ Flights Offset
- Each card: big animated number + icon + label

#### 6.3 `components/dashboard/CategoryChart.js`
- Recharts PieChart (donut) showing CO₂ saved by category
- Custom colors from `actions.json`
- Tooltip shows category name + kg CO₂

#### 6.4 `app/dashboard/page.js`
```
1. Big CO₂ counter (ImpactCounter, 3rem font)
2. EquivalencyCards (2×2)
3. "Your world is Tier X — keep going!"
4. CategoryChart (CO₂ breakdown by category)
5. Action timeline (scrollable list with dates + categories)
6. Stat: "Your choices are X% more sustainable than the avg American"
   — avg American logs ~0 sustainable actions/day; this is always impressive
```

---

### PHASE 7 — Transport + Polish (45 min)

#### 7.1 `app/transport/page.js` + `components/transport/TransportCompare.js`
- Two text inputs: "From" and "To"
- On submit: POST `/api/transport`, show sorted mode cards
- Each card: mode emoji + name + CO₂ kg + "X% less than car" badge
- Greenest option gets a ✅ glow border
- "Log this trip" button → if biked/walked/transit, adds XP

#### 7.2 Animation polish (GSAP handles most of this now)
CSS only needs:
- `@keyframes fade-in` — page mount (simple, CSS is fine)
- CSS variables: `--color-tier-1` through `--color-tier-6`
- `.world-skeleton` shimmer animation for PixiJS loading state

**GSAP handles:**
- XP pop-ups on ActionCard
- TierProgress bar width tween (gsap.to width on XP change)
- CelebrationModal entrance
- ImpactCounter number roll-up
- Sprite entry animations in WorldScene

**Lottie handles:**
- Tier-up celebration animation
- (Optional) Loading spinner eco animation

Register GSAP plugins once in `app/layout.js`:
```js
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);
```

#### 7.3 Mobile QA checklist
- [ ] All touch targets ≥ 48px
- [ ] World scene fills width on iPhone Safari
- [ ] Camera opens directly on /scan (no file picker dialog)
- [ ] ActionCards don't overflow on small screen
- [ ] No horizontal scroll on any page except ActionGrid tabs

#### 7.4 iMessage Agent (bonus — only if ahead of schedule)
`agent/index.mjs`:
- `spectrum-ts` connects via Photon Spectrum
- Parse incoming message with Gemini → map to action
- Log via direct DB import (shared SQLite file)
- Reply: "Logged: Biked instead of drove! +15 XP 🌱 You're now at 245 XP (Tier 3: Growing)"
- Special: text "stats" → returns full summary
- Special: text "world" → returns tier + list of unlocked elements

---

## CSS Design System (`globals.css`)

```css
:root {
  --bg: #0a0e1a;
  --surface: #12182a;
  --surface-hover: #1a2238;
  --border: #1e2d4a;
  --text: #e8edf5;
  --text-muted: #8899bb;
  --accent: #10b981;
  --accent-glow: rgba(16, 185, 129, 0.3);
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius: 12px;
  --radius-sm: 8px;
}

/* Tier color palette */
--tier-1: #4a4a5e; /* grey */
--tier-2: #6b8c6b; /* muted green */
--tier-3: #5a9a5a; /* green */
--tier-4: #3d8f3d; /* bright green */
--tier-5: #2d7d2d; /* deep green */
--tier-6: #1a6b1a; /* rich forest */
```

---

## Environment Variables (`.env.local`)
```
GEMINI_API_KEY=your-key-here
PHOTON_PROJECT_ID=0c8bfd35-90d9-4413-a24d-0f44aa955d1a
PHOTON_SECRET=secret
```

---

## Commands
```bash
# Install deps
cd ecoverse
npm install better-sqlite3 @google/generative-ai recharts spectrum-ts
npm install pixi.js @pixi/react gsap @gsap/react lottie-react

# Dev server (accessible from phone on LAN)
npm run dev -- --hostname 0.0.0.0

# Find LAN IP for phone access
ipconfig getifaddr en0
# Phone accesses: http://<that-ip>:3000

# iMessage agent (separate terminal, bonus)
node agent/index.mjs

# Quick API test after Phase 2
curl -X POST http://localhost:3000/api/actions \
  -H 'Content-Type: application/json' \
  -d '{"actionId":"bike"}'
```

## Free Asset Sources

| Resource | URL | What to grab |
|----------|-----|--------------|
| Kenney Nature Kit | https://kenney.nl/assets/nature-kit | trees, plants, bushes, rocks |
| Kenney Modular Buildings | https://kenney.nl/assets/modular-buildings | house/office sprites |
| Kenney City Kit Suburban | https://kenney.nl/assets/city-kit-suburban | street furniture, fences, lamp posts |
| Kenney Background Elements | https://kenney.nl/assets/background-elements-redux | clouds, sun |
| LottieFiles Nature | https://lottiefiles.com/free-animations/nature | plant growth animation |
| LottieFiles Eco-Friendly | https://lottiefiles.com/free-animations/eco-friendly | celebration / recycling |
| AI Pixel Art (if needed) | https://www.pixellab.ai/ | generate custom sprites in consistent style |

---

## 6-Hour Schedule

| Hour | Phase | Milestone |
|------|-------|-----------|
| 0:00–0:45 | Phase 1 | Project init, DB, data layer |
| 0:45–1:30 | Phase 2 | All API routes + Gemini lib |
| 1:30–2:30 | Phase 3 | 2D world scene working |
| 2:30–3:30 | Phase 4 | Home page + action logging on phone |
| 3:30–4:15 | Phase 5 | Product scanner working on phone |
| 4:15–4:45 | Phase 6 | Dashboard with charts |
| 4:45–5:30 | Phase 7 | Transport + CSS polish + mobile QA |
| 5:30–6:00 | Buffer  | Bug fixes, demo rehearsal, iMessage if ahead |

**Cut if behind:** Transport page (Phase 7.1) and iMessage agent are nice-to-have. Core demo is Phases 1–6.

---

## Demo Flow (5 min)

1. **Open home on laptop** — show Tier 1 barren world (grey, smoggy)
2. **Log 4 transport actions on phone** — XP ticks up, bike appears in yard
3. **Log food + energy actions** — garden grows, solar panels appear on house
4. **Cross Tier 3 boundary** — confetti, world transforms (blue sky, green grass)
5. **Open scanner on phone** — scan a snack package, show sustainability grade
6. **Open dashboard** — charts, "= 2.3 trees planted"
7. **Open transport** — compare driving vs biking to campus
8. **(Bonus)** Text iMessage "biked to class" — agent responds, XP updates live

---

## What Makes This Different
- **Real game engine (PixiJS)** — WebGL-rendered sprite world, not a web UI. Looks like an actual game.
- **No AI image generation lag** — world responds in <100ms, no waiting for Gemini
- **Tactile gamification** — GSAP animations + Lottie celebrations make logging actions feel rewarding
- **Environmental identity** — your world reflects YOUR environment (home vs office vs neighborhood)
- **Greenwashing detection** — scanner calls out misleading sustainability claims with Gemini Vision
- **iMessage-native** — log actions without opening a browser (bonus feature)
