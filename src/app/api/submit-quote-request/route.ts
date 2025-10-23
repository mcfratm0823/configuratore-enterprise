import { NextRequest, NextResponse } from 'next/server'
import { UnifiedQuoteData, isWhiteLabel, isPrivateLabel } from '@/types/api-interfaces'

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const formData = await request.json()
    
    // Extract unified data structure (supporting both White Label and Private Label)
    const { 
      contactForm, 
      canSelection, 
      beverageSelection, 
      volumeFormatSelection, 
      packagingSelection, 
      wantsSample, 
      country,
      requestType 
    } = formData
    
    if (!contactForm || !contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required contact information' },
        { status: 400 }
      )
    }

    // Determine service type
    const serviceType = requestType === 'private-label-quote' ? 'private-label' : 'white-label'
    
    // Sanitizzazione dati enterprise con supporto completo White Label + Private Label
    const sanitizedData: UnifiedQuoteData = {
      contactForm: {
        firstName: String(contactForm.firstName).substring(0, 50).trim(),
        lastName: String(contactForm.lastName).substring(0, 50).trim(),
        email: String(contactForm.email).toLowerCase().substring(0, 100).trim(),
        phone: String(contactForm.phone || '').substring(0, 20).trim(),
        company: String(contactForm.company || '').substring(0, 100).trim(),
        canCall: Boolean(contactForm.canCall),
        preferredCallTime: String(contactForm.preferredCallTime || '').substring(0, 20)
      },
      
      // White Label data
      canSelection: canSelection ? {
        quantity: Math.min(Math.max(1, Number(canSelection.quantity)), 10000),
        totalPrice: Number(canSelection.totalPrice) || 0
      } : null,
      
      // Private Label data
      beverageSelection: beverageSelection ? {
        selectedBeverage: String(beverageSelection.selectedBeverage).substring(0, 100),
        customBeverageText: String(beverageSelection.customBeverageText || '').substring(0, 500),
        isCustom: Boolean(beverageSelection.isCustom)
      } : null,
      
      volumeFormatSelection: volumeFormatSelection ? {
        volumeLiters: Math.max(0, Number(volumeFormatSelection.volumeLiters)),
        formatMl: Math.max(0, Number(volumeFormatSelection.formatMl)),
        totalPieces: Math.max(0, Number(volumeFormatSelection.totalPieces)),
        cartonsCount: Math.max(0, Number(volumeFormatSelection.cartonsCount)),
        isCustomVolume: Boolean(volumeFormatSelection.isCustomVolume)
      } : null,
      
      packagingSelection: packagingSelection ? {
        selectedPackaging: String(packagingSelection.selectedPackaging).substring(0, 100),
        packagingType: packagingSelection.packagingType === 'digital' ? 'digital' : 'label'
      } : null,
      
      // Common fields
      wantsSample: Boolean(wantsSample),
      country: String(country || '').substring(0, 50),
      serviceType,
      submittedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }

    // Invio email con Resend (double flow)
    try {
      await sendNotificationEmails(sanitizedData)
    } catch (emailError: unknown) {
      // Enterprise error logging
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error'
      console.error('⚠️ Email sending failed:', errorMessage)
    }

    // Risposta successo
    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      quoteId: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
    
  } catch (error: unknown) {
    // Enterprise error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Quote submission error:', errorMessage)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Funzione email enterprise con Resend (Double Flow) - Unified per White Label + Private Label
async function sendNotificationEmails(data: UnifiedQuoteData): Promise<{ success: boolean }> {
  // Verifica chiave Resend
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables')
    console.log('📧 Email notification (NO API KEY - FALLING BACK TO CONSOLE LOG):', {
      customer: `${data.contactForm.firstName} ${data.contactForm.lastName}`,
      email: data.contactForm.email,
      company: data.contactForm.company,
      serviceType: data.serviceType,
      quantity: data.canSelection?.quantity,
      beverageSelection: data.beverageSelection?.selectedBeverage,
      wantsSample: data.wantsSample,
      timestamp: new Date().toISOString()
    })
    return { success: true }
  }

  try {
    // Invio parallelo: Admin + Customer confirmation
    const [adminResult, customerResult] = await Promise.allSettled([
      sendAdminNotification(data),
      sendCustomerConfirmation(data)
    ])

    // Log risultati
    if (adminResult.status === 'fulfilled') {
      console.log('✅ Admin email inviata con successo')
    } else {
      console.error('❌ Admin email fallita:', adminResult.reason)
    }

    if (customerResult.status === 'fulfilled') {
      console.log('✅ Customer confirmation inviata con successo')
    } else {
      console.error('❌ Customer confirmation fallita:', customerResult.reason)
    }

    return { success: true }
    
  } catch (error: unknown) {
    console.error('❌ Errore generale invio email:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Email Admin - Unified per White Label + Private Label
async function sendAdminNotification(data: UnifiedQuoteData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY!
  
  const isPrivateLabel = data.serviceType === 'private-label'
  const emailSubject = `Nuova Richiesta Quote ${isPrivateLabel ? 'PRIVATE LABEL' : 'WHITE LABEL'} - ${data.contactForm.company || data.contactForm.firstName}`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a3d;">Nuova Richiesta di Preventivo ${isPrivateLabel ? 'Private Label' : 'White Label'}</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Dati Cliente:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Nome:</strong> ${data.contactForm.firstName} ${data.contactForm.lastName}</li>
          <li><strong>Email:</strong> ${data.contactForm.email}</li>
          <li><strong>Telefono:</strong> ${data.contactForm.phone || 'Non fornito'}</li>
          <li><strong>Azienda:</strong> ${data.contactForm.company || 'Non fornita'}</li>
          <li><strong>Paese:</strong> ${data.country}</li>
        </ul>
      </div>

      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Dettagli Ordine:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Quantità lattine:</strong> ${data.canSelection?.quantity || 'Non specificata'}</li>
          <li><strong>Prezzo totale:</strong> €${data.canSelection?.totalPrice || 'N/A'}</li>
          <li><strong>Richiede campione:</strong> ${data.wantsSample ? 'SÌ (€50)' : 'NO'}</li>
        </ul>
      </div>

      <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Preferenze Contatto:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Consenso chiamata:</strong> ${data.contactForm.canCall ? 'SÌ' : 'NO'}</li>
          <li><strong>Orario preferito:</strong> ${data.contactForm.preferredCallTime || 'Non specificato'}</li>
        </ul>
      </div>

      <p style="color: #666; font-size: 14px;">
        <em>Richiesta inviata il: ${new Date(data.submittedAt).toLocaleString('it-IT')}</em>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        Configuratore Enterprise - White Label Packaging<br>
        Generato automaticamente dal sistema
      </p>
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
    throw new Error(`Admin email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Admin email inviata:', result.id)
}

// Email Customer Confirmation with language selection
async function sendCustomerConfirmation(data: QuoteRequestData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY!
  
  const isItaly = data.country?.toLowerCase() === 'italy'
  
  // Send Italian email for Italy, English for all other countries
  if (isItaly) {
    await sendCustomerConfirmationItalian(data, RESEND_API_KEY)
  } else {
    await sendCustomerConfirmationEnglish(data, RESEND_API_KEY)
  }
}

// Italian customer confirmation
async function sendCustomerConfirmationItalian(data: QuoteRequestData, RESEND_API_KEY: string): Promise<void> {
  const emailSubject = `Conferma richiesta preventivo - Configuratore Enterprise`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #2d5a3d; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📦 Configuratore Enterprise</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Conferma richiesta preventivo</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #2d5a3d; margin-top: 0;">Ciao ${data.contactForm.firstName}!</h2>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
          Grazie per aver utilizzato il nostro configuratore enterprise. Abbiamo ricevuto la tua richiesta di preventivo 
          per packaging White Label e ti contatteremo a breve.
        </p>
        
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
            <strong style="color: #2d5a3d;">Dettagli ordine:</strong><br>
            <span style="color: #666;">
              Paese: ${data.country}<br>
              Quantità lattine: ${data.canSelection?.quantity || 'Non specificata'}<br>
              Prezzo totale: €${data.canSelection?.totalPrice || 'N/A'}<br>
              Campione richiesto: ${data.wantsSample ? 'SÌ (€50)' : 'NO'}
            </span>
          </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">🚀 Prossimi passi:</h3>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Analizzeremo la tua richiesta entro 24 ore</li>
            <li style="margin: 8px 0;">Ti invieremo un preventivo dettagliato personalizzato</li>
            <li style="margin: 8px 0;">Un nostro esperto ti contatterà per finalizzare i dettagli</li>
            ${data.wantsSample ? '<li style="margin: 8px 0;">Il campione verrà spedito dopo conferma pagamento</li>' : ''}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #2d5a3d; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
            <strong>Hai domande? Scrivici a: info@configuratore-enterprise.com</strong>
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 40px;">
          <em>Richiesta inviata il: ${new Date(data.submittedAt).toLocaleString('it-IT')}</em>
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Configuratore Enterprise - White Label Packaging<br>
          Email di conferma generata automaticamente
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
      to: 'a.guarnieri.portfolio@gmail.com', // TEMP: Solo email verificata per testing
      subject: `${emailSubject} - Per: ${data.contactForm.email}`,
      html: emailContent
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Italian customer email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Italian customer confirmation sent to:', data.contactForm.email, '- ID:', result.id)
}

// English customer confirmation - Unified per White Label + Private Label
async function sendCustomerConfirmationEnglish(data: UnifiedQuoteData, RESEND_API_KEY: string): Promise<void> {
  const isPrivateLabel = data.serviceType === 'private-label'
  const emailSubject = `${isPrivateLabel ? 'Private Label' : 'White Label'} Quote Request Confirmation - Enterprise Configurator`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #2d5a3d; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📦 Enterprise Configurator</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Quote request confirmation</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #2d5a3d; margin-top: 0;">Hello ${data.contactForm.firstName}!</h2>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
          Thank you for using our enterprise configurator. We have received your quote request 
          for ${isPrivateLabel ? 'Private Label' : 'White Label'} packaging and will contact you shortly.
        </p>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Summary of your request:</h3>
          
          <div style="margin: 15px 0;">
            <strong style="color: #2d5a3d;">Contact details:</strong><br>
            <span style="color: #666;">
              ${data.contactForm.firstName} ${data.contactForm.lastName}<br>
              ${data.contactForm.email}<br>
              ${data.contactForm.phone}<br>
              ${data.contactForm.company}
            </span>
          </div>
          
          <div style="margin: 15px 0;">
            <strong style="color: #2d5a3d;">Project details:</strong><br>
            <span style="color: #666;">
              Country: ${data.country}<br>
              ${data.canSelection ? `
                Type: White Label<br>
                Can quantity: ${data.canSelection.quantity}<br>
                Total price: €${data.canSelection.totalPrice}<br>
              ` : ''}
              ${data.beverageSelection ? `
                Type: Private Label<br>
                Beverage: ${data.beverageSelection.selectedBeverage === 'rd-custom' ? `R&D - ${data.beverageSelection.customBeverageText}` : data.beverageSelection.selectedBeverage}<br>
                ${data.volumeFormatSelection ? `Production: ${data.volumeFormatSelection.volumeLiters.toLocaleString()} liters × ${data.volumeFormatSelection.formatMl}ml<br>` : ''}
                ${data.packagingSelection ? `Packaging: ${data.packagingSelection.packagingType === 'label' ? 'Anti-humidity Label' : 'Digital Print'}<br>` : ''}
              ` : ''}
              Sample requested: ${data.wantsSample ? 'YES (€50)' : 'NO'}
            </span>
          </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">🚀 Next steps:</h3>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">We'll analyze your request within 24 hours</li>
            <li style="margin: 8px 0;">You'll receive a detailed personalized quote</li>
            <li style="margin: 8px 0;">Our expert will contact you to finalize details</li>
            ${data.wantsSample ? '<li style="margin: 8px 0;">Sample will be shipped after payment confirmation</li>' : ''}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #2d5a3d; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
            <strong>Have questions? Contact us at: info@configuratore-enterprise.com</strong>
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 40px;">
          <em>Request submitted on: ${new Date(data.submittedAt).toLocaleString('en-US')}</em>
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Enterprise Configurator - ${isPrivateLabel ? 'Private Label' : 'White Label'} Packaging<br>
          Automated confirmation email
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
      to: 'a.guarnieri.portfolio@gmail.com', // TEMP: Solo email verificata per testing
      subject: `${emailSubject} - For: ${data.contactForm.email}`,
      html: emailContent
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`English customer email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ English customer confirmation sent to:', data.contactForm.email, '- ID:', result.id)
}