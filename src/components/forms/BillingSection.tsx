'use client'

import React, { useState, useCallback } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import {
  validateVATNumber,
  validateFiscalCode,
  validateCompany,
  validateAddress,
  validateCityOrProvince,
  validatePostalCode,
  validateSDI,
  validatePEC,
  validateBillingData,
  sanitizeInput,
  ValidationStateManager,
  type BillingDataValidation
} from '@/utils/security'

interface BillingData {
  // Dati aziendali
  vatNumber?: string                    // Partita IVA
  fiscalCode?: string                   // Codice fiscale
  legalName?: string                    // Denominazione sociale
  
  // Indirizzo fatturazione
  billingAddress?: string               // Via/indirizzo
  billingCity?: string                  // Città
  billingPostalCode?: string           // CAP
  billingProvince?: string             // Provincia
  
  // Fatturazione elettronica
  sdi?: string                         // Codice univoco SDI
  pec?: string                         // Email PEC
}

interface BillingSectionProps {
  billingData?: BillingData
  onBillingDataChange: (data: BillingData) => void
  disabled?: boolean
}

export function BillingSection({ 
  billingData = {}, 
  onBillingDataChange, 
  disabled = false 
}: BillingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [validationManager] = useState(() => new ValidationStateManager())
  const [fieldValidationState, setFieldValidationState] = useState<Record<string, { isValid: boolean; errors: string[] }>>({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formValidation, setFormValidation] = useState<BillingDataValidation | null>(null)

  // Real-time validation handler
  const handleFieldValidation = useCallback((field: keyof BillingData, value: string, country: string = 'IT') => {
    let validator: (value: string) => { isValid: boolean; sanitized: string; errors: string[] }
    
    switch (field) {
      case 'vatNumber':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            const isValid = validateVATNumber(sanitized, country)
            if (!isValid) errors.push('Formato Partita IVA non valido')
          }
          return { isValid: errors.length === 0, sanitized, errors }
        }
        break
      case 'fiscalCode':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim() && country.toUpperCase() === 'IT') {
            const isValid = validateFiscalCode(sanitized)
            if (!isValid) errors.push('Formato Codice Fiscale non valido')
          }
          return { isValid: errors.length === 0, sanitized: sanitized.toUpperCase(), errors }
        }
        break
      case 'legalName':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            if (sanitized.length < 2) errors.push('Minimo 2 caratteri')
            if (sanitized.length > 200) errors.push('Massimo 200 caratteri')
            if (!validateCompany(sanitized)) errors.push('Caratteri non validi')
          }
          return { isValid: errors.length === 0, sanitized, errors }
        }
        break
      case 'billingAddress':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            if (!validateAddress(sanitized)) errors.push('Formato indirizzo non valido')
          }
          return { isValid: errors.length === 0, sanitized, errors }
        }
        break
      case 'billingCity':
      case 'billingProvince':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            if (!validateCityOrProvince(sanitized)) errors.push('Formato non valido')
          }
          return { isValid: errors.length === 0, sanitized: field === 'billingProvince' ? sanitized.toUpperCase() : sanitized, errors }
        }
        break
      case 'billingPostalCode':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            if (!validatePostalCode(sanitized, country)) errors.push('Formato CAP non valido')
          }
          return { isValid: errors.length === 0, sanitized, errors }
        }
        break
      case 'sdi':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            if (!validateSDI(sanitized)) errors.push('Codice SDI non valido (7 caratteri alfanumerici)')
          }
          return { isValid: errors.length === 0, sanitized: sanitized.toUpperCase(), errors }
        }
        break
      case 'pec':
        validator = (val) => {
          const errors: string[] = []
          const sanitized = sanitizeInput(val)
          if (sanitized.trim()) {
            if (!validatePEC(sanitized)) errors.push('Formato email PEC non valido')
          }
          return { isValid: errors.length === 0, sanitized: sanitized.toLowerCase(), errors }
        }
        break
      default:
        return { isValid: true, sanitized: value, errors: [] }
    }
    
    const sanitized = validationManager.validateField(field, value, validator)
    const fieldState = validationManager.getFieldState(field)
    
    if (fieldState) {
      setFieldValidationState(prev => ({
        ...prev,
        [field]: fieldState
      }))
    }
    
    return sanitized
  }, [validationManager])

  const handleFieldChange = (field: keyof BillingData, value: string) => {
    const sanitized = handleFieldValidation(field, value)
    
    const updatedData = {
      ...billingData,
      [field]: sanitized || undefined // Convert empty strings to undefined
    }
    onBillingDataChange(updatedData)
    
    // Validate entire billing data for form validation state
    const validation = validateBillingData(updatedData, 'IT')
    setFormValidation(validation)
  }


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header Section */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">
            Dati Fatturazione
          </h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Opzionali
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </div>

      <p className="text-sm text-gray-600 mt-2">
        Questi dati verranno utilizzati per l&apos;emissione della fattura
      </p>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Dati Aziendali */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Dati Aziendali</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partita IVA
                </label>
                <input
                  type="text"
                  placeholder="IT01234567890"
                  value={billingData.vatNumber || ''}
                  onChange={(e) => handleFieldChange('vatNumber', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.vatNumber?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.vatNumber?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.vatNumber?.errors?.length > 0}
                  aria-describedby={fieldValidationState.vatNumber?.errors?.length > 0 ? 'vatNumber-error' : undefined}
                />
                {fieldValidationState.vatNumber?.errors?.length > 0 && (
                  <p id="vatNumber-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.vatNumber.errors[0]}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codice Fiscale
                </label>
                <input
                  type="text"
                  placeholder="RSSMRA80A01H501Z"
                  value={billingData.fiscalCode || ''}
                  onChange={(e) => handleFieldChange('fiscalCode', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.fiscalCode?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.fiscalCode?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.fiscalCode?.errors?.length > 0}
                  aria-describedby={fieldValidationState.fiscalCode?.errors?.length > 0 ? 'fiscalCode-error' : undefined}
                />
                {fieldValidationState.fiscalCode?.errors?.length > 0 && (
                  <p id="fiscalCode-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.fiscalCode.errors[0]}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denominazione Sociale
                </label>
                <input
                  type="text"
                  placeholder="Nome completo dell'azienda per la fattura"
                  value={billingData.legalName || ''}
                  onChange={(e) => handleFieldChange('legalName', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.legalName?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.legalName?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.legalName?.errors?.length > 0}
                  aria-describedby={fieldValidationState.legalName?.errors?.length > 0 ? 'legalName-error' : undefined}
                />
                {fieldValidationState.legalName?.errors?.length > 0 && (
                  <p id="legalName-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.legalName.errors[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Indirizzo Fatturazione */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Indirizzo Fatturazione</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indirizzo
                </label>
                <input
                  type="text"
                  placeholder="Via, Numero civico"
                  value={billingData.billingAddress || ''}
                  onChange={(e) => handleFieldChange('billingAddress', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.billingAddress?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.billingAddress?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.billingAddress?.errors?.length > 0}
                  aria-describedby={fieldValidationState.billingAddress?.errors?.length > 0 ? 'billingAddress-error' : undefined}
                />
                {fieldValidationState.billingAddress?.errors?.length > 0 && (
                  <p id="billingAddress-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.billingAddress.errors[0]}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Città
                </label>
                <input
                  type="text"
                  placeholder="Milano"
                  value={billingData.billingCity || ''}
                  onChange={(e) => handleFieldChange('billingCity', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.billingCity?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.billingCity?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.billingCity?.errors?.length > 0}
                  aria-describedby={fieldValidationState.billingCity?.errors?.length > 0 ? 'billingCity-error' : undefined}
                />
                {fieldValidationState.billingCity?.errors?.length > 0 && (
                  <p id="billingCity-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.billingCity.errors[0]}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAP
                </label>
                <input
                  type="text"
                  placeholder="20100"
                  value={billingData.billingPostalCode || ''}
                  onChange={(e) => handleFieldChange('billingPostalCode', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.billingPostalCode?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.billingPostalCode?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.billingPostalCode?.errors?.length > 0}
                  aria-describedby={fieldValidationState.billingPostalCode?.errors?.length > 0 ? 'billingPostalCode-error' : undefined}
                />
                {fieldValidationState.billingPostalCode?.errors?.length > 0 && (
                  <p id="billingPostalCode-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.billingPostalCode.errors[0]}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  placeholder="MI"
                  value={billingData.billingProvince || ''}
                  onChange={(e) => handleFieldChange('billingProvince', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.billingProvince?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.billingProvince?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.billingProvince?.errors?.length > 0}
                  aria-describedby={fieldValidationState.billingProvince?.errors?.length > 0 ? 'billingProvince-error' : undefined}
                />
                {fieldValidationState.billingProvince?.errors?.length > 0 && (
                  <p id="billingProvince-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.billingProvince.errors[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fatturazione Elettronica */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Fatturazione Elettronica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codice Univoco (SDI)
                </label>
                <input
                  type="text"
                  placeholder="ABCDEFG"
                  value={billingData.sdi || ''}
                  onChange={(e) => handleFieldChange('sdi', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.sdi?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.sdi?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.sdi?.errors?.length > 0}
                  aria-describedby={fieldValidationState.sdi?.errors?.length > 0 ? 'sdi-error' : undefined}
                />
                {fieldValidationState.sdi?.errors?.length > 0 && (
                  <p id="sdi-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.sdi.errors[0]}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Codice destinatario per fatturazione elettronica
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email PEC
                </label>
                <input
                  type="email"
                  placeholder="fatture@pec.azienda.it"
                  value={billingData.pec || ''}
                  onChange={(e) => handleFieldChange('pec', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                    fieldValidationState.pec?.errors?.length 
                      ? 'border-red-300 focus:ring-red-500' 
                      : fieldValidationState.pec?.isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-[#ed6d23]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-invalid={fieldValidationState.pec?.errors?.length > 0}
                  aria-describedby={fieldValidationState.pec?.errors?.length > 0 ? 'pec-error' : undefined}
                />
                {fieldValidationState.pec?.errors?.length > 0 && (
                  <p id="pec-error" className="text-xs text-red-600 mt-1" role="alert">
                    {fieldValidationState.pec.errors[0]}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Solo se non hai codice SDI
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}