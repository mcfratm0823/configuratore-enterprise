'use client'

import { ConfiguratorProvider, useConfigurator } from '@/context'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

function LandingPageContent() {
  const { actions } = useConfigurator()
  
  // Sticky cards overlay effect
  const [overlayOpacities, setOverlayOpacities] = useState([0, 0, 0, 0, 0])
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([])
  
  useEffect(() => {
    const handleScroll = () => {
      const newOpacities = [0, 0, 0, 0, 0]
      
      cardsRefs.current.forEach((card, index) => {
        if (!card) return
        
        const rect = card.getBoundingClientRect()
        const nextCard = cardsRefs.current[index + 1]
        
        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect()
          
          // Se la card corrente è sticky (top <= 0) e la successiva sta entrando in viewport
          if (rect.top <= 0 && nextRect.top < window.innerHeight * 1.2) {
            // Inizia l'effetto quando la card successiva è ancora più lontana (1.2x viewport)
            const triggerDistance = window.innerHeight * 1.2
            const overlapPercentage = Math.max(0, (triggerDistance - nextRect.top) / triggerDistance)
            // Overlay più scuro (fino a 0.6) e più graduale
            newOpacities[index] = Math.min(0.6, overlapPercentage * 0.6)
          }
        }
      })
      
      setOverlayOpacities(newOpacities)
    }
    
    // Throttled scroll per performance
    let ticking = false
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', scrollListener, { passive: true })
    return () => window.removeEventListener('scroll', scrollListener)
  }, [])
  
  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardsRefs.current[index] = el
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-3xl border-b border-white/40 backdrop-saturate-150">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <Image 
            src="/logo-124.png" 
            alt="124 Logo" 
            width={48}
            height={48}
            className="h-12 w-12"
          />
          <nav className="flex items-center space-x-8">
            <a href="https://drink124.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#ed6d23] transition-colors font-medium">Home</a>
            <a href="https://drink124.com/pages/chi-siamo-cafe-124" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#ed6d23] transition-colors font-medium">Chi siamo</a>
            <button 
              onClick={actions.startConfigurator}
              className="text-gray-700 hover:text-[#ed6d23] transition-colors font-medium cursor-pointer"
            >
              Configuratore
            </button>
            <a href="/contact" className="text-gray-700 hover:text-[#ed6d23] transition-colors font-medium">Contatti</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-8">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          {/* Text Section */}
          <div className="grid grid-cols-12 gap-16 items-start mb-16">
            {/* Left Column - Main Title */}
            <div className="col-span-4">
              <h1 className="text-[#171717] leading-tight" style={{fontSize: '80px', fontWeight: '400', lineHeight: '83px'}}>
                Packaging
              </h1>
            </div>

            {/* Empty space */}
            <div className="col-span-2"></div>

            {/* Right Column - Headline */}
            <div className="col-span-6 pt-4">
              <h2 className="text-[#171717]" style={{fontSize: '34px', fontWeight: '400', lineHeight: '36px'}}>
                Configuratore enterprise per <span className="text-[#ed6d23] font-medium">packaging</span> White Label e Private Label.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Visual Block */}
      <section className="w-full">
        <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-xl font-medium">Packaging Visual Block</div>
            <div className="text-sm">Lattine e packaging enterprise</div>
          </div>
        </div>
      </section>

      {/* What We Do Section - White Label */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <div className="grid grid-cols-12 gap-16 items-start">
            {/* Left Column - Small title */}
            <div className="col-span-4">
              <p className="text-base text-[#171717]">→ White Label</p>
            </div>

            {/* Empty space */}
            <div className="col-span-2"></div>

            {/* Right Column - Main content */}
            <div className="col-span-6">
              <h2 className="text-4xl font-bold text-[#171717] leading-tight mb-6">
                Lattine preconfezionate da 200ml con etichette personalizzate per il tuo brand.
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">
                Soluzione rapida e professionale per lanciare il tuo prodotto. Configuratore enterprise con pricing dinamico, 
                template download, integrazione Stripe per campioni e sistema di preventivi automatizzato. 
                Perfetto per startup e brand che vogliono entrare velocemente nel mercato delle bevande.
              </p>
              
              <button 
                onClick={actions.startConfigurator}
                className="px-8 py-4 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
              >
                Start Configurator →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Cards Section - Portfolio Clienti */}
      <section className="relative">
        {/* Card 1 - Cliente A */}
        <div ref={setCardRef(0)} className="sticky top-0 h-screen bg-gray-100 flex items-center relative">
          <div className="max-w-7xl mx-auto w-full" style={{paddingLeft: '0px', paddingRight: '0px'}}>
            {/* Title row with number */}
            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-bold text-[#ed6d23]">Cliente A</h2>
              <span className="text-6xl font-black text-[#171717]">01</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              {/* Left Column - Content */}
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-[#171717] leading-tight mb-8">
                  Lattine personalizzate 200ml con design premium e etichette White Label di alta qualità.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div>
                    <p className="text-[#171717] mb-2">Quantità: 2520 lattine</p>
                    <p className="text-[#171717] mb-2">Prezzo: €0.70 cad.</p>
                    <p className="text-[#171717]">Template scaricato</p>
                  </div>
                  <div>
                    <p className="text-[#171717] mb-2">Campione richiesto</p>
                    <p className="text-[#171717] mb-2">Pagamento Stripe</p>
                    <p className="text-[#171717]">Delivery 15 giorni</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
                >
                  Configura il tuo →
                </button>
              </div>

              {/* Right Column - Visual */}
              <div className="col-span-6">
                <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🥤</div>
                    <div className="text-xl font-medium">Lattine White Label</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Overlay grigio */}
          <div 
            className="absolute inset-0 bg-gray-900 pointer-events-none transition-opacity duration-500 ease-out"
            style={{ opacity: overlayOpacities[0] }}
          />
        </div>

        {/* Card 2 - Cliente B */}
        <div ref={setCardRef(1)} className="sticky top-0 h-screen bg-gray-100 flex items-center relative">
          <div className="max-w-7xl mx-auto w-full" style={{paddingLeft: '0px', paddingRight: '0px'}}>
            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-bold text-[#ed6d23]">Cliente B</h2>
              <span className="text-6xl font-black text-[#171717]">02</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-[#171717] leading-tight mb-8">
                  Configurazione enterprise con 5000 lattine, pricing ottimizzato e sistema di gestione ordini.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div>
                    <p className="text-[#171717] mb-2">Volume enterprise</p>
                    <p className="text-[#171717] mb-2">€0.65 per lattina</p>
                    <p className="text-[#171717]">Sconto quantità</p>
                  </div>
                  <div>
                    <p className="text-[#171717] mb-2">Gestione completa</p>
                    <p className="text-[#171717] mb-2">Support dedicato</p>
                    <p className="text-[#171717]">Delivery veloce</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
                >
                  Scala il business →
                </button>
              </div>

              <div className="col-span-6">
                <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📈</div>
                    <div className="text-xl font-medium">Volume Enterprise</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Overlay grigio */}
          <div 
            className="absolute inset-0 bg-gray-900 pointer-events-none transition-opacity duration-500 ease-out"
            style={{ opacity: overlayOpacities[1] }}
          />
        </div>

        {/* Card 3 - Cliente C */}
        <div ref={setCardRef(2)} className="sticky top-0 h-screen bg-gray-100 flex items-center relative">
          <div className="max-w-7xl mx-auto w-full" style={{paddingLeft: '0px', paddingRight: '0px'}}>
            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-bold text-[#ed6d23]">Cliente C</h2>
              <span className="text-6xl font-black text-[#171717]">03</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-[#171717] leading-tight mb-8">
                  Soluzione startup con 600 lattine per test di mercato e validazione prodotto.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div>
                    <p className="text-[#171717] mb-2">Startup friendly</p>
                    <p className="text-[#171717] mb-2">Test marketing</p>
                    <p className="text-[#171717]">Investimento minimo</p>
                  </div>
                  <div>
                    <p className="text-[#171717] mb-2">Validation veloce</p>
                    <p className="text-[#171717] mb-2">Supporto consulenza</p>
                    <p className="text-[#171717]">Scale-up ready</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
                >
                  Valida l&apos;idea →
                </button>
              </div>

              <div className="col-span-6">
                <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🚀</div>
                    <div className="text-xl font-medium">Startup Solution</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Overlay grigio */}
          <div 
            className="absolute inset-0 bg-gray-900 pointer-events-none transition-opacity duration-500 ease-out"
            style={{ opacity: overlayOpacities[2] }}
          />
        </div>

        {/* Card 4 - Cliente D */}
        <div ref={setCardRef(3)} className="sticky top-0 h-screen bg-gray-100 flex items-center relative">
          <div className="max-w-7xl mx-auto w-full" style={{paddingLeft: '0px', paddingRight: '0px'}}>
            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-bold text-[#ed6d23]">Cliente D</h2>
              <span className="text-6xl font-black text-[#171717]">04</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-[#171717] leading-tight mb-8">
                  Soluzione innovativa con packaging eco-sostenibile per brand attenti all&apos;ambiente.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div>
                    <p className="text-[#171717] mb-2">Materiali eco-friendly</p>
                    <p className="text-[#171717] mb-2">€0.75 per lattina</p>
                    <p className="text-[#171717]">Certificazioni green</p>
                  </div>
                  <div>
                    <p className="text-[#171717] mb-2">Design sostenibile</p>
                    <p className="text-[#171717] mb-2">Packaging riciclabile</p>
                    <p className="text-[#171717]">Delivery carbon neutral</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
                >
                  Soluzioni eco →
                </button>
              </div>

              <div className="col-span-6">
                <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🌱</div>
                    <div className="text-xl font-medium">Eco Packaging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Overlay grigio */}
          <div 
            className="absolute inset-0 bg-gray-900 pointer-events-none transition-opacity duration-500 ease-out"
            style={{ opacity: overlayOpacities[3] }}
          />
        </div>

        {/* Card 5 - Cliente E */}
        <div ref={setCardRef(4)} className="sticky top-0 h-screen bg-gray-100 flex items-center relative">
          <div className="max-w-7xl mx-auto w-full" style={{paddingLeft: '0px', paddingRight: '0px'}}>
            <div className="flex justify-between items-center mb-20">
              <h2 className="text-6xl font-bold text-[#ed6d23]">Cliente E</h2>
              <span className="text-6xl font-black text-[#171717]">05</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-[#171717] leading-tight mb-8">
                  Soluzione premium con packaging personalizzato e gestione completa per brand internazionali.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div>
                    <p className="text-[#171717] mb-2">Volume internazionale</p>
                    <p className="text-[#171717] mb-2">€0.60 per lattina</p>
                    <p className="text-[#171717]">Pricing enterprise</p>
                  </div>
                  <div>
                    <p className="text-[#171717] mb-2">Gestione globale</p>
                    <p className="text-[#171717] mb-2">Multi-country shipping</p>
                    <p className="text-[#171717]">Support H24</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
                >
                  Scala globalmente →
                </button>
              </div>

              <div className="col-span-6">
                <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🌍</div>
                    <div className="text-xl font-medium">Global Enterprise</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Overlay grigio */}
          <div 
            className="absolute inset-0 bg-gray-900 pointer-events-none transition-opacity duration-500 ease-out"
            style={{ opacity: overlayOpacities[4] }}
          />
        </div>
      </section>

      {/* Private Label Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <div className="grid grid-cols-12 gap-16 items-start">
            <div className="col-span-4">
              <p className="text-base text-[#171717]">→ Private Label</p>
            </div>

            <div className="col-span-2"></div>

            <div className="col-span-6">
              <h2 className="text-4xl font-bold text-[#171717] leading-tight mb-6">
                Packaging completamente personalizzato da zero per il tuo brand enterprise.
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">
                Soluzione premium per brand affermati che vogliono packaging unico. Design custom, dimensioni personalizzate, 
                materiali premium e gestione completa della produzione. Include consulenza design, prototipazione 
                e supporto tecnico dedicato per progetti enterprise.
              </p>
              
              <button 
                onClick={actions.startConfigurator}
                className="px-8 py-4 bg-[#ed6d23] text-white font-medium rounded-full hover:bg-[#d55a1a] transition-colors"
              >
                Configurazione Premium →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Work Gallery Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-5xl font-bold text-[#171717]">
              Portfolio Progetti
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium text-[#171717]">Configuratore</span>
              <span className="text-2xl font-medium text-[#ed6d23]">Enterprise</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="group">
              <div className="w-full h-96 bg-gray-200 rounded-2xl mb-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <div className="text-sm">White Label Project</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-[#171717]">
                  Brand Beverage Co.
                </h3>
                <span className="text-[#ed6d23] text-sm font-medium">
                  (White Label Premium)
                </span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                2520 lattine personalizzate con design premium, etichette custom e delivery in 15 giorni.
              </p>
            </div>

            {/* Project 2 */}
            <div className="group">
              <div className="w-full h-96 bg-gray-200 rounded-2xl mb-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💼</div>
                    <div className="text-sm">Private Label Project</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-[#171717]">
                  Enterprise Drinks Ltd.
                </h3>
                <span className="text-[#ed6d23] text-sm font-medium">
                  (Private Label Custom)
                </span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Packaging completamente custom con design unico, dimensioni personalizzate e materiali premium.
              </p>
            </div>

            {/* Project 3 */}
            <div className="group">
              <div className="w-full h-96 bg-gray-200 rounded-2xl mb-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <div className="text-sm">Startup Solution</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-[#171717]">
                  Startup Energy
                </h3>
                <span className="text-[#ed6d23] text-sm font-medium">
                  (Market Validation)
                </span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                600 lattine per test di mercato con supporto consulenza e strategia di validazione prodotto.
              </p>
            </div>

            {/* Project 4 */}
            <div className="group">
              <div className="w-full h-96 bg-gray-200 rounded-2xl mb-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <div className="text-sm">Volume Enterprise</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-[#171717]">
                  Premium Beverages Corp.
                </h3>
                <span className="text-[#ed6d23] text-sm font-medium">
                  (Volume Enterprise)
                </span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                5000 lattine con pricing ottimizzato, gestione enterprise e supporto dedicato per grandi volumi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          {/* Main Footer Content */}
          <div className="grid grid-cols-12 gap-16 mb-16">
            <div className="col-span-6">
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-[#ed6d23]">Café 124</h4>
                <div className="text-sm text-gray-500 leading-relaxed space-y-1">
                  <p>P. Iva 11298940963</p>
                  <p>Via Pasquale Sottocorno 17</p>
                  <p>Milano, Italy</p>
                </div>
              </div>
            </div>
            
            <div className="col-span-3">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Contact</p>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>info@drink124.com</p>
                  <p>+39 022 110 2413</p>
                </div>
              </div>
            </div>
            
            <div className="col-span-3">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Legale</p>
                <div className="text-sm space-y-2">
                  <a href="https://drink124.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Privacy Policy</a>
                  <a href="https://drink124.com/policies/refund-policy" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Refund Policy</a>
                  <a href="https://drink124.com/policies/terms-of-service" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Condizioni di utilizzo</a>
                  <a href="https://drink124.com/policies/contact-information" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Export</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Line */}
          <div className="border-t border-gray-200 pt-6 pb-2 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-light">
              © {new Date().getFullYear()} Café 124
            </p>
            <p className="text-xs text-gray-400 font-light">
              Designed by <a href="https://zero823.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#ed6d23] transition-colors duration-200">zero823</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <ConfiguratorProvider>
      <LandingPageContent />
    </ConfiguratorProvider>
  )
}