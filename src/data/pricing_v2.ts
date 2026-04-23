export type Market = 'NJ' | 'Manhattan';
export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export const TIERS = [
  { label: '0 – 1,500 sqft',   value: 0 },
  { label: '1,501 – 2,000 sqft', value: 1 },
  { label: '2,001 – 3,000 sqft', value: 2 },
  { label: '3,001 – 4,000 sqft', value: 3 },
  { label: '4,001 – 5,000 sqft', value: 4 },
  { label: '5,000+ sqft',       value: 5 },
] as const;

export const NJ_PRICES = {
  // PHOTOGRAPHY — Main (tiered, index 5 = contact us → use 0 as sentinel)
  bronze:     [170, 215, 260, 320, 395, 0],
  twilight:   [200, 215, 245, 285, 335, 0],

  // PHOTOGRAPHY — Add-Ons (tiered, same both markets)
  floorPlan:  [95,  95,  115, 145, 185, 0],
  threeDTour: [175, 175, 210, 250, 300, 0],

  // PHOTOGRAPHY — Add-Ons (flat)
  dronePhotoAddon:  75,
  droneStandalone: 150,

  // VIDEO — Listing Videos (flat)
  editorCut:  450,
  signatureVideo: 750,

  // VIDEO — Brand & Community (flat)
  agentBranding:      600,
  communitySpotlight: 600,

  // VIDEO — Drone in video: included FREE in NJ
  droneInVideo: 0,

  // ADD-ONS (flat & quantity-based)
  virtualStaging:      25,
  virtualTwilight:     25,
  virtualRenovation:   30,
  objectRemoval:       15,
  sameDayDelivery:     35,
  nextDayVideoDelivery: 150,
  listingWebsite:      150,
};

export const MANHATTAN_PRICES = {
  // PHOTOGRAPHY — Main (+$75 Manhattan fee already baked in)
  bronze:     [245, 290, 335, 395, 470, 0],
  twilight:   [275, 290, 320, 360, 410, 0],

  // PHOTOGRAPHY — Add-Ons (NO Manhattan fee — same as NJ)
  floorPlan:  [95,  95,  115, 145, 185, 0],
  threeDTour: [175, 175, 210, 250, 300, 0],

  // PHOTOGRAPHY — Add-Ons (flat, own Manhattan pricing)
  dronePhotoAddon:  100,
  droneStandalone:  250,

  // VIDEO — Listing Videos (+$75 Manhattan fee baked in) (flat)
  editorCut:  525,
  signatureVideo: 825,

  // VIDEO — Brand & Community (+$75 baked in)
  agentBranding:      675,
  communitySpotlight: 675,

  // VIDEO — Drone in video: $100 add-on in Manhattan
  droneInVideo: 100,

  // ADD-ONS (same as NJ — no Manhattan fee on add-ons)
  virtualStaging:      25,
  virtualTwilight:     25,
  virtualRenovation:   30,
  objectRemoval:       15,
  sameDayDelivery:     35,
  nextDayVideoDelivery: 150,
  listingWebsite:      150,
};

// ─── PRE-CALCULATED DISCOUNTED PACKAGE PRICES ────────────────────────────────
// These are verified. NEVER recalculate package prices — read from these arrays.
// Index matches Tier (0–4). Index 5 = "Contact Us".

// Silver raw (Bronze + FP, no discount):
export const SILVER_RAW: Record<Market, number[]> = {
  NJ:         [265, 310, 375, 465, 580, 0],
  Manhattan:  [340, 385, 450, 540, 655, 0],
};

// Gold raw (Bronze + FP + 3D + Drone, no discount):
export const GOLD_RAW: Record<Market, number[]> = {
  NJ:         [515, 560, 660, 790,  955, 0],
  Manhattan:  [615, 660, 760, 890, 1055, 0],
};

// Essential = Silver × 0.90 (10% off)
export const ESSENTIAL_PRICES: Record<Market, number[]> = {
  NJ:         [240, 280, 340, 420,  520, 0],
  Manhattan:  [305, 345, 405, 485,  590, 0],
};

// Gold Bundle = Gold × 0.90 (10% off, photo only)
export const GOLD_BUNDLE_PRICES: Record<Market, number[]> = {
  NJ:         [465, 505, 595, 710,  860, 0],
  Manhattan:  [555, 595, 685, 800,  950, 0],
};

// Prestige = Gold (sqft-based) + Editor Cut ($450 NJ / $525 MAN flat), 15% off
export const PRESTIGE_PRICES: Record<Market, number[]> = {
  NJ:         [820,  860,  945,  1055, 1195, 0],
  Manhattan:  [970,  1005, 1090, 1205, 1345, 0],
};

export const PRESTIGE_ALC_PRICES: Record<Market, number[]> = {
  NJ:         [965,  1010, 1110, 1240, 1405, 0],
  Manhattan:  [1140, 1185, 1285, 1415, 1580, 0],
};

