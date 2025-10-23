import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { UnifiedQuoteData } from '@/types/api-interfaces'

// Stripe webhook endpoint per gestire pagamenti completati
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('❌ Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Verify webhook signature per security
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('🔔 Stripe webhook received:', event.type)

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as unknown
      
      // Type guard for session object
      if (!session || typeof session !== 'object' || !('id' in session)) {
        console.error('❌ Invalid session object in webhook')
        return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
      }

      const sessionData = session as {
        id: string
        customer_details?: { email?: string }
        amount_total?: number
        metadata?: Record<string, string>
      }
      
      console.log('💳 Payment completed for session:', sessionData.id)
      console.log('📧 Customer email:', sessionData.customer_details?.email)
      console.log('💰 Amount paid:', (sessionData.amount_total || 0) / 100, 'EUR')

      // Extract metadata from session (customer data)
      const metadata = sessionData.metadata || {}
      
      if (!metadata.contact_data || !metadata.config_data) {
        console.error('❌ No customer data in session metadata')
        return NextResponse.json({ error: 'Missing customer data' }, { status: 400 })
      }

      // Parse customer data from separated fields
      const contactForm = JSON.parse(metadata.contact_data)
      const configData = JSON.parse(metadata.config_data)
      
      // Reconstruct customerData object
      const customerData = {
        contactForm,
        ...configData,
        serviceType: metadata.service_type || 'white-label',
        sessionId: metadata.session_id,
        ip: 'webhook'
      }
      
      // Restore full beverage text for emails if available
      if (metadata.full_beverage_text && customerData.beverageSelection) {
        customerData.beverageSelection.customBeverageText = metadata.full_beverage_text
      }
      
      // Prepare unified quote data using the same interface as form submission
      const quoteData: UnifiedQuoteData = {
        contactForm: customerData.contactForm,
        
        // White Label data
        canSelection: customerData.canSelection || null,
        
        // Private Label data
        beverageSelection: customerData.beverageSelection || null,
        volumeFormatSelection: customerData.volumeFormatSelection || null,
        packagingSelection: customerData.packagingSelection || null,
        
        // Common data
        wantsSample: true, // Always true for paid samples
        country: customerData.country,
        serviceType: customerData.serviceType === 'private-label' ? 'private-label' : 'white-label',
        submittedAt: new Date().toISOString(),
        ip: customerData.ip || 'webhook',
        
        // Payment specific data
        paymentCompleted: true,
        paymentSessionId: sessionData.id,
        amountPaid: (sessionData.amount_total || 0) / 100
      }

      // Send emails after confirmed payment
      try {
        await sendNotificationEmailsAfterPayment(quoteData)
        console.log('✅ Emails sent successfully after payment confirmation')
      } catch (emailError) {
        console.error('❌ Failed to send emails after payment:', emailError)
        // Non fail the webhook - payment is confirmed anyway
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: unknown) {
    console.error('❌ Stripe webhook error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}

// Using unified interface - no longer need separate PaymentData interface

// Email function specifically for post-payment using unified interface
async function sendNotificationEmailsAfterPayment(data: UnifiedQuoteData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found')
    return
  }

  try {
    // Send both admin and customer emails in parallel
    const [adminResult, customerResult] = await Promise.allSettled([
      sendAdminNotificationWithPayment(data),
      sendCustomerConfirmationWithPayment(data)
    ])

    // Log results
    if (adminResult.status === 'fulfilled') {
      console.log('✅ Admin payment notification sent')
    } else {
      console.error('❌ Admin payment notification failed:', adminResult.reason)
    }

    if (customerResult.status === 'fulfilled') {
      console.log('✅ Customer payment confirmation sent')
    } else {
      console.error('❌ Customer payment confirmation failed:', customerResult.reason)
    }

  } catch (error) {
    console.error('❌ Error sending payment emails:', error)
    throw error
  }
}

// Admin email with payment confirmation using unified interface
async function sendAdminNotificationWithPayment(data: UnifiedQuoteData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY!
  
  const isPrivateLabel = data.serviceType === 'private-label'
  const emailSubject = `✅ PAGAMENTO CONFERMATO - ${isPrivateLabel ? 'PRIVATE LABEL' : 'WHITE LABEL'} - ${data.contactForm.company || data.contactForm.firstName} - €${data.amountPaid}`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">💳 PAGAMENTO CONFERMATO</h2>
        <p style="margin: 10px 0 0 0; font-size: 18px;">€${data.amountPaid} - Campione ${isPrivateLabel ? 'Private Label' : 'White Label'}</p>
      </div>
      
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none;">
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #155724; margin-top: 0;">✅ Dettagli Pagamento:</h3>
          <ul style="list-style: none; padding: 0; color: #155724;">
            <li><strong>Importo:</strong> €${data.amountPaid}</li>
            <li><strong>Session ID:</strong> ${data.paymentSessionId}</li>
            <li><strong>Data:</strong> ${new Date(data.submittedAt).toLocaleString('it-IT')}</li>
            <li><strong>Status:</strong> PAYMENT_CONFIRMED</li>
          </ul>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">👤 Dati Cliente:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Nome:</strong> ${data.contactForm.firstName} ${data.contactForm.lastName}</li>
            <li><strong>Email:</strong> ${data.contactForm.email}</li>
            <li><strong>Telefono:</strong> ${data.contactForm.phone || 'Non fornito'}</li>
            <li><strong>Azienda:</strong> ${data.contactForm.company || 'Non fornita'}</li>
            <li><strong>Paese:</strong> ${data.country}</li>
          </ul>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📦 Dettagli Progetto:</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.canSelection ? `
              <li><strong>Tipo:</strong> White Label</li>
              <li><strong>Quantità lattine:</strong> ${data.canSelection.quantity}</li>
              <li><strong>Prezzo preventivo:</strong> €${data.canSelection.totalPrice}</li>
            ` : ''}
            ${data.beverageSelection ? `
              <li><strong>Tipo:</strong> Private Label</li>
              <li><strong>Bevanda:</strong> ${data.beverageSelection.selectedBeverage === 'rd-custom' ? `R&D - ${data.beverageSelection.customBeverageText}` : data.beverageSelection.selectedBeverage}</li>
              ${data.volumeFormatSelection ? `<li><strong>Produzione:</strong> ${data.volumeFormatSelection.volumeLiters.toLocaleString()} litri × ${data.volumeFormatSelection.formatMl}ml = ${data.volumeFormatSelection.totalPieces.toLocaleString()} pezzi</li>` : ''}
              ${data.packagingSelection ? `<li><strong>Packaging:</strong> ${data.packagingSelection.packagingType === 'label' ? 'Etichetta Antiumidità' : 'Stampa Digitale'}</li>` : ''}
            ` : ''}
            <li><strong>Campione richiesto:</strong> ✅ SÌ - PAGATO (€${data.amountPaid})</li>
          </ul>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">🚀 AZIONI RICHIESTE:</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;"><strong>Preparare campione</strong> per spedizione</li>
            <li style="margin: 8px 0;"><strong>Contattare cliente</strong> entro 24h</li>
            <li style="margin: 8px 0;"><strong>Inviare tracking</strong> spedizione campione</li>
            <li style="margin: 8px 0;"><strong>Follow-up</strong> per preventivo completo</li>
          </ul>
        </div>

        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📞 Preferenze Contatto:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Consenso chiamata:</strong> ${data.contactForm.canCall ? 'SÌ' : 'NO'}</li>
            <li><strong>Orario preferito:</strong> ${data.contactForm.preferredCallTime || 'Non specificato'}</li>
          </ul>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Configuratore Enterprise - ${isPrivateLabel ? 'Private Label' : 'White Label'} Packaging<br>
          Notifica automatica pagamento confermato - Stripe Webhook
        </p>
      </div>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'a.guarnieri.portfolio@gmail.com',
      subject: emailSubject,
      html: emailContent
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Admin payment email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Admin payment notification sent:', result.id)
}

// Customer email with payment confirmation using unified interface
async function sendCustomerConfirmationWithPayment(data: UnifiedQuoteData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY!
  
  const isPrivateLabel = data.serviceType === 'private-label'
  const isItaly = data.country?.toLowerCase() === 'italy'
  
  // Send Italian email for Italy, English for all other countries
  if (isItaly) {
    await sendCustomerConfirmationItalian(data, RESEND_API_KEY, isPrivateLabel)
  } else {
    await sendCustomerConfirmationEnglish(data, RESEND_API_KEY, isPrivateLabel)
  }
}

// Italian customer email using unified interface
async function sendCustomerConfirmationItalian(data: UnifiedQuoteData, RESEND_API_KEY: string, isPrivateLabel: boolean): Promise<void> {
  const emailSubject = `✅ Pagamento confermato - Campione ${isPrivateLabel ? 'Private Label' : 'White Label'} in preparazione`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Pagamento Confermato!</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Il tuo campione è in preparazione</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #28a745; margin-top: 0;">Ciao ${data.contactForm.firstName}!</h2>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
          Fantastico! Il tuo pagamento di <strong>€${data.amountPaid}</strong> è stato confermato con successo. 
          Il nostro team sta già preparando il tuo campione ${isPrivateLabel ? 'Private Label' : 'White Label'} personalizzato.
        </p>
        
        <div style="background: #d4edda; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
          <h3 style="color: #155724; margin-top: 0; font-size: 18px;">✅ Stato del tuo ordine:</h3>
          <ul style="color: #155724; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;"><strong>Pagamento:</strong> Confermato (€${data.amountPaid})</li>
            <li style="margin: 8px 0;"><strong>Campione:</strong> In preparazione</li>
            <li style="margin: 8px 0;"><strong>Spedizione:</strong> Entro 2-3 giorni lavorativi</li>
            <li style="margin: 8px 0;"><strong>Tracking:</strong> Ti invieremo il codice</li>
          </ul>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Riepilogo della tua richiesta:</h3>
          
          <div style="margin: 15px 0;">
            <strong style="color: #2d5a3d;">Dati di contatto:</strong><br>
            <span style="color: #666;">
              ${data.contactForm.firstName} ${data.contactForm.lastName}<br>
              ${data.contactForm.email}<br>
              ${data.contactForm.phone}<br>
              ${data.contactForm.company}
            </span>
          </div>
          
          <div style="margin: 15px 0;">
            <strong style="color: #2d5a3d;">Dettagli progetto:</strong><br>
            <span style="color: #666;">
              Paese: ${data.country}<br>
              ${data.canSelection ? `
                Tipo: White Label<br>
                Quantità lattine: ${data.canSelection.quantity}<br>
                Prezzo preventivo: €${data.canSelection.totalPrice}<br>
              ` : ''}
              ${data.beverageSelection ? `
                Tipo: Private Label<br>
                Bevanda: ${data.beverageSelection.selectedBeverage === 'rd-custom' ? `R&D - ${data.beverageSelection.customBeverageText}` : data.beverageSelection.selectedBeverage}<br>
                ${data.volumeFormatSelection ? `Produzione: ${data.volumeFormatSelection.volumeLiters.toLocaleString()} litri × ${data.volumeFormatSelection.formatMl}ml<br>` : ''}
                ${data.packagingSelection ? `Packaging: ${data.packagingSelection.packagingType === 'label' ? 'Etichetta Antiumidità' : 'Stampa Digitale'}<br>` : ''}
              ` : ''}
              Campione: ✅ Pagato e confermato
            </span>
          </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">🚀 Prossimi passi:</h3>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Il nostro team preparerà il tuo campione personalizzato</li>
            <li style="margin: 8px 0;">Riceverai il codice tracking entro 2-3 giorni</li>
            <li style="margin: 8px 0;">Ti contatteremo per discutere il preventivo completo</li>
            <li style="margin: 8px 0;">Potrai valutare la qualità prima dell'ordine finale</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #2d5a3d; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
            <strong>Hai domande? Scrivici a: info@configuratore-enterprise.com</strong>
          </div>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <p style="color: #856404; margin: 0; text-align: center;">
            <strong>📦 Il tuo campione verrà spedito all'indirizzo che ci comunicherai via email</strong>
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 40px;">
          <em>Pagamento confermato il: ${new Date(data.submittedAt).toLocaleString('it-IT')}</em><br>
          <em>ID Transazione: ${data.paymentSessionId}</em>
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Configuratore Enterprise - ${isPrivateLabel ? 'Private Label' : 'White Label'} Packaging<br>
          Email di conferma pagamento generata automaticamente
        </p>
      </div>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'a.guarnieri.portfolio@gmail.com', // Temp: solo email verificata
      subject: `${emailSubject} - Per: ${data.contactForm.email}`,
      html: emailContent
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Italian customer payment email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Italian customer payment confirmation sent to:', data.contactForm.email, '- ID:', result.id)
}

// English customer email using unified interface
async function sendCustomerConfirmationEnglish(data: UnifiedQuoteData, RESEND_API_KEY: string, isPrivateLabel: boolean): Promise<void> {
  const emailSubject = `✅ Payment Confirmed - Your ${isPrivateLabel ? 'Private Label' : 'White Label'} Sample is Being Prepared`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Payment Confirmed!</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Your sample is being prepared</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #28a745; margin-top: 0;">Hello ${data.contactForm.firstName}!</h2>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
          Fantastic! Your payment of <strong>€${data.amountPaid}</strong> has been successfully confirmed. 
          Our team is already preparing your personalized ${isPrivateLabel ? 'Private Label' : 'White Label'} sample.
        </p>
        
        <div style="background: #d4edda; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
          <h3 style="color: #155724; margin-top: 0; font-size: 18px;">✅ Your Order Status:</h3>
          <ul style="color: #155724; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;"><strong>Payment:</strong> Confirmed (€${data.amountPaid})</li>
            <li style="margin: 8px 0;"><strong>Sample:</strong> Being prepared</li>
            <li style="margin: 8px 0;"><strong>Shipping:</strong> Within 2-3 business days</li>
            <li style="margin: 8px 0;"><strong>Tracking:</strong> We'll send you the code</li>
          </ul>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Summary of Your Request:</h3>
          
          <div style="margin: 15px 0;">
            <strong style="color: #2d5a3d;">Contact Details:</strong><br>
            <span style="color: #666;">
              ${data.contactForm.firstName} ${data.contactForm.lastName}<br>
              ${data.contactForm.email}<br>
              ${data.contactForm.phone}<br>
              ${data.contactForm.company}
            </span>
          </div>
          
          <div style="margin: 15px 0;">
            <strong style="color: #2d5a3d;">Project Details:</strong><br>
            <span style="color: #666;">
              Country: ${data.country}<br>
              ${data.canSelection ? `
                Type: White Label<br>
                Can Quantity: ${data.canSelection.quantity}<br>
                Estimated Price: €${data.canSelection.totalPrice}<br>
              ` : ''}
              ${data.beverageSelection ? `
                Type: Private Label<br>
                Beverage: ${data.beverageSelection.selectedBeverage === 'rd-custom' ? `R&D - ${data.beverageSelection.customBeverageText}` : data.beverageSelection.selectedBeverage}<br>
                ${data.volumeFormatSelection ? `Production: ${data.volumeFormatSelection.volumeLiters.toLocaleString()} liters × ${data.volumeFormatSelection.formatMl}ml<br>` : ''}
                ${data.packagingSelection ? `Packaging: ${data.packagingSelection.packagingType === 'label' ? 'Anti-humidity Label' : 'Digital Print'}<br>` : ''}
              ` : ''}
              Sample: ✅ Paid and confirmed
            </span>
          </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">🚀 Next Steps:</h3>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Our team will prepare your personalized sample</li>
            <li style="margin: 8px 0;">You'll receive the tracking code within 2-3 days</li>
            <li style="margin: 8px 0;">We'll contact you to discuss the complete quote</li>
            <li style="margin: 8px 0;">You can evaluate quality before placing the final order</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #2d5a3d; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
            <strong>Have questions? Contact us at: info@configuratore-enterprise.com</strong>
          </div>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <p style="color: #856404; margin: 0; text-align: center;">
            <strong>📦 Your sample will be shipped to the address you'll provide via email</strong>
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 40px;">
          <em>Payment confirmed on: ${new Date(data.submittedAt).toLocaleString('en-US')}</em><br>
          <em>Transaction ID: ${data.paymentSessionId}</em>
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Enterprise Configurator - ${isPrivateLabel ? 'Private Label' : 'White Label'} Packaging<br>
          Automated payment confirmation email
        </p>
      </div>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'a.guarnieri.portfolio@gmail.com', // Temp: solo email verificata
      subject: `${emailSubject} - For: ${data.contactForm.email}`,
      html: emailContent
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`English customer payment email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ English customer payment confirmation sent to:', data.contactForm.email, '- ID:', result.id)
}