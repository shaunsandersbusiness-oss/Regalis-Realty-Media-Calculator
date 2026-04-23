import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Minus, Plus, ChevronDown, Download, Phone, X, ChevronUp, Calculator } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  NJ_PRICES, MANHATTAN_PRICES, TIERS, SERVICES_LIST, Market, Tier,
  ESSENTIAL_PRICES, GOLD_BUNDLE_PRICES, PRESTIGE_PRICES, PRESTIGE_ALC_PRICES,
  LEGACY_PRICES, LEGACY_ALC_PRICES,
  SILVER_RAW, GOLD_RAW
} from '../data/pricing_v2';
import { calculateQuote, CalculatorState } from '../utils/calculatorLogic_v2';
import { BookingModal } from './BookingModal';
import { generatePDF } from '../utils/pdfGenerator';

export function CalculatorV2() {
  const [state, setState] = useState<CalculatorState>({
    market: 'NJ',
    tier: 1, // 1500-2000
    selectedServices: new Set(), // Default to empty
    quantities: {},
  });
  const [viewMode, setViewMode] = useState<'packages' | 'custom'>('custom');
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const quote = calculateQuote(state);
  const itemCount = quote.items.length;

  // Handlers
  const setMarket = (m: Market) => setState(s => ({ ...s, market: m }));
  const setTier = (t: Tier) => setState(s => ({ ...s, tier: t }));
  
  const toggleService = (id: string) => {
    const newSet = new Set(state.selectedServices);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setState(s => ({ ...s, selectedServices: newSet }));
  };

  const updateQuantity = (id: string, delta: number) => {
    const current = state.quantities[id] || 0;
    const next = Math.max(0, Math.min(20, current + delta));
    
    const newSet = new Set(state.selectedServices);
    if (next > 0) newSet.add(id);
    else newSet.delete(id);

    setState(s => ({
      ...s,
      quantities: { ...s.quantities, [id]: next },
      selectedServices: newSet
    }));
  };

  const removeItem = (id: string) => {
    const newSet = new Set(state.selectedServices);
    newSet.delete(id);
    setState(s => ({ ...s, selectedServices: newSet }));
  };

  const clearAll = () => {
    setState(s => ({
      ...s,
      selectedServices: new Set(),
      quantities: {}
    }));
    setShowClearTooltip(true);
    setTimeout(() => setShowClearTooltip(false), 2000);
  };

  const handlePrint = async () => {
    if (quote.items.length === 0) {
      alert('Please select services to download a quote.');
      return;
    }
    setIsGeneratingPDF(true);
    await generatePDF(quote, state.market, state.tier);
    setIsGeneratingPDF(false);
  };

  const scrollToQuote = () => {
    const quoteElement = document.getElementById('quote-sidebar');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectPackage = (pkg: string) => {
    let newServices = new Set<string>();

    switch (pkg) {
      case 'Bronze':
        newServices.add('bronze');
        newServices.add('listingWebsite');
        break;
      case 'Gold':
        newServices.add('bronze');
        newServices.add('floorPlan');
        newServices.add('threeDTour');
        newServices.add('dronePhotoAddon');
        newServices.add('listingWebsite');
        break;
      case 'Prestige':
        newServices.add('bronze');
        newServices.add('floorPlan');
        newServices.add('threeDTour');
        newServices.add('dronePhotoAddon');
        newServices.add('editorCut');
        newServices.add('listingWebsite');
        break;
      case 'Legacy':
        newServices.add('bronze');
        newServices.add('floorPlan');
        newServices.add('threeDTour');
        newServices.add('dronePhotoAddon');
        newServices.add('signatureVideo');
        newServices.add('listingWebsite');
        break;
    }

    setState(s => ({
      ...s,
      selectedServices: newServices,
      quantities: {}
    }));
    setViewMode('custom');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        quote={quote}
        market={state.market}
        tier={state.tier}
      />

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-[48px] font-bold text-white mb-4 leading-tight">Price Calculator</h1>
        <p className="text-lg text-[#999999]">Build your custom package and see your price instantly.</p>
      </div>

      {/* Top Bar Controls */}
      <div className="flex flex-col items-center justify-center gap-6 mb-12">
        {/* Market Toggle */}
        <div className="bg-[#111] p-1 rounded-full border border-[#222] flex w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['NJ', 'Manhattan'] as Market[]).map(m => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={cn(
                "flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                state.market === m
                  ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                  : "text-[#999] hover:text-white"
              )}
            >
              {m === 'NJ' ? 'NJ & Boroughs' : 'Manhattan'}
            </button>
          ))}
        </div>

        {/* Property Size Buttons */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {TIERS.map(t => (
            <button
              key={t.value}
              onClick={() => setTier(t.value as Tier)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all border",
                state.tier === t.value
                  ? "bg-[#c9a84c] text-black border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                  : "bg-[#111] text-[#999] border-[#222] hover:border-[#444] hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="bg-[#111] p-1 rounded-full border border-[#222] flex mt-4 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setViewMode('packages')}
            className={cn(
              "flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'packages'
                ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                : "text-[#999] hover:text-white"
            )}
          >
            Package Presets
          </button>
          <button
            onClick={() => setViewMode('custom')}
            className={cn(
              "flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'custom'
                ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                : "text-[#999] hover:text-white"
            )}
          >
            Build Your Own
          </button>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {state.tier === 5 ? (
          <motion.div
            key="custom-quote"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl max-w-3xl mx-auto text-center px-6"
          >
            <div className="w-16 h-16 bg-[#c9a84c]/10 rounded-full flex items-center justify-center mb-6">
              <Calculator className="text-[#c9a84c]" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Custom Quote Required</h2>
            <p className="text-[#999] text-lg mb-8 max-w-md">
              Properties over 5,000 sqft require a custom quote. Call (917) 683-8034 or email contact@regalisrealtymedia.com.
            </p>
            <a 
              href="mailto:contact@regalisrealtymedia.com"
              className="bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Get a Custom Quote →
            </a>
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12"
          >
            {/* Left Column: Services */}
            <div className="w-full lg:w-[60%] space-y-10">
              
              {viewMode === 'packages' ? (
                <PackageCards market={state.market} tier={state.tier} onSelect={selectPackage} />
              ) : (
                <>
                  {/* Photos Section */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-[28px] font-bold text-white mb-2">Build Your Own</h2>
                      <p className="text-[15px] text-[#999]">Customize your order by selecting individual services. Your discount adjusts automatically.</p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-[20px] font-bold text-white mb-2">Photography</h3>
                    </div>
                    <div className="space-y-4">
                      {SERVICES_LIST.filter(s => {
                        if (s.category !== 'photo') return false;
                        if (s.manhattanOnly && state.market !== 'Manhattan') return false;
                        
                        const hasBronze = state.selectedServices.has('bronze');
                        if (s.id === 'dronePhotoAddon' && !hasBronze) return false;
                        if (s.id === 'droneStandalone' && hasBronze) return false;
                        
                        return true;
                      }).map(service => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          state={state}
                          toggle={toggleService}
                          updateQuantity={updateQuantity}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Videos Section */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-[28px] font-bold text-white mb-2">Videos</h2>
                      <p className="text-[15px] text-[#999]">Add a video to your package</p>
                    </div>
                    <div className="space-y-4">
                      {SERVICES_LIST.filter(s => s.category === 'video' && (!s.manhattanOnly || state.market === 'Manhattan')).map(service => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          state={state}
                          toggle={toggleService}
                          updateQuantity={updateQuantity}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Add-Ons Section */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-[28px] font-bold text-white mb-2">Add-Ons</h2>
                      <p className="text-[15px] text-[#999]">Enhance your package</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SERVICES_LIST.filter(s => {
                        if (s.category !== 'addon') return false;
                        if (s.id === 'nextDayVideoDelivery') {
                          const hasVideo = state.selectedServices.has('editorCut') || 
                                           state.selectedServices.has('signatureVideo') || 
                                           state.selectedServices.has('agentBranding') || 
                                           state.selectedServices.has('communitySpotlight');
                          if (!hasVideo) return false;
                        }
                        return true;
                      }).map(service => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          state={state}
                          toggle={toggleService}
                          updateQuantity={updateQuantity}
                          compact
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}

            </div>

            {/* Right Column: Quote Sidebar */}
            <div className="w-full lg:w-[40%] relative" id="quote-sidebar">
              <div className="sticky top-[100px] bg-[#0a0a0a] border border-[#222] border-t-4 border-t-[#c9a84c] rounded-xl p-6 md:p-8 shadow-2xl">
                
                {/* Clear All Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Your Quote</h3>
                  <div className="relative">
                    <button 
                      onClick={clearAll}
                      className="text-xs text-[#999] hover:text-[#ff6b6b] transition-colors"
                    >
                      Clear All
                    </button>
                    <AnimatePresence>
                      {showClearTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-0 top-6 bg-[#333] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                        >
                          All selections cleared
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Discount Badge */}
                <AnimatePresence>
                  {quote.discountName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="bg-[#c9a84c] text-black font-bold text-center py-2 rounded-lg mb-2">
                        ⭐ {quote.discountName}
                      </div>
                      <div className="text-center text-[#4CAF50] font-bold">
                        You Save: ${quote.discountAmount}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Line Items */}
                <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {quote.items.length === 0 && <p className="text-[#666] italic">Select services...</p>}
                  <AnimatePresence initial={false}>
                    {quote.items.map(item => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, x: -20 }}
                        className="flex justify-between items-center text-sm group"
                      >
                        <span className="text-[#D4D4D4]">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className={cn("font-mono", item.isFree ? "text-[#4CAF50]" : "text-[#D4D4D4]")}>
                            {item.isFree ? 'FREE' : `$${item.price}`}
                          </span>
                          {!item.isFree && (
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-[#666] hover:text-[#ff6b6b] transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Complimentary Items Visual Only */}
                  {quote.complimentaryItems.map((item, i) => (
                    <div key={`comp-${i}`} className="flex justify-between text-sm">
                      <span className="text-[#D4D4D4]">{item.replace('(Included)', '')}</span>
                      <span className="text-[#4CAF50] font-mono">FREE</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#222] my-6" />

                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#999] text-sm">À la carte total</span>
                    <span className="text-[#999] font-mono line-through">${quote.alacarteTotal}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-[#c9a84c] font-bold text-4xl leading-none">${quote.finalTotal}</span>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-[#111] p-3 rounded-lg text-[11px] text-[#666] mb-6 leading-relaxed">
                  The final quote is calculated by summing the standard prices of all selected services (including add-ons) and then applying the applicable package discount to the entire total. It is NOT calculated as a discounted package price plus separately discounted add-ons.
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="block w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-center py-4 rounded-lg transition-colors"
                  >
                    BOOK THIS QUOTE →
                  </button>
                  <button 
                    onClick={handlePrint}
                    disabled={isGeneratingPDF || quote.items.length === 0}
                    className="block w-full border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10 font-bold text-center py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={18} />
                    {isGeneratingPDF ? 'GENERATING PDF...' : 'DOWNLOAD QUOTE AS PDF'}
                  </button>
                  <div className="text-center text-[#666] text-sm pt-2 flex items-center justify-center gap-2">
                     Or call (917) 683-8034
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Pill */}
      <AnimatePresence>
        {state.tier < 5 && itemCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
          >
            <button
              onClick={scrollToQuote}
              className="bg-[#c9a84c] text-black font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
            >
              <span>View Quote ({itemCount} items)</span>
              <span className="bg-black/10 px-2 py-0.5 rounded text-sm">${quote.finalTotal}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .sticky, .sticky * {
            visibility: visible;
          }
          .sticky {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          /* Hide buttons in print */
          .sticky button, .sticky a {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Sub-components

function ServiceCard({ service, state, toggle, updateQuantity, compact }: any) {
  const isSelected = state.selectedServices.has(service.id);
  
  // Get Price
  const prices = state.market === 'NJ' ? NJ_PRICES : MANHATTAN_PRICES;
  let price = 0;
  // @ts-ignore
  const rawPrice = prices[service.priceKey];
  if (Array.isArray(rawPrice)) price = rawPrice[state.tier] || 0;
  else price = rawPrice;

  const [serviceName, ...taglineParts] = service.name.split('—');
  const tagline = taglineParts.join('—');

  return (
    <button 
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.quantity-ctrl')) return;
        toggle(service.id);
        if (!isSelected && service.type === 'quantity') updateQuantity(service.id, 1);
      }}
      className={cn(
        "service-card group w-full text-left relative",
        isSelected && "selected",
        compact ? "flex flex-col h-full" : ""
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-4 w-full">
        <div className={cn("custom-checkbox mt-1", isSelected && "selected")} aria-hidden="true" />
        
        <div className="flex-grow w-full">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-[17px] font-bold text-white">{serviceName.trim()}</span>
              {tagline && <span className="text-[17px] font-normal text-[#999]"> — {tagline.trim()}</span>}
            </div>
            
            <div className="text-right shrink-0 ml-4">
              <span className="text-[#c9a84c] font-bold text-[20px]">
                ${price}
                {service.type === 'quantity' && <span className="text-[14px] text-[#666] font-normal ml-1">/{service.unit}</span>}
              </span>
            </div>
          </div>

          {!compact && <p className="text-[14px] text-[#888] leading-[1.5] mt-1.5">{service.description}</p>}
          
          {compact && (
            <div className="mt-4 flex justify-between items-end w-full">
               <p className="text-[14px] text-[#888] leading-[1.5] flex-grow pr-4">{service.description}</p>
               {service.type === 'quantity' && isSelected && (
                <div className="quantity-ctrl flex items-center gap-2 bg-[#1a1a1a] rounded px-2 py-1 border border-[#333] shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => updateQuantity(service.id, -1)} className="hover:text-[#c9a84c]" aria-label="Decrease quantity"><Minus size={12}/></button>
                  <span className="text-xs font-mono w-4 text-center text-white" aria-live="polite">{state.quantities[service.id] || 1}</span>
                  <button type="button" onClick={() => updateQuantity(service.id, 1)} className="hover:text-[#c9a84c]" aria-label="Increase quantity"><Plus size={12}/></button>
                </div>
              )}
            </div>
          )}

          {!compact && service.type === 'quantity' && isSelected && (
             <div className="quantity-ctrl flex items-center gap-2 bg-[#1a1a1a] rounded px-2 py-1 border border-[#333] mt-3 w-fit" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => updateQuantity(service.id, -1)} className="hover:text-[#c9a84c]" aria-label="Decrease quantity"><Minus size={12}/></button>
                <span className="text-xs font-mono w-4 text-center text-white" aria-live="polite">{state.quantities[service.id] || 1}</span>
                <button type="button" onClick={() => updateQuantity(service.id, 1)} className="hover:text-[#c9a84c]" aria-label="Increase quantity"><Plus size={12}/></button>
              </div>
          )}
        </div>
      </div>
    </button>
  );
}

function PackageCards({
  market, tier, onSelect
}: {
  market: Market;
  tier: Tier;
  onSelect: (pkg: string) => void;
}) {
  if (tier === 5) return null; // Contact Us tier — parent handles this

  const PRICES = market === 'NJ' ? NJ_PRICES : MANHATTAN_PRICES;

  // ── Read from pre-verified arrays — never recalculate ──
  const prestigeDiscounted = PRESTIGE_PRICES[market][tier];
  const prestigeAlacarte   = PRESTIGE_ALC_PRICES[market][tier];

  const legacyDiscounted = LEGACY_PRICES[market][tier];
  const legacyAlacarte   = LEGACY_ALC_PRICES[market][tier];

  const cards = [
    {
      id: 'Bronze',
      name: 'Bronze',
      subtitle: 'Photos Only',
      badge: null,
      popular: false,
      label: '',
      discounted: (PRICES.bronze as number[])[tier],
      alacarte: (PRICES.bronze as number[])[tier],
      savings: 0,
      includes: ['Bronze Photos', 'Custom Listing Website (FREE)'],
      note: '+ Listing Website FREE',
    },
    {
      id: 'Silver',
      name: 'Silver / Essential',
      subtitle: 'Photos + Floor Plan',
      badge: '10% Off',
      popular: true,
      label: 'MOST POPULAR',
      discounted: ESSENTIAL_PRICES[market][tier],
      alacarte: SILVER_RAW[market][tier],
      savings: (SILVER_RAW[market][tier] as number) - (ESSENTIAL_PRICES[market][tier] as number),
      includes: ['Bronze Photos', 'Floor Plan', 'Custom Listing Website (FREE)'],
      note: '+ Listing Website FREE',
    },
    {
      id: 'Gold',
      name: 'Gold',
      subtitle: 'Photos + 3D + Drone',
      badge: '10% Off',
      popular: false,
      label: '',
      discounted: GOLD_BUNDLE_PRICES[market][tier],
      alacarte: GOLD_RAW[market][tier],
      savings: (GOLD_RAW[market][tier] as number) - (GOLD_BUNDLE_PRICES[market][tier] as number),
      includes: ['Bronze Photos', 'Floor Plan', '3D Tour', 'Drone Photo', 'Custom Listing Website (FREE)'],
      note: '+ Listing Website FREE',
    },
    {
      id: 'Prestige',
      name: 'Prestige',
      subtitle: 'Gold + Editor Cut Video',
      badge: '15% Off',
      popular: false,
      label: 'BEST VALUE',
      discounted: prestigeDiscounted,
      alacarte: prestigeAlacarte,
      savings: (prestigeAlacarte as number) - (prestigeDiscounted as number),
      includes: ['Bronze Photos', 'Floor Plan', '3D Tour', 'Drone Photo', 'Editor Cut Video', 'Listing Website (FREE)'],
      note: '+ Listing Website FREE',
    },
    {
      id: 'Legacy',
      name: 'Legacy',
      subtitle: 'Gold + Signature Video',
      badge: '20% Off',
      popular: false,
      label: 'MAXIMUM IMPACT',
      discounted: legacyDiscounted,
      alacarte: legacyAlacarte,
      savings: (legacyAlacarte as number) - (legacyDiscounted as number),
      includes: [
        'Bronze Photos', 'Floor Plan', '3D Tour', 'Drone Photo',
        'Signature Video',
        'Listing Website (FREE)',
      ],
      note: '+ Listing Website FREE + 2 Twilight Photos FREE',
    },
  ];

  const renderCard = (card: any) => (
    <button
      key={card.id}
      onClick={() => onSelect(card.id)}
      className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 text-left hover:border-[#c9a84c] transition-all relative group flex flex-col"
    >
      {/* Popular badge */}
      {card.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a84c] text-black text-[11px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-10">
          ⭐ {card.label}
        </div>
      )}
      {/* Discount badge */}
      <div className="absolute top-0 right-0 bg-[#c9a84c] text-black text-[11px] font-bold px-2 py-1 rounded-bl-lg">
        {card.badge}
      </div>

      <h3 className="text-[24px] font-bold text-white mb-1 group-hover:text-[#c9a84c] transition-colors">
        {card.name}
      </h3>
      <p className="text-[#c9a84c] text-[13px] italic mb-4">{card.subtitle}</p>

      {/* Includes list */}
      <div className="flex-grow mb-4">
        <ul className="space-y-1">
          {card.includes.map((item: string, i: number) => (
            <li key={i} className="text-[13px] text-[#999] flex items-start gap-1.5">
              <span className="text-[#c9a84c] mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="mt-auto pt-4 border-t border-[#222]">
        <div className="flex items-end justify-between mb-1">
          <div>
            <div className="text-[#666] text-[13px] line-through decoration-1 mb-0.5">
              ${card.alacarte}
            </div>
            <div className="text-white font-bold text-[32px] leading-none">
              ${card.discounted}
            </div>
            <div className="text-[#c9a84c] text-[12px] font-medium mt-0.5">
              You save ${card.savings}
            </div>
          </div>
          <div className="text-[#c9a84c] font-bold text-[14px] group-hover:translate-x-1 transition-transform">
            Select →
          </div>
        </div>
        {card.note && (
          <div className="text-[#4CAF50] text-[11px] font-medium mt-2">{card.note}</div>
        )}
      </div>
    </button>
  );

  return (
    <div className="mb-16">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-white mb-2">Package Presets</h2>
        <p className="text-[#999] text-[18px]">
          Select a base package to start. You can customize individual services below.
        </p>
      </div>

      <div className="mb-10">
        <h3 className="text-[20px] font-bold text-white mb-4 border-b border-[#333] pb-2">Photo Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.filter(c => ['Bronze', 'Silver', 'Gold'].includes(c.id)).map(renderCard)}
        </div>
      </div>

      <div>
        <h3 className="text-[20px] font-bold text-white mb-4 border-b border-[#333] pb-2">Photo & Video Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.filter(c => ['Prestige', 'Legacy'].includes(c.id)).map(renderCard)}
        </div>
      </div>
    </div>
  );
}
