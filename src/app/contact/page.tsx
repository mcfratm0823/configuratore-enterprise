'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-3xl border-b border-white/40 backdrop-saturate-150">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-2 md:py-4 px-4 lg:px-0">
          <Image 
            src="/logo-124.png" 
            alt="124 Logo" 
            width={48}
            height={48}
            className="h-10 w-10 md:h-12 md:w-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = '/'}
          />
          <nav className="hidden md:flex items-center space-x-8">
            <a href="https://drink124.com/" target="_blank" rel="noopener noreferrer" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Home</a>
            <a href="https://drink124.com/pages/chi-siamo-cafe-124" target="_blank" rel="noopener noreferrer" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Chi siamo</a>
            <a href="/configurator" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Configuratore</a>
            <a href="/contact" className="text-[#ed6d23] font-medium">Contatti</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 relative z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className={`w-6 h-0.5 bg-[#171717] mb-1 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5 bg-[#ed6d23]' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#171717] mb-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#171717] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5 bg-[#ed6d23]' : ''}`}></div>
          </button>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 w-screen h-screen bg-white z-40 block md:hidden">
            <div className="pt-20 px-4">
              <nav className="flex flex-col">
                <a 
                  href="https://drink124.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#171717] font-medium text-xl py-6 border-b border-gray-200 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="https://drink124.com/pages/chi-siamo-cafe-124" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#171717] font-medium text-xl py-6 border-b border-gray-200 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Chi siamo
                </a>
                <a 
                  href="/configurator" 
                  className="text-[#171717] font-medium text-xl py-6 border-b border-gray-200 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Configuratore
                </a>
                <a 
                  href="/contact" 
                  className="text-[#ed6d23] font-medium text-xl py-6 border-b border-gray-200 flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contatti
                  <img src="/arrow.svg" alt="→" className="w-4 h-4 brightness-0 saturate-100" style={{filter: 'invert(47%) sepia(83%) saturate(3207%) hue-rotate(8deg) brightness(96%) contrast(91%)'}} />
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Centered in viewport */}
      <main className="flex-1 flex items-center justify-center px-4 lg:px-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-12 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center lg:space-y-0">
            {/* Left Column - Main Title */}
            <div className="lg:col-span-4 text-center lg:text-left">
              <h1 className="text-[#171717] leading-tight text-4xl md:text-5xl lg:text-6xl font-normal mb-4 lg:mb-6">
                Contatti
              </h1>
              <h2 className="text-[#171717] text-base md:text-lg lg:text-xl font-normal leading-relaxed">
                Lorem ipsum dolor sit amet, <span className="text-[#ed6d23] font-medium">consectetur</span> adipiscing elit sed do eiusmod tempor.
              </h2>
            </div>

            {/* Empty space */}
            <div className="hidden lg:block lg:col-span-2"></div>

            {/* Right Column - Contact details */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 text-center lg:text-left">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">Email</h3>
                    <a href="mailto:info@drink124.com" className="text-[#171717] hover:text-[#ed6d23] transition-colors">
                      info@drink124.com
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">Telefono</h3>
                    <a href="tel:+390221102413" className="text-[#171717] hover:text-[#ed6d23] transition-colors">
                      +39 022 110 2413
                    </a>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">Sede</h3>
                    <div className="text-[#171717] space-y-1">
                      <p>Via Pasquale Sottocorno 17</p>
                      <p>Milano, Italy</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-[#171717] mb-3">P. IVA</h3>
                    <p className="text-[#171717]">11298940963</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}