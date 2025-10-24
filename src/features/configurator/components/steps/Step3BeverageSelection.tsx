'use client'

import { useConfigurator, ServiceSubType } from '@/context'
import { useState } from 'react'

// Enterprise beverage configuration types
interface BeverageOption {
  id: string
  name: string
  description: string
  available: boolean
  category: 'coffee' | 'tea' | 'custom'
}

const beverageOptions: BeverageOption[] = [
  {
    id: 'cold-brew-plain',
    name: 'Cold Brew Coffee',
    description: 'Liscio senza zucchero e senza gas',
    available: true,
    category: 'coffee'
  },
  {
    id: 'cold-brew-sugar', 
    name: 'Cold Brew con Zucchero',
    description: 'Cold brew coffee dolcificato',
    available: true,
    category: 'coffee'
  },
  {
    id: 'cold-tea',
    name: 'Thè Estratto a Freddo',
    description: 'Cold brew tea premium',
    available: true,
    category: 'tea'
  },
  {
    id: 'rd-custom',
    name: 'Ricerca e Sviluppo',
    description: 'Altre bevande da creare da zero',
    available: true,
    category: 'custom'
  }
]

export function Step3BeverageSelection() {
  const { state, actions } = useConfigurator()
  const [selectedBeverage, setSelectedBeverage] = useState<string>('')
  const [customBeverageText, setCustomBeverageText] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')

  // Solo per Private Label
  if (state.serviceSubType !== ServiceSubType.PRIVATELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Selezione bevande disponibile solo per Private Label
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Step non applicabile per White Label
          </p>
        </div>
      </div>
    )
  }

  // Validation logic enterprise - Used for form validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateSelection = (): boolean => {
    setValidationError('')
    
    if (!selectedBeverage) {
      setValidationError('Seleziona una tipologia di bevanda')
      return false
    }
    
    if (selectedBeverage === 'rd-custom' && !customBeverageText.trim()) {
      setValidationError('Specifica la bevanda che vuoi creare')
      return false
    }
    
    return true
  }

  // Handle beverage selection
  const handleBeverageSelect = (beverageId: string) => {
    setSelectedBeverage(beverageId)
    setValidationError('')
    
    // Clear custom text if not R&D
    if (beverageId !== 'rd-custom') {
      setCustomBeverageText('')
    }
    
    // Update context state
    actions.setBeverageSelection({
      selectedBeverage: beverageId,
      customBeverageText: beverageId === 'rd-custom' ? customBeverageText : '',
      isCustom: beverageId === 'rd-custom'
    })
  }

  // Handle custom beverage text
  const handleCustomTextChange = (text: string) => {
    setCustomBeverageText(text)
    setValidationError('')
    
    // Update context if R&D is selected
    if (selectedBeverage === 'rd-custom') {
      actions.setBeverageSelection({
        selectedBeverage: 'rd-custom',
        customBeverageText: text,
        isCustom: true
      })
    }
  }

  // Handle continue to next step - Future implementation
  // const handleContinue = () => {
  //   if (validateSelection()) {
  //     actions.nextStep()
  //   }
  // }

  return (
    <div className="space-y-6">
      {/* Grid 2x2 Enterprise Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {beverageOptions.map((beverage) => {
          const isSelected = selectedBeverage === beverage.id
          
          return (
            <div
              key={beverage.id}
              onClick={() => handleBeverageSelect(beverage.id)}
              className={`rounded-lg p-6 cursor-pointer transition-all hover:border-gray-400 ${
                isSelected
                  ? 'border-2 border-[#ed6d23] bg-white' 
                  : 'border border-gray-200 bg-white'
              }`}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {beverage.name}
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  {beverage.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom beverage input */}
      {selectedBeverage === 'rd-custom' && (
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-xs text-gray-600 mb-2">
            Descrivi la bevanda che vuoi creare *
          </label>
          <textarea
            value={customBeverageText}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            placeholder="Es. Energy drink con estratti naturali, Kombucha ai frutti rossi, Bevanda isotonica bio..."
            className="w-full px-3 py-2 border-0 resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            rows={2}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              Sii più specifico possibile per un preventivo accurato
            </span>
            <span className="text-xs text-gray-300">
              {customBeverageText.length}/500
            </span>
          </div>
        </div>
      )}

      {/* Cost disclaimer */}
      <p className="text-xs text-gray-500 italic">
        *I costi sono da concordare in base al prodotto
      </p>

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

    </div>
  )
}