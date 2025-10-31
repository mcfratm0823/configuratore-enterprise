'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
// import { useSearchParams } from 'next/navigation' // Future use

function SuccessContent() {
  // const searchParams = useSearchParams()
  // const sessionId = searchParams.get('session_id') // Future use for session verification
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate verification delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

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
              <h2 className="text-xl md:text-2xl font-medium text-[#171717] mb-3">Verificando il pagamento...</h2>
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
            onClick={() => window.location.href = '/'}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start lg:space-y-0">
            {/* Left Column - Title */}
            <div className="lg:col-span-4">
              <div className="w-16 h-16 bg-[#ed6d23] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#ed6d23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-[#171717] leading-tight text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-4">
                Pagamento Confermato
              </h1>
            </div>

            {/* Empty space */}
            <div className="lg:col-span-2"></div>

            {/* Right Column - Content */}
            <div className="lg:col-span-6">
              <div className="space-y-8">
                <div>
                  <h2 className="text-[#171717] text-base md:text-lg lg:text-xl xl:text-2xl font-normal leading-relaxed mb-6">
                    Il tuo campione <span className="text-[#ed6d23] font-medium">White Label</span> è stato ordinato con successo.
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Riceverai una email di conferma a breve con tutti i dettagli.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200">
                  <h3 className="text-lg md:text-xl font-medium text-[#171717] mb-4">Prossimi passi</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ed6d23] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm md:text-base">Riceverai una email di conferma</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ed6d23] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm md:text-base">Il campione verrà preparato entro 2-3 giorni</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ed6d23] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm md:text-base">Ti invieremo il tracking di spedizione</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#ed6d23] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm md:text-base">Il nostro team ti contatterà per il preventivo</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span 
                    onClick={() => window.location.href = '/configurator'}
                    className="relative flex items-center gap-2 text-[#171717] font-medium cursor-pointer hover:text-[#ed6d23] transition-colors text-lg"
                  >
                    Configura un altro progetto
                    <img src="/arrow.svg" alt="→" className="w-4 h-4 brightness-0 saturate-100" style={{filter: 'invert(47%) sepia(83%) saturate(3207%) hue-rotate(8deg) brightness(96%) contrast(91%)'}} />
                    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-[#ed6d23] opacity-0 hover:opacity-100 transition-opacity"></span>
                  </span>
                  
                  <span 
                    onClick={() => window.location.href = '/'}
                    className="relative flex items-center gap-2 text-[#171717] font-medium cursor-pointer hover:text-[#ed6d23] transition-colors text-lg"
                  >
                    Torna alla Home
                    <img src="/arrow.svg" alt="→" className="w-4 h-4 brightness-0 saturate-100" style={{filter: 'invert(47%) sepia(83%) saturate(3207%) hue-rotate(8deg) brightness(96%) contrast(91%)'}} />
                    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-[#ed6d23] opacity-0 hover:opacity-100 transition-opacity"></span>
                  </span>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
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

export default function SuccessPage() {
  return (
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
      <SuccessContent />
    </Suspense>
  )
}