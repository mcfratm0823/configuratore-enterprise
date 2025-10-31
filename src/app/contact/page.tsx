'use client'

import Image from 'next/image'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function ContactPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Focus management refs for mobile menu
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  
  // Mobile menu focus management
  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true)
    // Focus on first menu item after menu opens
    setTimeout(() => {
      if (firstMenuItemRef.current) {
        firstMenuItemRef.current.focus()
      }
    }, 100)
  }, [])
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
    // Return focus to hamburger button
    setTimeout(() => {
      if (mobileMenuButtonRef.current) {
        mobileMenuButtonRef.current.focus()
      }
    }, 100)
  }, [])
  
  // Focus trap for mobile menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isMobileMenuOpen) return
    
    if (e.key === 'Escape') {
      e.preventDefault()
      closeMobileMenu()
    }
    
    if (e.key === 'Tab') {
      const menuElement = mobileMenuRef.current
      if (!menuElement) return
      
      const focusableElements = menuElement.querySelectorAll(
        'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }, [isMobileMenuOpen, closeMobileMenu])
  
  // Close menu on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu()
      }
    }
    
    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isMobileMenuOpen, closeMobileMenu])
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-3xl border-b border-white/40 backdrop-saturate-150">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-2 md:py-4 px-4 lg:px-0">
          <Image 
            src="/logo-124.png" 
            alt="124 Logo" 
            width={48}
            height={48}
            className="h-10 w-10 md:h-12 md:w-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push('/')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Torna alla homepage"
          />
          <nav id="navigation" className="hidden md:flex items-center space-x-8">
            <a href="https://drink124.com/" target="_blank" rel="noopener noreferrer" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Home</a>
            <a href="https://drink124.com/pages/chi-siamo-cafe-124" target="_blank" rel="noopener noreferrer" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Chi siamo</a>
            <a href="/configurator" className="text-[#171717] hover:text-[#ed6d23] transition-colors font-medium">Configuratore</a>
            <a href="/contact" className="text-[#ed6d23] font-medium">Contatti</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            ref={mobileMenuButtonRef}
            className="md:hidden p-2 relative z-50 focus:outline-none focus:ring-2 focus:ring-[#ed6d23] focus:ring-offset-2 rounded-lg"
            onClick={() => isMobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                isMobileMenuOpen ? closeMobileMenu() : openMobileMenu()
              }
            }}
            aria-label={isMobileMenuOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-haspopup="true"
          >
            <div className={`w-6 h-0.5 bg-[#171717] mb-1 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5 bg-[#ed6d23]' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#171717] mb-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#171717] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5 bg-[#ed6d23]' : ''}`}></div>
          </button>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="fixed inset-0 w-screen h-screen bg-white z-40 block md:hidden"
            onKeyDown={handleMenuKeyDown}
          >
            <div className="pt-20 px-4">
              <nav id="mobile-navigation-menu" className="flex flex-col" role="navigation" aria-label="Menu di navigazione mobile">
                <a 
                  ref={firstMenuItemRef}
                  href="https://drink124.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#171717] font-medium text-xl py-6 border-b border-gray-200 block focus:outline-none focus:ring-2 focus:ring-[#ed6d23] focus:ring-offset-2 focus:bg-gray-50 rounded-lg mx-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </a>
                <a 
                  href="https://drink124.com/pages/chi-siamo-cafe-124" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#171717] font-medium text-xl py-6 border-b border-gray-200 block focus:outline-none focus:ring-2 focus:ring-[#ed6d23] focus:ring-offset-2 focus:bg-gray-50 rounded-lg mx-2"
                  onClick={closeMobileMenu}
                >
                  Chi siamo
                </a>
                <a 
                  href="/configurator" 
                  className="text-[#171717] font-medium text-xl py-6 border-b border-gray-200 block focus:outline-none focus:ring-2 focus:ring-[#ed6d23] focus:ring-offset-2 focus:bg-gray-50 rounded-lg mx-2"
                  onClick={closeMobileMenu}
                >
                  Configuratore
                </a>
                <a 
                  href="/contact" 
                  className="text-[#ed6d23] font-medium text-xl py-6 border-b border-gray-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#ed6d23] focus:ring-offset-2 focus:bg-gray-50 rounded-lg mx-2"
                  onClick={closeMobileMenu}
                >
                  Contatti
                  <img src="/arrow.svg" alt="→" className="w-4 h-4 brightness-0 saturate-100" style={{filter: 'invert(47%) sepia(83%) saturate(3207%) hue-rotate(8deg) brightness(96%) contrast(91%)'}} />
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main id="main-content">
      <section className="pt-12 md:pt-24 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start lg:space-y-0 mb-8 md:mb-16">
            {/* Left Column - Main Title */}
            <div className="lg:col-span-4">
              <h1 className="text-[#171717] leading-tight text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal">
                Contatti
              </h1>
            </div>

            {/* Empty space */}
            <div className="lg:col-span-2"></div>

            {/* Right Column - Headline */}
            <div className="lg:col-span-6 pt-2 lg:pt-4">
              <h2 className="text-[#171717] text-base md:text-lg lg:text-xl xl:text-2xl font-normal leading-relaxed">
                Lorem ipsum dolor sit amet, <span className="text-[#ed6d23] font-medium">consectetur</span> adipiscing elit sed do eiusmod tempor.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start lg:space-y-0">
            {/* Left Column - Section title */}
            <div className="lg:col-span-4">
            </div>

            {/* Empty space */}
            <div className="hidden lg:block lg:col-span-2"></div>

            {/* Right Column - Contact details */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-6 md:gap-8 lg:gap-16">
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-lg md:text-xl font-medium text-[#171717] mb-2 md:mb-3">Email</h3>
                    <a href="mailto:info@drink124.com" className="text-gray-600 hover:text-[#ed6d23] transition-colors text-sm md:text-base">
                      info@drink124.com
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-lg md:text-xl font-medium text-[#171717] mb-2 md:mb-3">Telefono</h3>
                    <a href="tel:+390221102413" className="text-gray-600 hover:text-[#ed6d23] transition-colors text-sm md:text-base">
                      +39 022 110 2413
                    </a>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-lg md:text-xl font-medium text-[#171717] mb-2 md:mb-3">Sede</h3>
                    <div className="text-gray-600 space-y-1 text-sm md:text-base">
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

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-gray-100 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          {/* Main Footer Content */}
          <div className="space-y-8 lg:grid lg:grid-cols-12 lg:gap-16 lg:space-y-0 mb-8 lg:mb-12">
            <div className="lg:col-span-6">
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-lg md:text-xl font-bold text-[#ed6d23]">Café 124</h4>
                <div className="text-xs md:text-sm text-gray-500 leading-relaxed space-y-1">
                  <p>P. Iva 11298940963</p>
                  <p>Via Pasquale Sottocorno 17</p>
                  <p>Milano, Italy</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs md:text-sm text-gray-500">Contact</p>
                <div className="text-xs md:text-sm text-gray-700 space-y-2">
                  <p>info@drink124.com</p>
                  <p>+39 022 110 2413</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs md:text-sm text-gray-500">Legale</p>
                <div className="text-xs md:text-sm space-y-2">
                  <a href="https://drink124.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Privacy Policy</a>
                  <a href="https://drink124.com/policies/refund-policy" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Refund Policy</a>
                  <a href="https://drink124.com/policies/terms-of-service" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Condizioni di utilizzo</a>
                  <a href="https://drink124.com/policies/contact-information" target="_blank" rel="noopener noreferrer" className="block text-gray-700 hover:text-[#ed6d23] transition-colors duration-200">Export</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Line */}
          <div className="border-t border-gray-200 pt-4 md:pt-6 pb-2 space-y-2 md:flex md:justify-between md:items-center md:space-y-0">
            <p className="text-xs text-gray-400 font-light">
              © {new Date().getFullYear()} Café 124
            </p>
            <p className="text-xs text-gray-400 font-light">
              Designed by <a href="https://zero823.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#ed6d23] transition-colors duration-200">zero823</a>
            </p>
          </div>
        </div>
      </footer>
      </main>
    </div>
    </ErrorBoundary>
  )
}