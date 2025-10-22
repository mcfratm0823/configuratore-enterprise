'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a3d] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Verificando il pagamento...</h2>
          <p className="text-gray-600">Attendere prego...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🎉 Pagamento Confermato!</h1>
        
        <p className="text-gray-600 mb-6">
          Il tuo campione è stato ordinato con successo. Riceverai una email di conferma a breve con tutti i dettagli.
        </p>
        
        
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Prossimi passi:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Riceverai una email di conferma</li>
              <li>• Il campione verrà preparato entro 2-3 giorni</li>
              <li>• Ti invieremo il tracking di spedizione</li>
              <li>• Il nostro team ti contatterà per il preventivo</li>
            </ul>
          </div>
          
          <button
            onClick={() => window.location.href = '/configurator'}
            className="w-full bg-[#2d5a3d] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#4a7c59] transition-colors"
          >
            Configura un altro progetto
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a3d] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Caricamento...</h2>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}