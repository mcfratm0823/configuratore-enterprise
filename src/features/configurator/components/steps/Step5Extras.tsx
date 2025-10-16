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

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    setDownloadCompleted(false)
    
    try {
      // Simula download con fake PDF enterprise
      // Genera un PDF fake con content specifico
      const pdfContent = generateFakePDF()
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'template-etichetta-200ml-white-label.pdf'
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup URL object
      URL.revokeObjectURL(url)
      
      // Simula delay enterprise per UX
      setTimeout(() => {
        setIsDownloading(false)
        setDownloadCompleted(true)
        // Segna download completato nel context
        actions.setHasDownloadedTemplate(true)
      }, 2000)
      
    } catch (error: unknown) {
      setIsDownloading(false)
      // Enterprise error handling
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      console.error('📥 PDF download error:', errorMessage)
      // TODO: Mostrare error message all'utente
    }
  }

  // Genera fake PDF content enterprise
  const generateFakePDF = () => {
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 700 Td
(TEMPLATE ETICHETTA WHITE LABEL - 200ml) Tj
0 -20 Td
(Dimensioni: 8.5cm x 11cm) Tj
0 -20 Td
(Risoluzione: 300 DPI) Tj
0 -20 Td
(Formato: PDF per stampa professionale) Tj
0 -40 Td
(Testi obbligatori:) Tj
0 -20 Td
(- Ingredienti: Da specificare) Tj
0 -20 Td
(- Informazioni nutrizionali: Da aggiungere) Tj
0 -20 Td
(- Codice a barre: Spazio riservato) Tj
0 -40 Td
(NOTE: Template enterprise generato automaticamente) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-6">
        Scarica il template per creare la tua etichetta personalizzata
      </div>

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
            Template Etichetta 200ml
          </h3>
          
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Scarica il file PDF con le dimensioni esatte dell&apos;etichetta e i testi obbligatori per la tua lattina da 200ml
          </p>

        </div>

        {/* Download Button Enterprise */}
        <button
          onClick={handleDownloadPDF}
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
              Scarica Template PDF
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