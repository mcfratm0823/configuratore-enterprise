// Shared interfaces for API consistency between webhook and form submission
// Ensures Private Label and White Label data is handled uniformly

// Dati fatturazione facoltativi per conformità fiscale italiana
export interface BillingData {
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

export interface ContactForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  canCall: boolean
  preferredCallTime: string
  emailOnly: boolean
  
  // Dati fatturazione facoltativi
  billingData?: BillingData
}

// White Label specific data
export interface CanSelection {
  quantity: number
  totalPrice: number
}

// Private Label specific data
export interface BeverageSelection {
  selectedBeverage: string
  customBeverageText: string
  isCustom: boolean
}

export interface VolumeFormatSelection {
  volumeLiters: number
  formatMl: number
  totalPieces: number
  cartonsCount: number
  isCustomVolume: boolean
}

export interface PackagingSelection {
  selectedPackaging: string
  packagingType: 'label' | 'digital'
}

// Unified data structure for both White Label and Private Label
export interface UnifiedQuoteData {
  contactForm: ContactForm
  
  // White Label data (null for Private Label)
  canSelection: CanSelection | null
  
  // Private Label data (null for White Label)
  beverageSelection: BeverageSelection | null
  volumeFormatSelection: VolumeFormatSelection | null
  packagingSelection: PackagingSelection | null
  
  // Common fields
  wantsSample: boolean
  country: string
  serviceType: 'white-label' | 'private-label'
  submittedAt: string
  ip: string
  
  // Payment specific (only for webhook)
  paymentCompleted?: boolean
  paymentSessionId?: string
  amountPaid?: number
}

// Type guards for service type detection
export function isWhiteLabel(data: UnifiedQuoteData): data is UnifiedQuoteData & { canSelection: CanSelection } {
  return data.serviceType === 'white-label' && data.canSelection !== null
}

export function isPrivateLabel(data: UnifiedQuoteData): data is UnifiedQuoteData & { 
  beverageSelection: BeverageSelection
  volumeFormatSelection: VolumeFormatSelection
  packagingSelection: PackagingSelection
} {
  return data.serviceType === 'private-label' && 
         data.beverageSelection !== null && 
         data.volumeFormatSelection !== null && 
         data.packagingSelection !== null
}