import { NJ_PRICES, MANHATTAN_PRICES, Market, Tier } from '../data/pricing_v2';

export interface CalculatorState {
  market: Market;
  tier: Tier;
  selectedServices: Set<string>;
  quantities: Record<string, number>;
}

export interface LineItem {
  id: string;
  name: string;
  price: number;
  isFree?: boolean;
}

export interface QuoteResult {
  items: LineItem[];
  alacarteTotal: number;
  discountName: string | null;
  discountPercent: number;
  discountAmount: number;
  finalTotal: number;
  complimentaryItems: string[];
}

export function calculateQuote(state: CalculatorState): QuoteResult {
  const { market, tier, selectedServices, quantities } = state;
  const PRICES = market === 'NJ' ? NJ_PRICES : MANHATTAN_PRICES;

  const getPrice = (key: string): number => {
    // @ts-ignore
    const val = PRICES[key];
    if (Array.isArray(val)) return (val[tier] as number) || 0;
    return val as number;
  };

  // ── Build line items ────────────────────────────────────────────────────────
  const items: LineItem[] = [];
  let alacarteTotal = 0;

  const addItem = (id: string, name: string, price: number) => {
    if (price <= 0 && id !== 'listingWebsite') return; // skip $0 items (droneInVideo in NJ)
    items.push({ id, name, price });
    alacarteTotal += price;
  };

  const qty = (id: string) => quantities[id] || 1;

  if (selectedServices.has('bronze'))
    addItem('bronze', 'Bronze — Photos Only', getPrice('bronze'));
  if (selectedServices.has('twilight'))
    addItem('twilight', 'Twilight Photos', getPrice('twilight'));
  if (selectedServices.has('floorPlan'))
    addItem('floorPlan', 'Floor Plan', getPrice('floorPlan'));
  if (selectedServices.has('threeDTour'))
    addItem('threeDTour', '3D Tour', getPrice('threeDTour'));
  if (selectedServices.has('dronePhotoAddon'))
    addItem('dronePhotoAddon', 'Drone Photo Add-On', getPrice('dronePhotoAddon'));
  if (selectedServices.has('droneStandalone'))
    addItem('droneStandalone', 'Drone Standalone', getPrice('droneStandalone'));

  if (selectedServices.has('editorCut'))
    addItem('editorCut', 'Editor Cut Video', getPrice('editorCut'));
  if (selectedServices.has('signatureVideo'))
    addItem('signatureVideo', 'Signature Video', getPrice('signatureVideo'));
  if (selectedServices.has('agentBranding'))
    addItem('agentBranding', 'Agent Branding Video', getPrice('agentBranding'));
  if (selectedServices.has('communitySpotlight'))
    addItem('communitySpotlight', 'Community Spotlight', getPrice('communitySpotlight'));
  if (selectedServices.has('droneInVideo') && market === 'Manhattan')
    addItem('droneInVideo', 'Drone Footage in Video', getPrice('droneInVideo'));

  if (selectedServices.has('virtualStaging')) {
    const n = qty('virtualStaging');
    addItem('virtualStaging', `Virtual Staging (×${n})`, getPrice('virtualStaging') * n);
  }
  if (selectedServices.has('virtualTwilight')) {
    const n = qty('virtualTwilight');
    addItem('virtualTwilight', `Virtual Twilight (×${n})`, getPrice('virtualTwilight') * n);
  }
  if (selectedServices.has('virtualRenovation')) {
    const n = qty('virtualRenovation');
    addItem('virtualRenovation', `Virtual Renovation (×${n})`, getPrice('virtualRenovation') * n);
  }
  if (selectedServices.has('objectRemoval')) {
    const n = qty('objectRemoval');
    addItem('objectRemoval', `Object / Clutter Removal (×${n})`, getPrice('objectRemoval') * n);
  }
  if (selectedServices.has('sameDayDelivery'))
    addItem('sameDayDelivery', 'Same-Day Edited Delivery', getPrice('sameDayDelivery'));
  if (selectedServices.has('nextDayVideoDelivery')) {
    const hasVideo = selectedServices.has('editorCut') || selectedServices.has('signatureVideo') ||
                     selectedServices.has('agentBranding') || selectedServices.has('communitySpotlight');
    if (hasVideo) addItem('nextDayVideoDelivery', 'Next-Day Video Delivery', getPrice('nextDayVideoDelivery'));
  }

  // Listing website — added to items here, price may be set to $0 below
  if (selectedServices.has('listingWebsite')) {
    items.push({ id: 'listingWebsite', name: 'Custom Listing Website', price: getPrice('listingWebsite') });
    alacarteTotal += getPrice('listingWebsite');
  }

  // ── Discount Detection ──────────────────────────────────────────────────────
  const hasBronze       = selectedServices.has('bronze');
  const hasFP           = selectedServices.has('floorPlan');
  const has3D           = selectedServices.has('threeDTour');
  const hasDronePhoto   = selectedServices.has('dronePhotoAddon');
  
  const hasEditor  = selectedServices.has('editorCut');
  const hasSig     = selectedServices.has('signatureVideo');
  const hasAgentBrand = selectedServices.has('agentBranding');
  const hasSpotlight  = selectedServices.has('communitySpotlight');

  const isGold           = hasBronze && hasFP && has3D && hasDronePhoto;
  const hasAnyPhotoAddon = hasFP || has3D || hasDronePhoto;
  const hasPremiumVideo  = hasSig;
  const hasAnyVideo      = hasEditor || hasSig || hasAgentBrand || hasSpotlight;

  let discountName: string | null = null;
  let discountPercent = 0;

  // Check highest tier first — first match wins
  if (isGold && hasPremiumVideo) {
    discountName = 'Legacy — 20% off entire order';
    discountPercent = 0.20;
  } else if (hasBronze && hasAnyVideo) {
    discountName = 'Prestige — 15% off entire order';
    discountPercent = 0.15;
  } else if (hasBronze && hasAnyPhotoAddon && !hasAnyVideo) {
    discountName = 'Photo Bundle — 10% off entire order';
    discountPercent = 0.10;
  }

  // ── Apply Website Free Rule ─────────────────────────────────────────────────
  // FIX 3: Website is FREE only when a discount tier is active
  const websiteItem = items.find(i => i.id === 'listingWebsite');
  if (websiteItem && discountPercent > 0) {
    alacarteTotal -= websiteItem.price;
    websiteItem.price = 0;
    websiteItem.isFree = true;
  }

  // ── Calculate Final Total ───────────────────────────────────────────────────
  const discountableTotal = alacarteTotal;
  const finalTotal = discountPercent > 0
    ? Math.round(discountableTotal * (1 - discountPercent) / 5) * 5
    : discountableTotal;

  const discountAmount = discountableTotal - finalTotal;

  // ── Complimentary Items ─────────────────────────────────────────────────────
  const complimentaryItems: string[] = [];
  if (discountPercent > 0) {
    complimentaryItems.push('✓ Custom Listing Website (FREE)');
  }
  if (discountPercent >= 0.20) {
    complimentaryItems.push('✓ 2 Twilight Exterior Photos (FREE)');
  }

  return {
    items,
    alacarteTotal: discountableTotal,
    discountName,
    discountPercent,
    discountAmount,
    finalTotal,
    complimentaryItems,
  };
}
