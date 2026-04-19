// All sprites reference files in /public/assets/kenney/kenney_nature-kit/Side/
// gx/gy = isometric grid coordinates (col, row) on a 12x12 grid
// Buildings are drawn programmatically — not sprite-based.
export const WORLD_ELEMENTS = {
  // ── HOME (building: col=3,row=2,w=5,d=4) ──────────────────────────────────
  "home-transport-1": { env:"home", category:"transport", threshold:3,  sprite:"sign.png",             gx:1,  gy:3,  scale:0.9,  label:"Eco commute sign" },
  "home-transport-2": { env:"home", category:"transport", threshold:8,  sprite:"fence_simpleHigh.png",  gx:1,  gy:7,  scale:0.7,  label:"Bike parking"     },
  "home-food-1":      { env:"home", category:"food",      threshold:3,  sprite:"crops_leafsStageA.png", gx:9,  gy:3,  scale:1.1,  label:"Garden bed"       },
  "home-food-2":      { env:"home", category:"food",      threshold:8,  sprite:"crops_leafsStageB.png", gx:10, gy:3,  scale:1.1,  label:"Veggie patch"     },
  "home-food-3":      { env:"home", category:"food",      threshold:12, sprite:"crop_carrot.png",       gx:9,  gy:4,  scale:1.0,  label:"Harvest!"         },
  "home-energy-2":    { env:"home", category:"energy",    threshold:8,  sprite:"fence_simpleLow.png",   gx:0,  gy:7,  scale:0.8,  label:"Clothesline posts"},
  "home-waste-1":     { env:"home", category:"waste",     threshold:3,  sprite:"pot_large.png",         gx:9,  gy:7,  scale:0.85, label:"Compost bin"      },
  "home-waste-2":     { env:"home", category:"waste",     threshold:8,  sprite:"pot_small.png",         gx:10, gy:7,  scale:0.8,  label:"Recycling bin"    },
  "home-shopping-1":  { env:"home", category:"shopping",  threshold:3,  sprite:"sign.png",              gx:0,  gy:5,  scale:0.7,  label:"Library box"      },
  "home-flower-1":    { env:"home", category:"food",      threshold:5,  sprite:"flower_redA.png",       gx:2,  gy:7,  scale:1.0,  label:"Flowers blooming" },
  "home-flower-2":    { env:"home", category:"energy",    threshold:5,  sprite:"flower_yellowA.png",    gx:3,  gy:7,  scale:1.0,  label:"Wildflowers"      },

  // ── OFFICE (building: col=2,row=1,w=8,d=6) ────────────────────────────────
  "office-transport-1": { env:"office", category:"transport", threshold:3, sprite:"sign.png",             gx:0,  gy:3, scale:0.9,  label:"Bike rack"        },
  "office-transport-2": { env:"office", category:"transport", threshold:8, sprite:"fence_simpleHigh.png", gx:10, gy:3, scale:0.8,  label:"Green transit"    },
  "office-food-1":      { env:"office", category:"food",      threshold:3, sprite:"plant_bushSmall.png",  gx:10, gy:4, scale:1.0,  label:"Office garden"    },
  "office-food-2":      { env:"office", category:"food",      threshold:8, sprite:"plant_bushLarge.png",  gx:10, gy:5, scale:1.0,  label:"Green wall"       },
  "office-energy-2":    { env:"office", category:"energy",    threshold:8, sprite:"plant_flatTall.png",   gx:1,  gy:0, scale:0.9,  label:"Green roof plants"},
  "office-waste-1":     { env:"office", category:"waste",     threshold:3, sprite:"pot_large.png",        gx:0,  gy:5, scale:0.85, label:"Recycling station"},
  "office-shopping-1":  { env:"office", category:"shopping",  threshold:3, sprite:"sign.png",             gx:10, gy:7, scale:0.7,  label:"Sustainability board"},

  // ── NEIGHBORHOOD (HouseA: col=0,row=0,w=4,d=4; HouseB: col=7,row=0,w=5,d=4) ──
  "nbhd-transport-1":  { env:"neighborhood", category:"transport", threshold:3, sprite:"sign.png",              gx:4,  gy:5, scale:0.9,  label:"Bike lane"        },
  "nbhd-transport-2":  { env:"neighborhood", category:"transport", threshold:8, sprite:"path_stone.png",        gx:5,  gy:5, scale:1.0,  label:"Green path"       },
  "nbhd-food-1":       { env:"neighborhood", category:"food",      threshold:3, sprite:"crops_cornStageB.png",  gx:10, gy:5, scale:1.2,  label:"Community garden" },
  "nbhd-food-2":       { env:"neighborhood", category:"food",      threshold:8, sprite:"crops_bambooStageB.png",gx:10, gy:6, scale:1.1,  label:"Bamboo grove"     },
  "nbhd-energy-1":     { env:"neighborhood", category:"energy",    threshold:3, sprite:"statue_column.png",     gx:5,  gy:0, scale:0.7,  label:"Solar street lamp"},
  "nbhd-waste-1":      { env:"neighborhood", category:"waste",     threshold:3, sprite:"pot_large.png",         gx:5,  gy:7, scale:0.9,  label:"Compost station"  },
  "nbhd-shopping-1":   { env:"neighborhood", category:"shopping",  threshold:3, sprite:"sign.png",              gx:11, gy:5, scale:0.8,  label:"Local market"     },

  // ── TIER-GATED (all environments) ─────────────────────────────────────────
  "tree-tier-3-l": { env:"all", tier:3, sprite:"tree_fat.png",       gx:11, gy:0, scale:1.2, label:"Tree growing"   },
  "tree-tier-3-r": { env:"all", tier:3, sprite:"tree_default.png",   gx:0,  gy:11,scale:1.0, label:"Tree growing"   },
  "tree-tier-4-l": { env:"all", tier:4, sprite:"tree_tall.png",      gx:11, gy:1, scale:1.3, label:"Forest forming"  },
  "tree-tier-4-r": { env:"all", tier:4, sprite:"tree_oak.png",       gx:0,  gy:10,scale:1.1, label:"Oak tree"        },
  "tree-tier-5-l": { env:"all", tier:5, sprite:"tree_detailed.png",  gx:10, gy:0, scale:1.1, label:"Mature tree"     },
  "tree-tier-5-r": { env:"all", tier:5, sprite:"tree_fat.png",       gx:1,  gy:10,scale:1.0, label:"Mature tree"     },
  "bush-tier-3":   { env:"all", tier:3, sprite:"plant_bush.png",     gx:0,  gy:4, scale:1.0, label:"Bushes"          },
  "bush-tier-4":   { env:"all", tier:4, sprite:"plant_bushLarge.png",gx:11, gy:4, scale:0.9, label:"Lush bushes"     },
  "flower-tier-4": { env:"all", tier:4, sprite:"flower_purpleA.png", gx:1,  gy:8, scale:1.0, label:"Wildflowers"     },
  "flower-tier-5": { env:"all", tier:5, sprite:"flower_purpleC.png", gx:11, gy:7, scale:1.0, label:"Blooming meadow" },
  "grass-tier-2":  { env:"all", tier:2, sprite:"grass_large.png",    gx:6,  gy:11,scale:1.1, label:"Grass returning" },
};
