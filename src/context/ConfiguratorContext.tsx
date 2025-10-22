'use client'

// 🚀 PREMIUM CONFIGURATOR CONTEXT - NEXT.JS ENTERPRISE
// State management enterprise per configuratore White Label/Private Label

import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================================
// TYPES & INTERFACES - ARCHITETTURA PREMIUM
// ============================================================================

export enum ServiceType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  CUSTOM = 'custom'
}

export enum ServiceSubType {
  WHITELABEL = 'whitelabel',
  PRIVATELABEL = 'privatelabel'
}

export interface CanSelection {
  size: number        // ml
  quantity: number    // lattine totali
  cartonsCount: number // cartoni
  totalPrice: number  // prezzo totale
}

export interface PricingData {
  // Calcoli finali quote (solo per preventivo)
  subtotal: number        
  vatAmount: number       
  quotePrice: number      // Prezzo preventivo (White Label)
  
  // Stripe pricing (separato)
  samplePrice: number     // €50 per campione
  stripeTrigger: boolean  // Se attivare Stripe
  
  // Meta data
  vatRate: number
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

export interface ConfiguratorState {
  // Navigation
  currentStep: number
  
  // Configuration
  serviceType: ServiceType | null
  serviceSubType: ServiceSubType | null
  country: string
  wantsSample: boolean
  
  // White Label Can Selection
  canSelection: CanSelection | null
  
  // White Label Continue Flag
  wantsToContinueQuote: boolean
  
  // White Label PDF Downloaded Flag
  hasDownloadedTemplate: boolean
  
  // Private Label Beverage Selection
  beverageSelection: {
    selectedBeverage: string
    customBeverageText: string
    isCustom: boolean
  } | null
  
  // Private Label Volume and Format Selection
  volumeFormatSelection: VolumeFormatSelection | null
  
  // Private Label Packaging Selection
  packagingSelection: PackagingSelection | null
  
  // Form Contact Data
  contactForm: {
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
    canCall: boolean
    preferredCallTime: string
  }
  
  // Payment Status
  paymentCompleted: boolean
  
  // Session Management
  sessionId: string
  
  // Pricing (calcolato automaticamente)
  pricing: PricingData
}

// ============================================================================
// ACTIONS
// ============================================================================

type ConfiguratorAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_SERVICE_TYPE'; payload: ServiceType }
  | { type: 'SET_SERVICE_SUB_TYPE'; payload: ServiceSubType }
  | { type: 'SET_COUNTRY'; payload: string }
  | { type: 'SET_WANTS_SAMPLE'; payload: boolean }
  | { type: 'SET_CAN_SELECTION'; payload: CanSelection }
  | { type: 'SET_WANTS_TO_CONTINUE_QUOTE'; payload: boolean }
  | { type: 'SET_HAS_DOWNLOADED_TEMPLATE'; payload: boolean }
  | { type: 'SET_BEVERAGE_SELECTION'; payload: ConfiguratorState['beverageSelection'] }
  | { type: 'SET_VOLUME_FORMAT_SELECTION'; payload: VolumeFormatSelection }
  | { type: 'SET_PACKAGING_SELECTION'; payload: PackagingSelection }
  | { type: 'SET_CONTACT_FORM'; payload: Partial<ConfiguratorState['contactForm']> }
  | { type: 'SET_PAYMENT_COMPLETED'; payload: boolean }
  | { type: 'RESET_STATE' }

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ConfiguratorState = {
  currentStep: 1,
  serviceType: null,
  serviceSubType: null,
  country: '',
  wantsSample: false,
  canSelection: null,
  wantsToContinueQuote: false,
  hasDownloadedTemplate: false,
  beverageSelection: null,
  volumeFormatSelection: null,
  packagingSelection: null,
  contactForm: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    canCall: false,
    preferredCallTime: ''
  },
  paymentCompleted: false,
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  pricing: {
    subtotal: 0,
    vatAmount: 0,
    quotePrice: 0,
    samplePrice: 50, // €50 fisso per campioni
    stripeTrigger: false,
    vatRate: 0.22 // 22% IVA
  }
}

// ============================================================================
// REDUCER
// ============================================================================

