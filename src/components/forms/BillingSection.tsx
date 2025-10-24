'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

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

  const handleFieldChange = (field: keyof BillingData, value: string) => {
    const updatedData = {
      ...billingData,
      [field]: value || undefined // Convert empty strings to undefined
    }
    onBillingDataChange(updatedData)
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                />
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