'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') // 'white-label' or 'private-label'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate processing delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [setIsLoading])

  const isPrivateLabel = type === 'private-label'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header with Logo */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-0 py-4">
            <Image 
              src="/logo-124.png" 
              alt="124 Logo" 
              width={48}
              height={48}
              className="h-10 w-10 md:h-12 md:w-12"
            />
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-0 w-full">
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed6d23] mx-auto mb-6"></div>
              <h2 className="text-xl md:text-2xl font-medium text-[#171717] mb-3">Elaborando la richiesta...</h2>
              <p className="text-gray-600 text-base md:text-lg">Attendere prego...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-0 py-4">
          <Image 
            src="/logo-124.png" 
            alt="124 Logo" 
            width={48}
            height={48}
            className="h-10 w-10 md:h-12 md:w-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/')}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start lg:space-y-0">
            {/* Left Column - Title */}
            <div className="lg:col-span-5">
              <h1 className="text-[#171717] leading-tight text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-4">
                Richiesta <span className="text-[#ed6d23] font-medium">{isPrivateLabel ? 'Private Label' : 'White Label'}</span> inviata
              </h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                Ti contatteremo a breve per discutere i dettagli del tuo progetto.
              </p>
            </div>

            {/* Empty space */}
            <div className="lg:col-span-1"></div>

            {/* Right Column - Content */}
            <div className="lg:col-span-6">
              <div className="space-y-8">

                <div className="mb-4">
                  <h3 className="text-lg md:text-xl font-medium text-[#171717] mb-6">Cosa succede ora?</h3>
                  <div className="relative">
                    {/* Timeline line - hidden on mobile */}
                    <div className="absolute left-4 top-5 bottom-0 w-px bg-gradient-to-b from-[#ed6d23] via-[#ed6d23] to-transparent hidden md:block"></div>
                    
                    <div className="space-y-4 md:space-y-5">
                      {isPrivateLabel ? (
                        <>
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-[#ed6d23] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ed6d23]"></div>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h4 className="text-[#171717] text-sm md:text-base font-medium mb-1">Analisi richiesta</h4>
                              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Analizzeremo la tua richiesta di bevanda personalizzata</p>
                            </div>
                          </div>
                          
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-[#ed6d23] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ed6d23]"></div>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h4 className="text-[#171717] text-sm md:text-base font-medium mb-1">Colloquio tecnico</h4>
                              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Ti contatteremo entro 24 ore per discutere i dettagli</p>
                            </div>
                          </div>
                          
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-[#ed6d23] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ed6d23]"></div>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h4 className="text-[#171717] text-sm md:text-base font-medium mb-1">Preventivo dettagliato</h4>
                              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Prepareremo un preventivo completo personalizzato</p>
                            </div>
                          </div>
                          
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-[#ed6d23] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ed6d23]"></div>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h4 className="text-[#171717] text-sm md:text-base font-medium mb-1">Avvio produzione</h4>
                              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Finalizzazione contratto e inizio produzione</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-[#ed6d23] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ed6d23]"></div>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h4 className="text-[#171717] text-sm md:text-base font-medium mb-1">Ricevi email e preventivo</h4>
                              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Riceverai subito email di conferma con preventivo dettagliato</p>
                            </div>
                          </div>
                          
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-[#ed6d23] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ed6d23]"></div>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h4 className="text-[#171717] text-sm md:text-base font-medium mb-1">Consulenza personalizzata</h4>
                              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Un consulente ti contatterà per finalizzare tutti i dettagli</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>



                {/* Mobile CTA - After Timeline */}
                <div className="lg:hidden pt-6 border-t border-gray-200 mb-6">
                  <span 
                    onClick={() => router.push('/')}
                    className="relative inline-flex items-center gap-2 text-[#ed6d23] font-medium cursor-pointer text-base"
                  >
                    Torna alla Home
                    <img src="/arrow.svg" alt="→" className="w-4 h-4 brightness-0 saturate-100" style={{filter: 'invert(47%) sepia(83%) saturate(3207%) hue-rotate(8deg) brightness(96%) contrast(91%)'}} />
                    <span className="absolute left-0 -bottom-1 right-0 h-0.5 bg-[#ed6d23]"></span>
                  </span>
                </div>

                {/* Contact Info */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs md:text-sm text-gray-500">
                    Hai domande? Contattaci a <span className="text-[#ed6d23] font-medium">info@drink124.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 lg:px-0 py-4">
              <Image 
                src="/logo-124.png" 
                alt="124 Logo" 
                width={48}
                height={48}
                className="h-10 w-10 md:h-12 md:w-12"
              />
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed6d23] mx-auto mb-6"></div>
              <h2 className="text-xl md:text-2xl font-medium text-[#171717] mb-3">Caricamento...</h2>
            </div>
          </div>
        </div>
      }>
        <ErrorBoundary>
          <ThankYouContent />
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  )
}