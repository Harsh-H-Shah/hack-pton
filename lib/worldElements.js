// All sprites reference files in /public/assets/kenney/ (flat copy of kenney_nature-kit/Side/)
// Buildings are drawn with PixiJS Graphics (no sprite needed).
// x/y positions for an 800×450 canvas.
export const WORLD_ELEMENTS = {
  // ── HOME ──────────────────────────────────────────────────────────────────
  "home-transport-1": { env:"home", category:"transport", threshold:3,  sprite:"sign.png",             x:130, y:345, scale:0.9,  label:"Eco commute sign" },
  "home-transport-2": { env:"home", category:"transport", threshold:8,  sprite:"fence_simpleHigh.png",  x:620, y:330, scale:0.7,  label:"Bike parking"     },
  "home-food-1":      { env:"home", category:"food",      threshold:3,  sprite:"crops_leafsStageA.png", x:490, y:355, scale:1.1,  label:"Garden bed"       },
  "home-food-2":      { env:"home", category:"food",      threshold:8,  sprite:"crops_leafsStageB.png", x:530, y:345, scale:1.1,  label:"Veggie patch"     },
  "home-food-3":      { env:"home", category:"food",      threshold:12, sprite:"crop_carrot.png",       x:555, y:360, scale:1.0,  label:"Harvest!"         },
  "home-energy-1":    { env:"home", category:"energy",    threshold:3,  sprite:"statue_column.png",     x:355, y:160, scale:0.6,  label:"Solar array"      },
  "home-energy-2":    { env:"home", category:"energy",    threshold:8,  sprite:"fence_simpleLow.png",   x:200, y:345, scale:0.8,  label:"Clothesline posts"},
  "home-waste-1":     { env:"home", category:"waste",     threshold:3,  sprite:"pot_large.png",         x:600, y:355, scale:0.85, label:"Compost bin"      },
  "home-waste-2":     { env:"home", category:"waste",     threshold:8,  sprite:"pot_small.png",         x:640, y:360, scale:0.8,  label:"Recycling bin"    },
  "home-shopping-1":  { env:"home", category:"shopping",  threshold:3,  sprite:"sign.png",              x:55,  y:345, scale:0.7,  label:"Library box"      },
  "home-flower-1":    { env:"home", category:"food",      threshold:5,  sprite:"flower_redA.png",       x:460, y:358, scale:1.0,  label:"Flowers blooming" },
  "home-flower-2":    { env:"home", category:"energy",    threshold:5,  sprite:"flower_yellowA.png",    x:580, y:358, scale:1.0,  label:"Wildflowers"      },

  // ── OFFICE ────────────────────────────────────────────────────────────────
  "office-transport-1": { env:"office", category:"transport", threshold:3, sprite:"sign.png",             x:90,  y:345, scale:0.9,  label:"Bike rack"        },
  "office-transport-2": { env:"office", category:"transport", threshold:8, sprite:"fence_simpleHigh.png", x:680, y:330, scale:0.8,  label:"Green transit"    },
  "office-food-1":      { env:"office", category:"food",      threshold:3, sprite:"plant_bushSmall.png",  x:500, y:352, scale:1.0,  label:"Office garden"    },
  "office-food-2":      { env:"office", category:"food",      threshold:8, sprite:"plant_bushLarge.png",  x:545, y:342, scale:1.0,  label:"Green wall"       },
  "office-energy-1":    { env:"office", category:"energy",    threshold:3, sprite:"statue_column.png",    x:340, y:135, scale:0.65, label:"Solar panels"     },
  "office-energy-2":    { env:"office", category:"energy",    threshold:8, sprite:"plant_flatTall.png",   x:290, y:300, scale:0.9,  label:"Green roof plants"},
  "office-waste-1":     { env:"office", category:"waste",     threshold:3, sprite:"pot_large.png",        x:230, y:352, scale:0.85, label:"Recycling station"},
  "office-shopping-1":  { env:"office", category:"shopping",  threshold:3, sprite:"sign.png",             x:600, y:345, scale:0.7,  label:"Sustainability board"},

  // ── NEIGHBORHOOD ──────────────────────────────────────────────────────────
  "nbhd-transport-1":  { env:"neighborhood", category:"transport", threshold:3, sprite:"sign.png",              x:120, y:355, scale:0.9,  label:"Bike lane"        },
  "nbhd-transport-2":  { env:"neighborhood", category:"transport", threshold:8, sprite:"path_stone.png",        x:400, y:380, scale:1.5,  label:"Green path"       },
  "nbhd-food-1":       { env:"neighborhood", category:"food",      threshold:3, sprite:"crops_cornStageB.png",  x:580, y:335, scale:1.2,  label:"Community garden" },
  "nbhd-food-2":       { env:"neighborhood", category:"food",      threshold:8, sprite:"crops_bambooStageB.png",x:620, y:320, scale:1.1,  label:"Bamboo grove"     },
  "nbhd-energy-1":     { env:"neighborhood", category:"energy",    threshold:3, sprite:"statue_column.png",     x:140, y:295, scale:0.7,  label:"Solar street lamp"},
  "nbhd-waste-1":      { env:"neighborhood", category:"waste",     threshold:3, sprite:"pot_large.png",         x:400, y:355, scale:0.9,  label:"Compost station"  },
  "nbhd-shopping-1":   { env:"neighborhood", category:"shopping",  threshold:3, sprite:"sign.png",              x:650, y:345, scale:0.8,  label:"Local market"     },

  // ── TIER-GATED (all environments) ─────────────────────────────────────────
  "tree-tier-3-l": { env:"all", tier:3, sprite:"tree_fat.png",      x:680, y:272, scale:1.2, label:"Tree growing"     },
  "tree-tier-3-r": { env:"all", tier:3, sprite:"tree_default.png",  x:45,  y:298, scale:1.0, label:"Tree growing"     },
  "tree-tier-4-l": { env:"all", tier:4, sprite:"tree_tall.png",     x:718, y:248, scale:1.3, label:"Forest forming"   },
  "tree-tier-4-r": { env:"all", tier:4, sprite:"tree_oak.png",      x:22,  y:268, scale:1.1, label:"Oak tree"         },
  "bush-tier-3":   { env:"all", tier:3, sprite:"plant_bush.png",    x:82,  y:348, scale:1.0, label:"Bushes"           },
  "bush-tier-4":   { env:"all", tier:4, sprite:"plant_bushLarge.png",x:740, y:345,scale:0.9, label:"Lush bushes"      },
  "flower-tier-4": { env:"all", tier:4, sprite:"flower_purpleA.png",x:200, y:358, scale:1.0, label:"Wildflowers"      },
  "flower-tier-5": { env:"all", tier:5, sprite:"flower_purpleC.png",x:595, y:358, scale:1.0, label:"Blooming meadow"  },
  "grass-tier-2":  { env:"all", tier:2, sprite:"grass_large.png",   x:350, y:362, scale:1.1, label:"Grass returning"  },
};