// Legacy = Gold (sqft-based) + Signature ($750 NJ / $825 MAN flat), 20% off
export const LEGACY_PRICES: Record<Market, number[]> = {
  NJ:         [1010, 1050, 1130, 1230, 1365, 0],
  Manhattan:  [1150, 1190, 1270, 1370, 1505, 0],
};

export const LEGACY_ALC_PRICES: Record<Market, number[]> = {
  NJ:         [1265, 1310, 1410, 1540, 1705, 0],
  Manhattan:  [1440, 1485, 1585, 1715, 1880, 0],
};

export interface ServiceDef {
  id: string;
  name: string;
  description?: string;
  category: 'photo' | 'video' | 'addon';
  type: 'tiered' | 'flat' | 'quantity';
  priceKey: keyof typeof NJ_PRICES;
  unit?: string;
  manhattanOnly?: boolean;
}

export const SERVICES_LIST: ServiceDef[] = [
  // Photography
  { id: 'bronze',         name: 'Bronze — Photos Only',      description: 'HDR interior & exterior photos, MLS-ready with window pull & sky replacement',                 category: 'photo',  type: 'tiered',   priceKey: 'bronze' },
  { id: 'twilight',       name: 'Twilight Photos',           description: 'On-location golden hour/dusk exterior shoot',                                                    category: 'photo',  type: 'tiered',   priceKey: 'twilight' },
  { id: 'floorPlan',      name: 'Floor Plan',                description: '2D floor plan with room labels and measurements. Same price in both markets.',                  category: 'photo',  type: 'tiered',   priceKey: 'floorPlan' },
  { id: 'threeDTour',     name: '3D Tour',                   description: 'Interactive Matterport-style 3D walkthrough, hosted online.',                                    category: 'photo',  type: 'tiered',   priceKey: 'threeDTour' },
  { id: 'dronePhotoAddon',name: 'Drone Photo Add-On',        description: 'Aerial shots added to your photo package.',                                                      category: 'photo',  type: 'flat',     priceKey: 'dronePhotoAddon' },
  { id: 'droneStandalone',name: 'Drone Standalone',          description: 'Aerial photography without a photo package.',                                                    category: 'photo',  type: 'flat',     priceKey: 'droneStandalone' },

  // Video
  { id: 'editorCut',          name: 'Editor Cut Video — Professional Listing Video',          description: 'Professional listing video with music, transitions & branded intro/outro. Drone included in NJ.', category: 'video', type: 'flat', priceKey: 'editorCut' },
  { id: 'signatureVideo',         name: 'Signature Video — Premium Listing Film ⚑ Consultation Required',         description: 'Premium cinematic listing film — advanced camera work, color grading, storytelling. Drone included in NJ.', category: 'video', type: 'flat', priceKey: 'signatureVideo' },
  { id: 'agentBranding',      name: 'Agent Branding Video — ⚑ Consultation Required',      description: 'Personal brand video for agent marketing.',                                                    category: 'video',  type: 'flat',     priceKey: 'agentBranding' },
  { id: 'communitySpotlight', name: 'Community Spotlight — ⚑ Consultation Required',       description: 'Neighborhood/community highlight video.',                                                      category: 'video',  type: 'flat',     priceKey: 'communitySpotlight' },
  { id: 'droneInVideo',      name: 'Drone Footage in Video',    description: 'Add aerial footage to your video. Included FREE in NJ — Manhattan add-on only.',              category: 'video',  type: 'flat',     priceKey: 'droneInVideo', manhattanOnly: true },

  // Add-ons
  { id: 'virtualStaging',      name: 'Virtual Staging',             description: 'Digitally furnish empty rooms.',                           category: 'addon', type: 'quantity', priceKey: 'virtualStaging',      unit: 'photo' },
  { id: 'virtualTwilight',     name: 'Virtual Twilight',            description: 'Daytime exterior converted to dusk digitally.',            category: 'addon', type: 'quantity', priceKey: 'virtualTwilight',     unit: 'photo' },
  { id: 'virtualRenovation',   name: 'Virtual Renovation',          description: 'Digital renovation rendering.',                            category: 'addon', type: 'quantity', priceKey: 'virtualRenovation',   unit: 'scene' },
  { id: 'objectRemoval',       name: 'Object / Clutter Removal',    description: 'Digital removal of unwanted items from photos.',           category: 'addon', type: 'quantity', priceKey: 'objectRemoval',       unit: 'photo' },
  { id: 'sameDayDelivery',     name: 'Same-Day Edited Delivery',    description: 'Photos delivered same day — shoot must complete by 1PM EST.', category: 'addon', type: 'flat', priceKey: 'sameDayDelivery' },
  { id: 'nextDayVideoDelivery',name: 'Next-Day Video Delivery',     description: 'Video delivered next day.',                                category: 'addon', type: 'flat',     priceKey: 'nextDayVideoDelivery' },
  { id: 'listingWebsite',      name: 'Custom Listing Website',      description: 'FREE with any package. $150 standalone.',                  category: 'addon', type: 'flat',     priceKey: 'listingWebsite' },
];
