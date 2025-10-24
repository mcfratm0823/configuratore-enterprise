'use client'

import { useConfigurator, ServiceSubType } from '@/context'
import { useState } from 'react'

// Enterprise packaging configuration types
interface PackagingOption {
  id: string
  name: string
  description: string
  category: 'label' | 'digital'
}

const packagingOptions: PackagingOption[] = [
  {
    id: 'label-antiumidita',
    name: 'Etichetta Antiumidità Personalizzata',
    description: 'Etichetta resistente all\'umidità con design personalizzato applicata sulla lattina',
    category: 'label'
  },
  {
    id: 'lattina-digitale',
    name: 'Lattina Stampata Digitalmente',
    description: 'Stampa diretta digitale ad alta qualità sulla superficie della lattina',
    category: 'digital'
  }
]

export function Step5PackagingChoice() {
  const { state, actions } = useConfigurator()
  const [selectedPackaging, setSelectedPackaging] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')

  // Solo per Private Label
  if (state.serviceSubType !== ServiceSubType.PRIVATELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Scelta packaging disponibile solo per Private Label
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Step non applicabile per White Label
          </p>
        </div>
      </div>
    )
  }


  // Handle packaging selection
  const handlePackagingSelect = (packagingId: string) => {
    setSelectedPackaging(packagingId)
    setValidationError('')
    
    // Save to context
    const packagingOption = packagingOptions.find(p => p.id === packagingId)
    if (packagingOption) {
      actions.setPackagingSelection({
        selectedPackaging: packagingId,
        packagingType: packagingOption.category
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Packaging Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packagingOptions.map((packaging) => {
          const isSelected = selectedPackaging === packaging.id
          
          return (
            <div
              key={packaging.id}
              onClick={() => handlePackagingSelect(packaging.id)}
              className={`rounded-lg p-6 cursor-pointer transition-all hover:border-gray-400 ${
                isSelected
                  ? 'border-2 border-[#ed6d23] bg-white' 
                  : 'border border-gray-200 bg-white'
              }`}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {packaging.name}
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  {packaging.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        </div>
      )}

      {/* Cost disclaimer */}
      <p className="text-xs text-gray-500 italic">
        *I costi sono da concordare in base al prodotto
      </p>
    </div>
  )
}