'use client'

import { useConfigurator, ServiceSubType, type CanSelection } from '@/context'

export function Step3Materials() {
  const { state, actions } = useConfigurator()

  // Lattine White Label - Pricing enterprise
  const canOptions = [
    {
      quantity: 600,
      cartonsCount: 25,
      pricePerCan: 0.80,
      description: '~25 cartoni da 24 lattine'
    },
    {
      quantity: 1200,
      cartonsCount: 50,
      pricePerCan: 0.75,
      description: '~50 cartoni da 24 lattine'
    },
    {
      quantity: 2520,
      cartonsCount: 105,
      pricePerCan: 0.70,
      description: '~105 cartoni da 24 lattine'
    },
    {
      quantity: 5000,
      cartonsCount: 205,
      pricePerCan: 0.65,
      description: '~205 cartoni da 24 lattine'
    }
  ]

  const handleCanSelection = (quantity: number, cartonsCount: number, pricePerCan: number) => {
    const canSelection: CanSelection = {
      size: 200, // ml fisso
      quantity,
      cartonsCount,
      totalPrice: quantity * pricePerCan
    }
    actions.setCanSelection(canSelection)
  }

  // Se non è White Label, mostra placeholder per Private Label
  if (state.serviceSubType !== ServiceSubType.WHITELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Definisci i requisiti per il tuo progetto Private Label
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Grid 2x2 Enterprise Layout */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {canOptions.map((option) => (
          <div
            key={option.quantity}
            onClick={() => handleCanSelection(option.quantity, option.cartonsCount, option.pricePerCan)}
            className={`rounded-lg p-4 md:p-6 cursor-pointer transition-all ${
              state.canSelection?.quantity === option.quantity
                ? 'border-2 border-[#ed6d23] bg-white' 
                : 'border border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-medium text-gray-900">
                  {option.quantity.toLocaleString()} lattine
                </h3>
                <span className="text-xs md:text-sm text-gray-500">
                  (200ml ciascuna)
                </span>
                <p className="text-gray-600 text-xs md:text-sm mt-2">
                  {option.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg md:text-xl font-bold text-gray-900">
                  €{(option.quantity * option.pricePerCan).toLocaleString('it-IT', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  €{option.pricePerCan.toFixed(2)}/lattina
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Can Info - Integrated */}
      {state.canSelection && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs md:text-sm text-gray-700 space-y-1">
            <div className="flex justify-between items-center">
              <span>{state.canSelection.quantity.toLocaleString()} lattine × €{(state.canSelection.totalPrice / state.canSelection.quantity).toFixed(2)}</span>
              <span className="font-medium">€{state.canSelection.totalPrice.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {state.canSelection.cartonsCount} cartoni da 24 lattine ciascuno
            </div>
          </div>
        </div>
      )}
    </div>
  )
}