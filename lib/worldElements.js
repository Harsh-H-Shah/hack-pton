// Sprite filenames reference Kenney.nl Nature Kit + Modular Buildings + City Kit (Suburban)
// Place PNGs in /public/assets/kenney/
// All x/y positions are for an 800×450 canvas
export const WORLD_ELEMENTS = {
  // ── HOME ──────────────────────────────────────────────────────────────────
  "home-transport-1": { env:"home", category:"transport", threshold:3,  sprite:"bike.png",           x:130, y:340, scale:0.8,  label:"Your bike"       },
  "home-transport-2": { env:"home", category:"transport", threshold:8,  sprite:"chargingStation.png",x:650, y:310, scale:0.7,  label:"EV charger"      },
  "home-food-1":      { env:"home", category:"food",      threshold:3,  sprite:"plantSmall.png",     x:490, y:355, scale:1.0,  label:"Garden bed"      },
  "home-food-2":      { env:"home", category:"food",      threshold:8,  sprite:"plantLarge.png",     x:530, y:335, scale:1.0,  label:"Veggie patch"    },
  "home-energy-1":    { env:"home", category:"energy",    threshold:3,  sprite:"solarPanel.png",     x:355, y:148, scale:0.9,  label:"Solar panels"    },
  "home-energy-2":    { env:"home", category:"energy",    threshold:8,  sprite:"fence.png",          x:200, y:300, scale:0.8,  label:"Clothesline"     },
  "home-waste-1":     { env:"home", category:"waste",     threshold:3,  sprite:"trashBin.png",       x:600, y:360, scale:0.75, label:"Compost bin"     },
  "home-shopping-1":  { env:"home", category:"shopping",  threshold:3,  sprite:"mailbox.png",        x:55,  y:345, scale:0.8,  label:"Library box"     },

  // ── OFFICE ────────────────────────────────────────────────────────────────
  "office-transport-1": { env:"office", category:"transport", threshold:3, sprite:"bikeRack.png",    x:90,  y:340, scale:0.9,  label:"Bike rack"       },
  "office-transport-2": { env:"office", category:"transport", threshold:8, sprite:"busShelter.png",  x:680, y:320, scale:0.8,  label:"Bus shelter"     },
  "office-food-1":      { env:"office", category:"food",      threshold:3, sprite:"plantSmall.png",  x:500, y:350, scale:0.9,  label:"Office garden"   },
  "office-energy-1":    { env:"office", category:"energy",    threshold:3, sprite:"solarPanel.png",  x:340, y:120, scale:1.0,  label:"Solar facade"    },
  "office-waste-1":     { env:"office", category:"waste",     threshold:3, sprite:"trashBin.png",    x:230, y:345, scale:0.85, label:"Recycling bin"   },
  "office-shopping-1":  { env:"office", category:"shopping",  threshold:3, sprite:"fence.png",       x:600, y:340, scale:0.7,  label:"Bulletin board"  },

  // ── NEIGHBORHOOD ──────────────────────────────────────────────────────────
  "nbhd-transport-1":  { env:"neighborhood", category:"transport", threshold:3, sprite:"bike.png",      x:120, y:355, scale:0.9,  label:"Bike lane"       },
  "nbhd-food-1":       { env:"neighborhood", category:"food",      threshold:3, sprite:"plantLarge.png",x:580, y:330, scale:1.1,  label:"Community garden"},
  "nbhd-energy-1":     { env:"neighborhood", category:"energy",    threshold:3, sprite:"lampPost.png",  x:140, y:290, scale:0.9,  label:"Solar lamp"      },
  "nbhd-waste-1":      { env:"neighborhood", category:"waste",     threshold:3, sprite:"trashBin.png",  x:400, y:360, scale:0.8,  label:"Compost station" },

  // ── TIER-GATED (all environments) ─────────────────────────────────────────
  "tree-tier-3-l": { env:"all", tier:3, sprite:"treeLarge.png", x:680, y:270, scale:1.2, label:"Tree"            },
  "tree-tier-3-r": { env:"all", tier:3, sprite:"treeSmall.png", x:40,  y:300, scale:1.0, label:"Tree"            },
  "tree-tier-4":   { env:"all", tier:4, sprite:"treeTall.png",  x:720, y:240, scale:1.3, label:"Forest growing"  },
  "bush-tier-4":   { env:"all", tier:4, sprite:"bush.png",      x:80,  y:340, scale:1.0, label:"Bushes"          },
  "bird-tier-5":   { env:"all", tier:5, sprite:"bird.png",      x:600, y:80,  scale:0.6, label:"Birds returned!" },
};
