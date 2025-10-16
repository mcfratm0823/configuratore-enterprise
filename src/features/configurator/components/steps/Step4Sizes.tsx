'use client'

import { useConfigurator, ServiceSubType } from '@/context'

export function Step4Sizes() {
  const { state, actions } = useConfigurator()

  // Se non è White Label, mostra placeholder per Private Label
  if (state.serviceSubType !== ServiceSubType.WHITELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Specifiche dimensioni per il tuo progetto Private Label
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

  // Verifica presenza canSelection per business logic
  if (!state.canSelection) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-red-600 mb-6">
          ⚠️ Seleziona prima una quantità di lattine nello Step 3
        </div>
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-700">
            Impossibile generare preventivo senza selezione lattine
          </p>
        </div>
      </div>
    )
  }

  // Business logic: Calcolo preventivo enterprise
  const canSelectionTotal = state.canSelection.totalPrice

  const handleContinueToggle = () => {
    actions.setWantsToContinueQuote(!state.wantsToContinueQuote)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-6">
        Ecco il tuo preventivo per l&apos;ordine White Label
      </div>

      {/* Preventivo Summary Enterprise */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Riepilogo Preventivo
        </h3>
        
        <div className="space-y-3">
          {/* Can Selection Detail */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <span className="text-gray-600">
                {state.canSelection.quantity.toLocaleString()} lattine da 200ml
              </span>
              <div className="text-xs text-gray-500">
                {state.canSelection.cartonsCount} cartoni da 24 lattine
              </div>
            </div>
            <span className="font-medium text-gray-900">
              €{canSelectionTotal.toLocaleString('it-IT', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-3"></div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">
              Totale preventivo
            </span>
            <div className="text-right">
              <span className="text-xl font-bold text-[#2d5a3d]">
                €{canSelectionTotal.toLocaleString('it-IT', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                + €18 a pallet
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            * Escluse le spese di spedizione
          </p>
          
          <div className="mt-4">
            <p className="text-xs text-gray-500 italic">
              * Preventivo indicativo
            </p>
          </div>
        </div>
      </div>

      {/* Continue Toggle Enterprise */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Vuoi continuare?
            </h4>
            <p className="text-sm text-gray-600">
              Procedi per scaricare il template e richiedere un preventivo personalizzato
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${state.wantsToContinueQuote ? 'text-[#2d5a3d]' : 'text-gray-500'}`}>
              {state.wantsToContinueQuote ? 'Sì' : 'No'}
            </span>
            <button
              onClick={handleContinueToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2 ${
                state.wantsToContinueQuote ? 'bg-[#2d5a3d]' : 'bg-gray-300'
              }`}
              aria-label={state.wantsToContinueQuote ? 'Disabilita continuazione' : 'Abilita continuazione'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.wantsToContinueQuote ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}