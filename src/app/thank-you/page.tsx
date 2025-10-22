'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') // 'white-label' or 'private-label'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate processing delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const isPrivateLabel = type === 'private-label'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a3d] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Elaborando la richiesta...</h2>
          <p className="text-gray-600">Attendere prego...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🙏 Grazie per la tua richiesta!
        </h1>
        
        <p className="text-gray-600 mb-6">
          La tua richiesta di preventivo <strong>{isPrivateLabel ? 'Private Label' : 'White Label'}</strong> è stata inviata con successo. 
          Ti contatteremo a breve per discutere i dettagli del tuo progetto.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-medium text-blue-900 mb-3">📋 Cosa succede ora?</h3>
          <div className="text-sm text-blue-700 space-y-2">
            {isPrivateLabel ? (
              <ul className="text-left space-y-1">
                <li>• Analizzeremo la tua richiesta di bevanda personalizzata</li>
                <li>• Ti contatteremo entro 24 ore per un colloquio tecnico</li>
                <li>• Preparer­emo un preventivo dettagliato per il tuo progetto</li>
                <li>• Discuteremo tempi di sviluppo e produzione</li>
              </ul>
            ) : (
              <ul className="text-left space-y-1">
                <li>• Riceverai una email di conferma a breve</li>
                <li>• Analizzeremo la tua richiesta entro 24 ore</li>
                <li>• Ti invieremo un preventivo dettagliato personalizzato</li>
                <li>• Un nostro esperto ti contatterà per finalizzare</li>
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">📧 Controlla la tua email</p>
            <p>Ti abbiamo inviato una conferma con tutti i dettagli della tua richiesta.</p>
          </div>
        </div>
        
        <div className="space-y-3">
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

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Hai domande? Contattaci a <strong>info@configuratore-enterprise.com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a3d] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Caricamento...</h2>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}