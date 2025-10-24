'use client'

import { useConfigurator, ServiceSubType } from '@/context'
import { useState } from 'react'
import { stripeService, type OrderData } from '@/services/stripeService'
import { BillingSection } from '@/components/forms/BillingSection'

export function Step6Design() {
  const { state, actions } = useConfigurator()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  // Se non è White Label, mostra placeholder per Private Label
  if (state.serviceSubType !== ServiceSubType.WHITELABEL) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-6">
          Design brief per il tuo progetto Private Label
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

  // Template download è ora opzionale - non blocca più la progressione

  // Validation form enterprise
  const isFormValid = (): boolean => {
    const { firstName, lastName, email, phone, company } = state.contactForm
    return Boolean(
      firstName?.trim() && 
      lastName?.trim() && 
      email?.trim() && 
      phone?.trim() && 
      company?.trim()
    )
  }

  // Email validation enterprise
  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Pagamento Stripe enterprise
  const handleStripePayment = async (): Promise<boolean> => {
    setIsPaymentProcessing(true)
    setSubmitError('')
    
    try {
      // Validation specifica per Stripe
      if (!isEmailValid(state.contactForm.email)) {
        throw new Error('Email non valida per il pagamento')
      }

      // Dati ordine completi per Stripe + Webhook
      const orderData: OrderData = {
        customerEmail: state.contactForm.email.trim(),
        customerName: `${state.contactForm.firstName.trim()} ${state.contactForm.lastName.trim()}`,
        quantity: 1, // Un campione
        totalPrice: 50, // €50 fisso
        sessionId: state.sessionId,
        createdAt: new Date(),
        customerData: {
          contactForm: state.contactForm,
          canSelection: state.canSelection,
          country: state.country,
          sessionId: state.sessionId,
          ip: 'client-side' // Sarà aggiornato nel webhook
        }
      }
      
      // Crea checkout session
      const checkoutSession = await stripeService.createCheckoutSession(orderData)
      
      if (!checkoutSession) {
        throw new Error('Impossibile creare la sessione di pagamento Stripe')
      }
      
      // Redirect a Stripe Checkout
      await stripeService.redirectToCheckout(checkoutSession.id, checkoutSession.url)
      
      // Se arriviamo qui, qualcosa è andato storto (dovrebbe aver fatto redirect)
      return false
      
    } catch (error: unknown) {
      setIsPaymentProcessing(false)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'elaborazione del pagamento'
      setSubmitError(errorMessage)
      console.error('💳 Payment error:', error)
      return false
    }
  }

  // Invio form enterprise
  const handleFormSubmission = async (): Promise<boolean> => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Prepara dati completi per l'API
      const formData = {
        // Dati contatto
        contactForm: state.contactForm,
        
        // Dati configurazione
        country: state.country,
        canSelection: state.canSelection,
        wantsSample: state.wantsSample,
        hasDownloadedTemplate: state.hasDownloadedTemplate,
        
        // Stato pagamento
        paymentCompleted: state.paymentCompleted,
        
        // Meta
        sessionId: state.sessionId,
        submittedAt: new Date().toISOString(),
        requestType: 'white-label-quote'
      }
      
      // Chiamata API
      const response = await fetch('/api/submit-quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Errore sconosciuto durante l\'invio')
      }
      
      setIsSubmitting(false)
      
      return true
      
    } catch (error: unknown) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'invio della richiesta'
      setSubmitError(errorMessage)
      console.error('📤 Form submission error:', error)
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
    
    // Flow biforcato enterprise
    if (state.wantsSample) {
      // CON campione: Prima pagamento, poi l'utente tornerà su success page
      await handleStripePayment()
      // Nota: se il pagamento va a buon fine, l'utente viene reindirizzato a Stripe
      // Il form submission avverrà nella success page dopo il pagamento
    } else {
      // SENZA campione: Invio diretto del form
      const submissionSuccess = await handleFormSubmission()
      if (submissionSuccess) {
        // Redirect a pagina di ringraziamento
        window.location.href = '/thank-you?type=white-label'
      }
    }
  }

  return (
    <div className="space-y-6">

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dati Personali Enterprise */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Dati di Contatto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={state.contactForm.firstName}
                onChange={(e) => actions.setContactForm({ firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Il tuo nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cognome *
              </label>
              <input
                type="text"
                required
                value={state.contactForm.lastName}
                onChange={(e) => actions.setContactForm({ lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Il tuo cognome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={state.contactForm.email}
                onChange={(e) => actions.setContactForm({ email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
                  state.contactForm.email && !isEmailValid(state.contactForm.email) 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-[#ed6d23]'
                }`}
                placeholder="email@esempio.com"
              />
              {state.contactForm.email && !isEmailValid(state.contactForm.email) && (
                <p className="text-xs text-red-600 mt-1">Inserisci un indirizzo email valido</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero di Telefono *
              </label>
              <input
                type="tel"
                required
                value={state.contactForm.phone}
                onChange={(e) => actions.setContactForm({ phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                placeholder="+39 123 456 7890"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Azienda *
              </label>
              <input
                type="text"
                required
                value={state.contactForm.company}
                onChange={(e) => actions.setContactForm({ company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                placeholder="Nome della tua azienda"
              />
            </div>
          </div>
        </div>

        {/* Preferenze Contatto Enterprise */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Preferenze di Contatto
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emailOnly"
                checked={state.contactForm.emailOnly}
                onChange={(e) => actions.setContactForm({ 
                  emailOnly: e.target.checked,
                  // Se seleziona "solo email", disabilita automaticamente le chiamate
                  ...(e.target.checked && { canCall: false, preferredCallTime: '' })
                })}
                className="w-4 h-4 text-[#ed6d23] bg-gray-100 border-gray-300 rounded focus:ring-[#ed6d23] focus:ring-2"
              />
              <label htmlFor="emailOnly" className="text-sm text-gray-700">
                Voglio essere contattato esclusivamente via email
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="canCall"
                checked={state.contactForm.canCall}
                disabled={state.contactForm.emailOnly}
                onChange={(e) => actions.setContactForm({ canCall: e.target.checked })}
                className="w-4 h-4 text-[#ed6d23] bg-gray-100 border-gray-300 rounded focus:ring-[#ed6d23] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="canCall" className={`text-sm ${state.contactForm.emailOnly ? 'text-gray-400' : 'text-gray-700'}`}>
                Acconsento a essere contattato telefonicamente
              </label>
            </div>
            
            {state.contactForm.canCall && !state.contactForm.emailOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quando preferisci essere contattato?
                </label>
                <select
                  value={state.contactForm.preferredCallTime}
                  onChange={(e) => actions.setContactForm({ preferredCallTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed6d23] focus:border-transparent text-gray-900"
                >
                  <option value="">Seleziona un orario</option>
                  <option value="mattina">Mattina (9:00 - 12:00)</option>
                  <option value="pomeriggio">Pomeriggio (14:00 - 17:00)</option>
                  <option value="sera">Sera (17:00 - 19:00)</option>
                  <option value="qualsiasi">Qualsiasi momento</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Sezione Fatturazione Facoltativi */}
        <BillingSection
          billingData={state.contactForm.billingData}
          onBillingDataChange={(billingData) => actions.setContactForm({ billingData })}
          disabled={isSubmitting || isPaymentProcessing}
        />

        {/* Sample Request Info Enterprise */}
        {state.wantsSample && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Campione Richiesto</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Pagamento €50 richiesto tramite Stripe
                </p>
              </div>
              <div className="text-xl font-bold text-[#ed6d23]">
                €50,00
              </div>
            </div>
            
            {state.paymentCompleted && (
              <div className="flex items-center text-green-700 mt-4 p-3 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Pagamento completato con successo</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button Enterprise */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting || isPaymentProcessing}
            className={`px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ed6d23] ${
              !isFormValid() || isSubmitting || isPaymentProcessing
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#ed6d23] hover:bg-[#d55a1a]'
            }`}
          >
            {isPaymentProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Elaborazione pagamento...
              </>
            ) : isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Invio in corso...
              </>
            ) : state.wantsSample && !state.paymentCompleted ? (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Paga €50 e Invia Richiesta
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Invia Richiesta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}