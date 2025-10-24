'use client'

import { useConfigurator, ServiceSubType } from '@/context'
import { useState } from 'react'

// Enterprise volume and format configuration types
interface VolumeOption {
  id: string
  liters: number
  label: string
  isCustom: boolean
}

interface FormatOption {
  id: string
  ml: number
  label: string
}

const volumeOptions: VolumeOption[] = [
  {
    id: 'volume-1000',
    liters: 1000,
    label: '1.000 litri',
    isCustom: false
  },
  {
    id: 'volume-5000',
    liters: 5000,
    label: '5.000 litri',
    isCustom: false
  },
  {
    id: 'volume-10000',
    liters: 10000,
    label: '10.000 litri',
    isCustom: false
  },
  {
    id: 'volume-custom',
    liters: 0,
    label: 'Altro',
    isCustom: true
  }
]

const formatOptions: FormatOption[] = [
  {
    id: 'format-150',
    ml: 150,
    label: '150ml'
  },
  {
    id: 'format-200',
    ml: 200,
    label: '200ml'
  },
  {
    id: 'format-250',
    ml: 250,
    label: '250ml'
  }
]

export function Step4VolumeFormat() {
  const { state, actions } = useConfigurator()
  const [validationError, setValidationError] = useState<string>('')

  // Solo per Private Label
  if (state.serviceSubType !== ServiceSubType.PRIVATELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Volumi e formati disponibili solo per Private Label
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Step non applicabile per White Label
          </p>
        </div>
      </div>
    )
  }

  // Calculate production data
  const calculateProduction = () => {
    if (!state.volumeFormatSelection?.volumeLiters || !state.volumeFormatSelection?.formatMl) {
      return null
    }

    return {
      totalLiters: state.volumeFormatSelection.volumeLiters,
      formatMl: state.volumeFormatSelection.formatMl,
      totalPieces: state.volumeFormatSelection.totalPieces,
      cartonsCount: state.volumeFormatSelection.cartonsCount
    }
  }

  // Validation logic - Used for form validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateSelection = (): boolean => {
    setValidationError('')
    
    if (!state.volumeFormatSelection?.volumeLiters) {
      setValidationError('Seleziona il volume di produzione')
      return false
    }
    
    if (!state.volumeFormatSelection?.formatMl) {
      setValidationError('Seleziona il formato lattina')
      return false
    }

    if (state.volumeFormatSelection.isCustomVolume) {
      if (state.volumeFormatSelection.volumeLiters < 1000) {
        setValidationError('Il volume minimo è 1000 litri')
        return false
      }
    }
    
    return true
  }

  // Handle volume selection
  const handleVolumeSelect = (volumeId: string) => {
    setValidationError('')
    
    const volumeOption = volumeOptions.find(v => v.id === volumeId)
    if (!volumeOption) return
    
    // Get current format selection
    const currentFormatMl = state.volumeFormatSelection?.formatMl || 200
    
    if (volumeOption.isCustom) {
      // Custom volume - set as custom but keep existing custom liters if any
      const existingCustomLiters = state.volumeFormatSelection?.isCustomVolume 
        ? state.volumeFormatSelection.volumeLiters 
        : 1000
      
      const totalPieces = Math.floor((existingCustomLiters * 1000) / currentFormatMl)
      const cartonsCount = Math.ceil(totalPieces / 24)
      
      actions.setVolumeFormatSelection({
        volumeLiters: existingCustomLiters,
        formatMl: currentFormatMl,
        totalPieces,
        cartonsCount,
        isCustomVolume: true
      })
    } else {
      // Predefined volume
      const totalPieces = Math.floor((volumeOption.liters * 1000) / currentFormatMl)
      const cartonsCount = Math.ceil(totalPieces / 24)
      
      actions.setVolumeFormatSelection({
        volumeLiters: volumeOption.liters,
        formatMl: currentFormatMl,
        totalPieces,
        cartonsCount,
        isCustomVolume: false
      })
    }
  }

  // Handle format selection
  const handleFormatSelect = (formatId: string) => {
    setValidationError('')
    
    const formatOption = formatOptions.find(f => f.id === formatId)
    if (!formatOption) return
    
    // Get current volume selection or default
    const currentVolumeLiters = state.volumeFormatSelection?.volumeLiters || 1000
    const isCustomVolume = state.volumeFormatSelection?.isCustomVolume || false
    
    const totalPieces = Math.floor((currentVolumeLiters * 1000) / formatOption.ml)
    const cartonsCount = Math.ceil(totalPieces / 24)
    
    actions.setVolumeFormatSelection({
      volumeLiters: currentVolumeLiters,
      formatMl: formatOption.ml,
      totalPieces,
      cartonsCount,
      isCustomVolume
    })
  }

  // Handle custom liters change
  const handleCustomLitersChange = (value: string) => {
    setValidationError('')
    
    const totalLiters = parseInt(value) || 0
    if (totalLiters <= 0) return
    
    // Get current format selection or default
    const currentFormatMl = state.volumeFormatSelection?.formatMl || 200
    
    const totalPieces = Math.floor((totalLiters * 1000) / currentFormatMl)
    const cartonsCount = Math.ceil(totalPieces / 24)
    
    actions.setVolumeFormatSelection({
      volumeLiters: totalLiters,
      formatMl: currentFormatMl,
      totalPieces,
      cartonsCount,
      isCustomVolume: true
    })
  }

  const productionData = calculateProduction()

  return (
    <div className="space-y-6">
      {/* Volume Selection */}
      <div>
        <h4 className="text-xs text-gray-600 mb-3 uppercase tracking-wide">Volume di produzione</h4>
        <div className="flex flex-wrap gap-2">
          {volumeOptions.map((volume) => {
            const isSelected = state.volumeFormatSelection?.isCustomVolume 
              ? (volume.isCustom && state.volumeFormatSelection?.volumeLiters > 0)
              : (state.volumeFormatSelection?.volumeLiters === volume.liters)
            
            return (
              <button
                key={volume.id}
                onClick={() => handleVolumeSelect(volume.id)}
                className={`px-4 py-2 rounded-full transition-all text-sm font-medium border ${
                  isSelected
                    ? 'border-2 border-[#ed6d23] bg-white text-gray-900' 
                    : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-gray-400'
                }`}
              >
                {volume.label}
                {volume.isCustom && (
                  <span className={`ml-1 text-xs ${isSelected ? 'text-orange-200' : 'text-gray-500'}`}>
                    (min. 1000L)
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Custom volume input */}
        {state.volumeFormatSelection?.isCustomVolume && (
          <div className="mt-3">
            <input
              type="number"
              value={state.volumeFormatSelection?.volumeLiters || ''}
              onChange={(e) => handleCustomLitersChange(e.target.value)}
              placeholder="Inserisci litri (min. 1000)"
              min="1000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-[#ed6d23] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Format Selection */}
      <div>
        <h4 className="text-xs text-gray-600 mb-3 uppercase tracking-wide">Formato lattina</h4>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((format) => {
            const isSelected = state.volumeFormatSelection?.formatMl === format.ml
            
            return (
              <button
                key={format.id}
                onClick={() => handleFormatSelect(format.id)}
                className={`px-4 py-2 rounded-full transition-all text-sm font-medium border ${
                  isSelected
                    ? 'border-2 border-[#ed6d23] bg-white text-gray-900' 
                    : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-gray-400'
                }`}
              >
                {format.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Production calculation result */}
      {productionData && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-700 space-y-1">
            <div className="flex justify-between items-center">
              <span>{productionData.totalLiters.toLocaleString()} litri × {productionData.formatMl}ml</span>
              <span className="font-medium">{productionData.totalPieces.toLocaleString()} pezzi</span>
            </div>
            <div className="text-xs text-gray-500">
              Circa {productionData.cartonsCount.toLocaleString()} cartoni da 24 lattine
            </div>
          </div>
        </div>
      )}

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