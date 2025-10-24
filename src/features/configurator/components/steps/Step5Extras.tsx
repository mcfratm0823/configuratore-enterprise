'use client'

import { useConfigurator, ServiceSubType } from '@/context'
import { useState } from 'react'

export function Step5Extras() {
  const { state, actions } = useConfigurator()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadCompleted, setDownloadCompleted] = useState(false)

  // Se non è White Label, mostra placeholder per Private Label
  if (state.serviceSubType !== ServiceSubType.WHITELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Personalizzazioni extra per il tuo progetto Private Label
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Configurazione Private Label in arrivo...
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Sistema enterprise in sviluppo
          </p>
        </div>
      </div>
    )
  }

  // Prerequisite validation enterprise
  if (!state.wantsToContinueQuote) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-red-600 mb-6">
          ⚠️ Devi prima attivare &quot;Vuoi continuare?&quot; nello Step 4
        </div>
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-700">
            Completa il preventivo nello Step 4 per procedere al download
          </p>
        </div>
      </div>
    )
  }

  const handleDownloadZIP = async () => {
    setIsDownloading(true)
    setDownloadCompleted(false)
    
    try {
      // Download ZIP template da GitHub CDN
      const response = await fetch('https://raw.githubusercontent.com/mcfratm0823/configuratore-enterprise/main/assets/Testi_template.zip')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'white-label-templates.zip'
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup URL object
      URL.revokeObjectURL(url)
      
      // UX delay per feedback visivo
      setTimeout(() => {
        setIsDownloading(false)
        setDownloadCompleted(true)
        // Segna download completato nel context
        actions.setHasDownloadedTemplate(true)
      }, 1500)
      
    } catch (error: unknown) {
      setIsDownloading(false)
      // Enterprise error handling
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      console.error('📥 ZIP download error:', errorMessage)
      // TODO: Mostrare error message all'utente
    }
  }


  return (
    <div className="space-y-6">

      {/* Template Download Card Enterprise */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
        <div className="mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
            downloadCompleted ? 'bg-green-600' : 'bg-[#2d5a3d]'
          }`}>
            {downloadCompleted ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Template White Label
          </h3>
          
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Scarica il pacchetto ZIP con tutti i template PDF professionali per le tue etichette
          </p>

        </div>

        {/* Download Button Enterprise */}
        <button
          onClick={handleDownloadZIP}
          disabled={isDownloading || downloadCompleted}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d5a3d] ${
            downloadCompleted
              ? 'bg-green-600 cursor-default'
              : isDownloading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#2d5a3d] hover:bg-[#4a7c59] hover:scale-105'
          }`}
        >
          {downloadCompleted ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Template Scaricato
            </>
          ) : isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Download in corso...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Scarica Template ZIP
            </>
          )}
        </button>

        {/* Message Enterprise */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Preparati a creare la tua etichetta, verrai contattato a breve
          </p>
        </div>
      </div>

      {/* Success Message Minimal */}
      {downloadCompleted && (
        <div className="text-center">
          <p className="text-sm text-gray-500 italic">
            Template scaricato con successo
          </p>
        </div>
      )}
    </div>
  )
}