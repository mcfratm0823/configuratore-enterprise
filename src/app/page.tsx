'use client'

import { ConfiguratorProvider, useConfigurator } from '@/context'

function LandingPageContent() {
  const { actions } = useConfigurator()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center">
          <img 
            src="/logo-124.svg" 
            alt="124 Logo" 
            className="h-12 w-12"
          />
        </div>
        <nav className="flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-black transition-colors">Work</a>
          <a href="#" className="text-gray-700 hover:text-black transition-colors">Over ons</a>
          <button 
            onClick={actions.startConfigurator}
            className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
          >
            Configurator
          </button>
          <a href="#" className="text-gray-700 hover:text-black transition-colors">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Text Section */}
          <div className="grid grid-cols-12 gap-16 items-start mb-24">
            {/* Left Column - Main Title */}
            <div className="col-span-4">
              <h1 className="text-8xl font-black text-black leading-none">
                Packaging
              </h1>
            </div>

            {/* Empty space */}
            <div className="col-span-2"></div>

            {/* Right Column - Headline */}
            <div className="col-span-6 pt-4">
              <h2 className="text-4xl font-light text-black leading-tight">
                Configuratore enterprise per{' '}
                <span className="text-blue-500 font-medium">packaging</span>
                <br />
                personalizzato White Label e Private Label.
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
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-16 items-start">
            {/* Left Column - Small title */}
            <div className="col-span-4">
              <p className="text-base text-black">→ White Label</p>
            </div>

            {/* Empty space */}
            <div className="col-span-2"></div>

            {/* Right Column - Main content */}
            <div className="col-span-6">
              <h2 className="text-4xl font-bold text-black leading-tight mb-6">
                Lattine preconfezionate da 200ml con etichette personalizzate per il tuo brand.
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">
                Soluzione rapida e professionale per lanciare il tuo prodotto. Configuratore enterprise con pricing dinamico, 
                template download, integrazione Stripe per campioni e sistema di preventivi automatizzato. 
                Perfetto per startup e brand che vogliono entrare velocemente nel mercato delle bevande.
              </p>
              
              <button 
                onClick={actions.startConfigurator}
                className="px-8 py-4 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
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
        <div className="sticky top-0 h-screen bg-white flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            {/* Title row with number */}
            <div className="flex justify-between items-center mb-40">
              <h2 className="text-6xl font-bold text-blue-500">Cliente A</h2>
              <span className="text-6xl font-black text-black">01</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              {/* Left Column - Content */}
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-black leading-tight mb-8">
                  Lattine personalizzate 200ml con design premium e etichette White Label di alta qualità.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-black mb-2">Quantità: 2520 lattine</p>
                    <p className="text-black mb-2">Prezzo: €0.70 cad.</p>
                    <p className="text-black">Template scaricato</p>
                  </div>
                  <div>
                    <p className="text-black mb-2">Campione richiesto</p>
                    <p className="text-black mb-2">Pagamento Stripe</p>
                    <p className="text-black">Delivery 15 giorni</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
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
        </div>

        {/* Card 2 - Cliente B */}
        <div className="sticky top-0 h-screen bg-white flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="flex justify-between items-center mb-40">
              <h2 className="text-6xl font-bold text-blue-500">Cliente B</h2>
              <span className="text-6xl font-black text-black">02</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-black leading-tight mb-8">
                  Configurazione enterprise con 5000 lattine, pricing ottimizzato e sistema di gestione ordini.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-black mb-2">Volume enterprise</p>
                    <p className="text-black mb-2">€0.65 per lattina</p>
                    <p className="text-black">Sconto quantità</p>
                  </div>
                  <div>
                    <p className="text-black mb-2">Gestione completa</p>
                    <p className="text-black mb-2">Support dedicato</p>
                    <p className="text-black">Delivery veloce</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
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
        </div>

        {/* Card 3 - Cliente C */}
        <div className="sticky top-0 h-screen bg-white flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="flex justify-between items-center mb-40">
              <h2 className="text-6xl font-bold text-blue-500">Cliente C</h2>
              <span className="text-6xl font-black text-black">03</span>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              <div className="col-span-6">
                <h3 className="text-3xl font-bold text-black leading-tight mb-8">
                  Soluzione startup con 600 lattine per test di mercato e validazione prodotto.
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-black mb-2">Startup friendly</p>
                    <p className="text-black mb-2">Test marketing</p>
                    <p className="text-black">Investimento minimo</p>
                  </div>
                  <div>
                    <p className="text-black mb-2">Validation veloce</p>
                    <p className="text-black mb-2">Supporto consulenza</p>
                    <p className="text-black">Scale-up ready</p>
                  </div>
                </div>
                
                <button 
                  onClick={actions.startConfigurator}
                  className="px-8 py-3 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
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
        </div>
      </section>

      {/* Private Label Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-16 items-start">
            <div className="col-span-4">
              <p className="text-base text-black">→ Private Label</p>
            </div>

            <div className="col-span-2"></div>

            <div className="col-span-6">
              <h2 className="text-4xl font-bold text-black leading-tight mb-6">
                Packaging completamente personalizzato da zero per il tuo brand enterprise.
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">
                Soluzione premium per brand affermati che vogliono packaging unico. Design custom, dimensioni personalizzate, 
                materiali premium e gestione completa della produzione. Include consulenza design, prototipazione 
                e supporto tecnico dedicato per progetti enterprise.
              </p>
              
              <button 
                onClick={actions.startConfigurator}
                className="px-8 py-4 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
              >
                Configurazione Premium →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Work Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-5xl font-bold text-black">
              Portfolio Progetti
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium text-black">Configuratore</span>
              <span className="text-2xl font-medium text-blue-500">Enterprise</span>
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
                <h3 className="text-2xl font-bold text-black">
                  Brand Beverage Co.
                </h3>
                <span className="text-blue-500 text-sm font-medium">
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
                <h3 className="text-2xl font-bold text-black">
                  Enterprise Drinks Ltd.
                </h3>
                <span className="text-blue-500 text-sm font-medium">
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
                <h3 className="text-2xl font-bold text-black">
                  Startup Energy
                </h3>
                <span className="text-blue-500 text-sm font-medium">
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
                <h3 className="text-2xl font-bold text-black">
                  Premium Beverages Corp.
                </h3>
                <span className="text-blue-500 text-sm font-medium">
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