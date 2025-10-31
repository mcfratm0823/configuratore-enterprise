'use client'

import { useConfigurator, ServiceSubType } from '@/context'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { stripeService, type OrderData } from '@/services/stripeService'
import { BillingSection } from '@/components/forms/BillingSection'

export function Step6Design() {
  const { state, actions } = useConfigurator()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  // Se non è White Label, mostra placeholder per Private Label
  if (state.serviceSubType !== ServiceSubType.WHITELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Design e template disponibili solo per White Label
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Step non applicabile per Private Label
          </p>
        </div>
      </div>
    )
  }

  // Enhanced form validation
  const isFormValid = (): boolean => {
    const { firstName, lastName, email, phone, company } = state.contactForm
    return !!(firstName?.trim() && lastName?.trim() && email?.trim() && phone?.trim() && company?.trim())
  }

  // Enhanced email validation
  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email.trim())
  }

  // Invio form enterprise White Label
  const handleFormSubmission = async (): Promise<boolean> => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Prepara dati completi per l'API White Label
      const formData = {
        // Dati contatto
        type: 'white-label',
        firstName: state.contactForm.firstName,
        lastName: state.contactForm.lastName,
        email: state.contactForm.email,
        phone: state.contactForm.phone,
        company: state.contactForm.company,
        canCall: state.contactForm.canCall,
        preferredCallTime: state.contactForm.preferredCallTime,
        emailOnly: state.contactForm.emailOnly,
        
        // Dati configurazione White Label
        country: state.country,
        serviceType: state.serviceType,
        serviceSubType: state.serviceSubType,
        canSelection: state.canSelection,
        wantsToContinueQuote: state.wantsToContinueQuote,
        hasDownloadedTemplate: state.hasDownloadedTemplate,
        wantsSample: state.wantsSample,
        
        // Dati fatturazione (se presenti)
        billingData: state.contactForm.billingData || null,
        
        // Meta data
        timestamp: new Date().toISOString(),
        sessionId: state.sessionId,
        pricing: state.pricing
      }

      console.log('📤 Invio form White Label:', formData)
      
      // Simula invio API (sostituire con chiamata reale)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSubmitting(false)
      
      return true
      
    } catch (error: unknown) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'invio della richiesta'
      setSubmitError(errorMessage)
      console.error('📤 White Label form submission error:', error)
      return false
    }
  }

  // Pagamento Stripe per campioni White Label
  const handleStripePayment = async (): Promise<boolean> => {
    setIsPaymentProcessing(true)
    setSubmitError('')
    
    try {
      // Validation specifica per Stripe
      if (!isEmailValid(state.contactForm.email)) {
        throw new Error('Email non valida per il pagamento')
      }

      if (!state.contactForm.firstName || !state.contactForm.lastName) {
        throw new Error('Nome e cognome richiesti per il pagamento')
      }

      // Prepara order data per Stripe
      const orderData: OrderData = {
        email: state.contactForm.email,
        firstName: state.contactForm.firstName,
        lastName: state.contactForm.lastName,
        phone: state.contactForm.phone || '',
        company: state.contactForm.company || '',
        amount: state.pricing.samplePrice, // €50 campione
        currency: 'eur',
        description: 'Campione White Label',
        metadata: {
          serviceType: 'white-label',
          country: state.country,
          sessionId: state.sessionId,
          canSize: state.canSelection?.size.toString() || 'unknown',
          canQuantity: state.canSelection?.quantity.toString() || 'unknown'
        }
      }

      console.log('💳 Avvio pagamento Stripe White Label:', orderData)
      
      // Chiamata Stripe per creare sessione di pagamento
      const result = await stripeService.createCheckoutSession(orderData)
      
      if (result.success && result.url) {
        // Redirect a Stripe Checkout
        window.location.href = result.url
        return true
      } else {
        throw new Error(result.error || 'Errore durante la creazione della sessione di pagamento')
      }
      
    } catch (error: unknown) {
      setIsPaymentProcessing(false)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'elaborazione del pagamento'
      setSubmitError(errorMessage)
      console.error('💳 White Label payment error:', error)
      return false
    }
  }

  // Gestione submit principale enterprise
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    
    // Validation critica
    if (!isFormValid()) {
      setSubmitError('Compila tutti i campi obbligatori')
      return
    }

    if (!isEmailValid(state.contactForm.email)) {
      setSubmitError('Inserisci un indirizzo email valido')
      return
    }
    
    // White Label: gestione campioni
    if (state.wantsSample) {
      // CON campione: Prima pagamento Stripe
      const paymentSuccess = await handleStripePayment()
      if (paymentSuccess) {
        // Form verrà inviato dopo il successo del pagamento (webhook)
        // Redirect gestito da Stripe
        return
      }
    } else {
      // SENZA campione: Invio diretto del form
      const submissionSuccess = await handleFormSubmission()
      if (submissionSuccess) {
        // Redirect a pagina di ringraziamento
        router.push('/thank-you?type=white-label')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Design e Template White Label
        </h3>
        <p className="text-gray-600 text-sm">
          Completa i tuoi dati per ricevere template e file di design personalizzati
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Error Display */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Errore
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{submitError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={state.contactForm.firstName}
              onChange={(e) => actions.setContactForm({ firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ed6d23] focus:border-[#ed6d23]"
              placeholder="Il tuo nome"
            />
          </div>

          {/* Cognome */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Cognome *
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={state.contactForm.lastName}
              onChange={(e) => actions.setContactForm({ lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ed6d23] focus:border-[#ed6d23]"
              placeholder="Il tuo cognome"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={state.contactForm.email}
              onChange={(e) => actions.setContactForm({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ed6d23] focus:border-[#ed6d23]"
              placeholder="la.tua.email@esempio.com"
            />
          </div>

          {/* Telefono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefono *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={state.contactForm.phone}
              onChange={(e) => actions.setContactForm({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ed6d23] focus:border-[#ed6d23]"
              placeholder="+39 123 456 7890"
            />
          </div>

          {/* Azienda */}
          <div className="md:col-span-2">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Azienda *
            </label>
            <input
              id="company"
              type="text"
              required
              value={state.contactForm.company}
              onChange={(e) => actions.setContactForm({ company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ed6d23] focus:border-[#ed6d23]"
              placeholder="Nome della tua azienda"
            />
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Preferenze di Contatto</h4>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="canCall"
                type="checkbox"
                checked={state.contactForm.canCall}
                onChange={(e) => actions.setContactForm({ canCall: e.target.checked })}
                className="h-4 w-4 text-[#ed6d23] focus:ring-[#ed6d23] border-gray-300 rounded"
              />
              <label htmlFor="canCall" className="ml-2 block text-sm text-gray-900">
                Posso essere contattato telefonicamente
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="emailOnly"
                type="checkbox"
                checked={state.contactForm.emailOnly}
                onChange={(e) => actions.setContactForm({ emailOnly: e.target.checked })}
                className="h-4 w-4 text-[#ed6d23] focus:ring-[#ed6d23] border-gray-300 rounded"
              />
              <label htmlFor="emailOnly" className="ml-2 block text-sm text-gray-900">
                Preferisco essere contattato solo via email
              </label>
            </div>

            {state.contactForm.canCall && (
              <div>
                <label htmlFor="preferredCallTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Orario preferito per chiamate
                </label>
                <select
                  id="preferredCallTime"
                  value={state.contactForm.preferredCallTime}
                  onChange={(e) => actions.setContactForm({ preferredCallTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ed6d23] focus:border-[#ed6d23]"
                >
                  <option value="">Seleziona orario</option>
                  <option value="morning">Mattina (9:00 - 12:00)</option>
                  <option value="afternoon">Pomeriggio (14:00 - 17:00)</option>
                  <option value="evening">Sera (17:00 - 19:00)</option>
                  <option value="anytime">Qualsiasi orario</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Billing Section */}
        <BillingSection />

        {/* Submit Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            type="submit"
            disabled={isSubmitting || isPaymentProcessing}
            className="w-full bg-[#ed6d23] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#d55a1a] focus:outline-none focus:ring-2 focus:ring-[#ed6d23] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Invio in corso...' : 
             isPaymentProcessing ? 'Elaborazione pagamento...' :
             state.wantsSample ? 'Procedi al Pagamento (€50)' : 'Invia Richiesta'}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-3">
            {state.wantsSample ? 
              'Procederai al pagamento sicuro per il campione White Label' :
              'Riceverai template e file di design via email entro 24 ore'
            }
          </p>
        </div>
      </form>
    </div>
  )
}