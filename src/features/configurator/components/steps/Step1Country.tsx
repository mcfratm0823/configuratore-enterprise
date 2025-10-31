'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useConfigurator } from '@/context'
import { useAutoFocus, focusVisibleClasses } from '@/utils/focusManagement'
import { validateSearchTerm, sanitizeInput } from '@/utils/security'
import { useMemoizedCountrySearch, useDebounce } from '@/utils/performance'

export function Step1Country() {
  const { state, actions } = useConfigurator()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchError, setSearchError] = useState('')
  
  // Auto-focus search input when component loads  
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 200)
    return () => clearTimeout(timer)
  }, [])
  
  // Performance optimization: debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 200)

  // Secure search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchError('')
    
    const validation = validateSearchTerm(value)
    
    if (!validation.isValid) {
      setSearchError(validation.errors[0] || 'Termine di ricerca non valido')
      return
    }
    
    setSearchTerm(validation.sanitized)
  }, [])

  const countries = [
    // Europa
    { id: 'austria', label: 'Austria', flag: '🇦🇹' },
    { id: 'belgium', label: 'Belgio', flag: '🇧🇪' },
    { id: 'bulgaria', label: 'Bulgaria', flag: '🇧🇬' },
    { id: 'croatia', label: 'Croazia', flag: '🇭🇷' },
    { id: 'cyprus', label: 'Cipro', flag: '🇨🇾' },
    { id: 'czech', label: 'Repubblica Ceca', flag: '🇨🇿' },
    { id: 'denmark', label: 'Danimarca', flag: '🇩🇰' },
    { id: 'estonia', label: 'Estonia', flag: '🇪🇪' },
    { id: 'finland', label: 'Finlandia', flag: '🇫🇮' },
    { id: 'france', label: 'Francia', flag: '🇫🇷' },
    { id: 'germany', label: 'Germania', flag: '🇩🇪' },
    { id: 'greece', label: 'Grecia', flag: '🇬🇷' },
    { id: 'hungary', label: 'Ungheria', flag: '🇭🇺' },
    { id: 'ireland', label: 'Irlanda', flag: '🇮🇪' },
    { id: 'italy', label: 'Italia', flag: '🇮🇹' },
    { id: 'latvia', label: 'Lettonia', flag: '🇱🇻' },
    { id: 'lithuania', label: 'Lituania', flag: '🇱🇹' },
    { id: 'luxembourg', label: 'Lussemburgo', flag: '🇱🇺' },
    { id: 'malta', label: 'Malta', flag: '🇲🇹' },
    { id: 'netherlands', label: 'Paesi Bassi', flag: '🇳🇱' },
    { id: 'poland', label: 'Polonia', flag: '🇵🇱' },
    { id: 'portugal', label: 'Portogallo', flag: '🇵🇹' },
    { id: 'romania', label: 'Romania', flag: '🇷🇴' },
    { id: 'slovakia', label: 'Slovacchia', flag: '🇸🇰' },
    { id: 'slovenia', label: 'Slovenia', flag: '🇸🇮' },
    { id: 'spain', label: 'Spagna', flag: '🇪🇸' },
    { id: 'sweden', label: 'Svezia', flag: '🇸🇪' },
    { id: 'switzerland', label: 'Svizzera', flag: '🇨🇭' },
    { id: 'uk', label: 'Regno Unito', flag: '🇬🇧' },
    { id: 'norway', label: 'Norvegia', flag: '🇳🇴' },
    { id: 'iceland', label: 'Islanda', flag: '🇮🇸' },
    
    // Nord America
    { id: 'usa', label: 'Stati Uniti', flag: '🇺🇸' },
    { id: 'canada', label: 'Canada', flag: '🇨🇦' },
    { id: 'mexico', label: 'Messico', flag: '🇲🇽' },
    
    // Asia
    { id: 'japan', label: 'Giappone', flag: '🇯🇵' },
    { id: 'china', label: 'Cina', flag: '🇨🇳' },
    { id: 'korea', label: 'Corea del Sud', flag: '🇰🇷' },
    { id: 'singapore', label: 'Singapore', flag: '🇸🇬' },
    { id: 'hongkong', label: 'Hong Kong', flag: '🇭🇰' },
    { id: 'india', label: 'India', flag: '🇮🇳' },
    { id: 'thailand', label: 'Tailandia', flag: '🇹🇭' },
    { id: 'malaysia', label: 'Malesia', flag: '🇲🇾' },
    { id: 'indonesia', label: 'Indonesia', flag: '🇮🇩' },
    { id: 'philippines', label: 'Filippine', flag: '🇵🇭' },
    { id: 'vietnam', label: 'Vietnam', flag: '🇻🇳' },
    
    // Oceania
    { id: 'australia', label: 'Australia', flag: '🇦🇺' },
    { id: 'newzealand', label: 'Nuova Zelanda', flag: '🇳🇿' },
    
    // Sud America
    { id: 'brazil', label: 'Brasile', flag: '🇧🇷' },
    { id: 'argentina', label: 'Argentina', flag: '🇦🇷' },
    { id: 'chile', label: 'Cile', flag: '🇨🇱' },
    { id: 'colombia', label: 'Colombia', flag: '🇨🇴' },
    { id: 'peru', label: 'Perù', flag: '🇵🇪' },
    
    // Africa & Medio Oriente
    { id: 'southafrica', label: 'Sudafrica', flag: '🇿🇦' },
    { id: 'egypt', label: 'Egitto', flag: '🇪🇬' },
    { id: 'uae', label: 'Emirati Arabi', flag: '🇦🇪' },
    { id: 'saudi', label: 'Arabia Saudita', flag: '🇸🇦' },
    { id: 'israel', label: 'Israele', flag: '🇮🇱' },
    { id: 'turkey', label: 'Turchia', flag: '🇹🇷' }
  ]

  // Paesi più importanti/comuni sempre visibili
  const popularCountries = [
    { id: 'italy', label: 'Italia', flag: '🇮🇹' },
    { id: 'germany', label: 'Germania', flag: '🇩🇪' },
    { id: 'france', label: 'Francia', flag: '🇫🇷' },
    { id: 'spain', label: 'Spagna', flag: '🇪🇸' },
    { id: 'uk', label: 'Regno Unito', flag: '🇬🇧' },
    { id: 'usa', label: 'Stati Uniti', flag: '🇺🇸' },
    { id: 'netherlands', label: 'Paesi Bassi', flag: '🇳🇱' },
    { id: 'switzerland', label: 'Svizzera', flag: '🇨🇭' },
    { id: 'austria', label: 'Austria', flag: '🇦🇹' },
    { id: 'belgium', label: 'Belgio', flag: '🇧🇪' },
    { id: 'canada', label: 'Canada', flag: '🇨🇦' },
    { id: 'australia', label: 'Australia', flag: '🇦🇺' }
  ]

  // Performance optimized country filtering with memoization
  const displayCountries = useMemoizedCountrySearch(
    debouncedSearchTerm ? countries : popularCountries, 
    debouncedSearchTerm
  )

  const handleCountrySelect = (countryId: string) => {
    actions.setCountry(countryId)
  }

  const handleSampleToggle = () => {
    actions.setWantsSample(!state.wantsSample)
  }

  return (
    <div className="space-y-4">
        {/* Search Bar */}
        <div className="max-w-md">
          <label htmlFor="country-search" className="sr-only">
            Cerca paesi per nome
          </label>
          <input
            ref={searchInputRef}
            id="country-search"
            type="text"
            placeholder="Cerca paesi..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`w-full px-4 py-2 border-b focus:outline-none bg-transparent text-gray-900 placeholder-gray-500 ${
              searchError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#ed6d23]'
            }`}
            aria-label="Cerca paesi per nome"
            role="searchbox"
            aria-invalid={!!searchError}
            aria-describedby={`country-search-help ${searchError ? 'search-error' : ''}`}
          />
          {searchError && (
            <p id="search-error" className="text-xs text-red-600 mt-1" role="alert">
              {searchError}
            </p>
          )}
          <div id="country-search-help" className="sr-only">
            Inserisci il nome di un paese per filtrare la lista
          </div>
        </div>

        {/* Country Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" role="radiogroup" aria-labelledby="country-selection-heading">
          <div id="country-selection-heading" className="sr-only">Seleziona il paese di destinazione</div>
          {displayCountries.map((country) => (
            <div
              key={country.id}
              className={`cursor-pointer transition-all hover:shadow-md md:hover:scale-105 text-center p-3 rounded-lg bg-white ${
                state.country === country.id 
                  ? 'border-2 border-[#ed6d23] md:scale-105' 
                  : 'border border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => handleCountrySelect(country.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCountrySelect(country.id)
                }
              }}
              tabIndex={0}
              role="radio"
              aria-checked={state.country === country.id}
              aria-label={`Seleziona ${country.label} come paese di destinazione`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl" aria-hidden="true">{country.flag}</span>
              </div>
              <h4 className="font-medium text-gray-900 text-xs leading-tight">
                {country.label}
              </h4>
            </div>
          ))}
        </div>

        {/* Sample Request Option */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSampleToggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSampleToggle()
                }
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                state.wantsSample ? 'bg-[#ed6d23]' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={state.wantsSample}
              aria-labelledby="sample-toggle-label"
              aria-describedby="sample-toggle-description"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  state.wantsSample ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex-1">
              <h4 id="sample-toggle-label" className="text-sm font-medium text-gray-900">
                Richiedi un Campione
              </h4>
              <p id="sample-toggle-description" className="text-gray-500 text-xs mt-1">
                Campione fisico per €50
              </p>
            </div>
          </div>
          
          {state.wantsSample && (
            <div className="mt-2 text-xs text-gray-500">
              Il pagamento sarà elaborato tramite Stripe alla fine della configurazione
            </div>
          )}
        </div>
    </div>
  )
}