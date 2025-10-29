'use client'

import Image from 'next/image'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-3xl border-b border-white/40 backdrop-saturate-150">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <Image 
            src="/logo-124.png" 
            alt="124 Logo" 
            width={48}
            height={48}
            className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = '/'}
          />
          <nav className="flex items-center space-x-8">
            <a href="https://drink124.com/" target="_blank" rel="noopener noreferrer" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Home</a>
            <a href="https://drink124.com/pages/chi-siamo-cafe-124" target="_blank" rel="noopener noreferrer" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Chi siamo</a>
            <a href="/configurator" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Configuratore</a>
            <a href="/contact" className="text-[#ed6d23] font-medium">Contatti</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <div className="grid grid-cols-12 gap-16 items-start mb-16">
            {/* Left Column - Main Title */}
            <div className="col-span-4">
              <h1 className="text-[#171717] leading-tight" style={{fontSize: '64px', fontWeight: '400', lineHeight: '70px'}}>
                Contatti
              </h1>
            </div>

            {/* Empty space */}
            <div className="col-span-2"></div>

            {/* Right Column - Headline */}
            <div className="col-span-6 pt-4">
              <h2 className="text-[#171717]" style={{fontSize: '28px', fontWeight: '400', lineHeight: '32px'}}>
                Lorem ipsum dolor sit amet, <span className="text-[#ed6d23] font-medium">consectetur</span> adipiscing elit sed do eiusmod tempor.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto" style={{paddingLeft: '0px', paddingRight: '0px'}}>
          <div className="grid grid-cols-12 gap-16 items-start">
            {/* Left Column - Section title */}
            <div className="col-span-4">
              <p className="text-base text-[#171717]">→ Informazioni</p>
            </div>

            {/* Empty space */}
            <div className="col-span-2"></div>

            {/* Right Column - Contact details */}
            <div className="col-span-6">
              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">Email</h3>
                    <a href="mailto:info@drink124.com" className="text-gray-600 hover:text-[#ed6d23] transition-colors">
                      info@drink124.com
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">Telefono</h3>
                    <a href="tel:+390221102413" className="text-gray-600 hover:text-[#ed6d23] transition-colors">
                      +39 022 110 2413
                    </a>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">Sede</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Via Pasquale Sottocorno 17</p>
                      <p>Milano, Italy</p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}