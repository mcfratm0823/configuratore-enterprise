'use client'

// 🚀 STRIPE SERVICE NEXT.JS ENTERPRISE
// Simplified payment service for sample orders €50

export interface OrderData {
  // Customer info
  customerEmail: string
  customerName: string
  
  // Order details
  quantity: number
  totalPrice: number
  
  // Meta
  sessionId: string
  createdAt: Date
}

export interface CheckoutSession {
  id: string
  url: string
}

class StripeService {
  private publishableKey: string
  private stripe: any = null

  constructor() {
    // Environment variables Next.js
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    this.initializeStripe()
  }

  private async initializeStripe() {
    if (typeof window !== 'undefined' && this.publishableKey) {
      try {
        const { loadStripe } = await import('@stripe/stripe-js')
        this.stripe = await loadStripe(this.publishableKey)
      } catch (error) {
        // Stripe initialization failed silently
      }
    }
  }

  /**
   * 🎯 CREA CHECKOUT SESSION ENTERPRISE
   * Chiamata all'API Next.js per creare sessione Stripe
   */
  async createCheckoutSession(orderData: OrderData): Promise<CheckoutSession | null> {
    try {

      // Validation semplice
      if (!orderData.customerEmail || !orderData.customerName) {
        throw new Error('Customer data required')
      }

      if (orderData.totalPrice !== 50) {
        throw new Error('Sample price must be €50')
      }

      // Chiamata all'API endpoint Next.js
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName,
          amount: 5000, // €50 in centesimi
          sessionId: orderData.sessionId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Checkout session creation failed')
      }

      return {
        id: data.sessionId,
        url: data.url
      }
      
    } catch (error) {
      return null
    }
  }

  /**
   * 🔄 REDIRECT TO CHECKOUT
   * Reindirizza l'utente alla pagina Stripe Checkout
   */
  async redirectToCheckout(sessionId: string, checkoutUrl: string): Promise<void> {
    try {
      // Redirect diretto all'URL Stripe
      window.location.href = checkoutUrl
      
    } catch (error) {
      throw error
    }
  }

  /**
   * 💰 FORMAT CURRENCY
   * Formatter per valuta italiana
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
}

// Singleton instance
export const stripeService = new StripeService()

// Export types
export type { OrderData, CheckoutSession }