function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction): ConfiguratorState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
      
    case 'SET_SERVICE_TYPE':
      return { ...state, serviceType: action.payload }
      
    case 'SET_SERVICE_SUB_TYPE':
      // Auto-set serviceType when serviceSubType is selected
      const serviceType = action.payload === ServiceSubType.WHITELABEL ? ServiceType.STANDARD : ServiceType.CUSTOM
      return { 
        ...state, 
        serviceSubType: action.payload,
        serviceType
      }
      
    case 'SET_COUNTRY':
      return { ...state, country: action.payload }
      
    case 'SET_WANTS_SAMPLE':
      return { 
        ...state, 
        wantsSample: action.payload,
        pricing: {
          ...state.pricing,
          stripeTrigger: action.payload
        }
      }
      
    case 'SET_CAN_SELECTION':
      return { 
        ...state, 
        canSelection: action.payload,
        pricing: {
          ...state.pricing,
          subtotal: action.payload.totalPrice,
          vatAmount: action.payload.totalPrice * state.pricing.vatRate,
          quotePrice: action.payload.totalPrice + (action.payload.totalPrice * state.pricing.vatRate) + 18 // +18€ pallet
        }
      }
      
    case 'SET_WANTS_TO_CONTINUE_QUOTE':
      return { ...state, wantsToContinueQuote: action.payload }
      
    case 'SET_HAS_DOWNLOADED_TEMPLATE':
      return { ...state, hasDownloadedTemplate: action.payload }
      
    case 'SET_BEVERAGE_SELECTION':
      return { ...state, beverageSelection: action.payload }
      
    case 'SET_VOLUME_FORMAT_SELECTION':
      return { ...state, volumeFormatSelection: action.payload }
      
    case 'SET_PACKAGING_SELECTION':
      return { ...state, packagingSelection: action.payload }
      
    case 'SET_CONTACT_FORM':
      return { 
        ...state, 
        contactForm: { ...state.contactForm, ...action.payload }
      }
      
    case 'SET_PAYMENT_COMPLETED':
      return { ...state, paymentCompleted: action.payload }
      
    case 'RESET_STATE':
      return initialState
      
    default:
      return state
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ConfiguratorContextType {
  state: ConfiguratorState
  actions: {
    // Navigation actions
    startConfigurator: () => void
    goToLanding: () => void
    
    // State actions
    setCurrentStep: (step: number) => void
    setServiceType: (type: ServiceType) => void
    setServiceSubType: (subType: ServiceSubType) => void
    setCountry: (country: string) => void
    setWantsSample: (wants: boolean) => void
    setCanSelection: (selection: CanSelection) => void
    setWantsToContinueQuote: (wants: boolean) => void
    setHasDownloadedTemplate: (downloaded: boolean) => void
    setBeverageSelection: (selection: ConfiguratorState['beverageSelection']) => void
    setVolumeFormatSelection: (selection: VolumeFormatSelection) => void
    setPackagingSelection: (selection: PackagingSelection) => void
    setContactForm: (formData: Partial<ConfiguratorState['contactForm']>) => void
    setPaymentCompleted: (completed: boolean) => void
    nextStep: () => void
    resetState: () => void
  }
}

const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface ConfiguratorProviderProps {
  children: ReactNode
}

export function ConfiguratorProvider({ children }: ConfiguratorProviderProps) {
  const [state, dispatch] = useReducer(configuratorReducer, initialState)
  const router = useRouter()

  const actions = {
    // Navigation actions enterprise
    startConfigurator: () => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 1 })
      router.push('/configurator')
    },
    goToLanding: () => {
      router.push('/')
    },
    
    // State actions
    setCurrentStep: (step: number) => dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
    setServiceType: (type: ServiceType) => dispatch({ type: 'SET_SERVICE_TYPE', payload: type }),
    setServiceSubType: (subType: ServiceSubType) => dispatch({ type: 'SET_SERVICE_SUB_TYPE', payload: subType }),
    setCountry: (country: string) => dispatch({ type: 'SET_COUNTRY', payload: country }),
    setWantsSample: (wants: boolean) => dispatch({ type: 'SET_WANTS_SAMPLE', payload: wants }),
    setCanSelection: (selection: CanSelection) => dispatch({ type: 'SET_CAN_SELECTION', payload: selection }),
    setWantsToContinueQuote: (wants: boolean) => dispatch({ type: 'SET_WANTS_TO_CONTINUE_QUOTE', payload: wants }),
    setHasDownloadedTemplate: (downloaded: boolean) => dispatch({ type: 'SET_HAS_DOWNLOADED_TEMPLATE', payload: downloaded }),
    setBeverageSelection: (selection: ConfiguratorState['beverageSelection']) => dispatch({ type: 'SET_BEVERAGE_SELECTION', payload: selection }),
    setVolumeFormatSelection: (selection: VolumeFormatSelection) => dispatch({ type: 'SET_VOLUME_FORMAT_SELECTION', payload: selection }),
    setPackagingSelection: (selection: PackagingSelection) => dispatch({ type: 'SET_PACKAGING_SELECTION', payload: selection }),
    setContactForm: (formData: Partial<ConfiguratorState['contactForm']>) => dispatch({ type: 'SET_CONTACT_FORM', payload: formData }),
    setPaymentCompleted: (completed: boolean) => dispatch({ type: 'SET_PAYMENT_COMPLETED', payload: completed }),
    nextStep: () => dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 }),
    resetState: () => dispatch({ type: 'RESET_STATE' })
  }

  return (
    <ConfiguratorContext.Provider value={{ state, actions }}>
      {children}
    </ConfiguratorContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useConfigurator() {
  const context = useContext(ConfiguratorContext)
  if (context === undefined) {
    throw new Error('useConfigurator must be used within a ConfiguratorProvider')
  }
  return context
}

// ============================================================================
// EXPORTS - Types exported inline where needed
// ============================================================================