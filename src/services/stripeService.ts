'use client'

// 🚀 STRIPE SERVICE NEXT.JS ENTERPRISE
// Simplified payment service for sample orders €50

import type { Stripe } from '@stripe/stripe-js'

export interface OrderData {
  // Customer info
  email: string
  firstName: string
  lastName: string
  phone: string
  company: string
  
  // Order details
  amount: number
  currency: string
  description: string
  
  // Meta
  metadata: Record<string, string>
}

export interface StripeResponse {
  success: boolean
  url?: string
  error?: string
}

class StripeService {
  private publishableKey: string
  private stripe: Stripe | null = null

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
      } catch (error: unknown) {
        // Enterprise error logging
        console.warn('⚠️ Stripe initialization failed:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  /**
   * 🎯 CREA CHECKOUT SESSION ENTERPRISE
   * Chiamata all'API Next.js per creare sessione Stripe
   */
  async createCheckoutSession(orderData: OrderData): Promise<StripeResponse> {
    try {
      // Validation semplice
      if (!orderData.email || !orderData.firstName || !orderData.lastName) {
        return { success: false, error: 'Customer data required' }
      }

      if (orderData.amount !== 50) {
        return { success: false, error: 'Sample price must be €50' }
      }

      // Chiamata all'API endpoint Next.js
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: orderData.email,
          customerName: `${orderData.firstName} ${orderData.lastName}`,
          amount: orderData.amount * 100, // Convert to centesimi
          metadata: orderData.metadata
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` }
      }

      const data = await response.json()
      
      if (!data.success) {
        return { success: false, error: data.error || 'Checkout session creation failed' }
      }

      return {
        success: true,
        url: data.url
      }
      
    } catch (error: unknown) {
      // Enterprise error logging
      console.error('💳 Checkout session creation failed:', error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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

// Types exported inline above