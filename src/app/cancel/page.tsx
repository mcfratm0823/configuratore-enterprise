'use client'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pagamento Annullato</h1>
        
        <p className="text-gray-600 mb-6">
          Il pagamento è stato annullato. Non ti è stato addebitato nulla.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Vuoi riprovare?</h3>
          <p className="text-sm text-blue-700">
            Puoi tornare al configuratore e ripetere il processo di pagamento quando vuoi.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/configurator'}
            className="w-full bg-[#ed6d23] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#d55a1a] transition-colors"
          >
            Torna al Configuratore
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