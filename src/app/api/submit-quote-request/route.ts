import { NextRequest, NextResponse } from 'next/server'
import { UnifiedQuoteData } from '@/types/api-interfaces'
// Removed unused imports: isWhiteLabel, isPrivateLabel
import { getBeverageDisplayName, getBeverageDisplayNameEnglish } from '@/utils/beverage-mapping'

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

    // Validate and determine service type with explicit validation
    if (!requestType || !['white-label-quote', 'private-label-quote'].includes(requestType)) {
      console.error('❌ Invalid or missing requestType:', requestType)
      return NextResponse.json(
        { success: false, error: 'Invalid service type request' },
        { status: 400 }
      )
    }
    
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
        preferredCallTime: String(contactForm.preferredCallTime || '').substring(0, 20),
        emailOnly: Boolean(contactForm.emailOnly), // Backward compatible: default false if missing
        
        // Dati fatturazione opzionali (sanitizzazione sicura)
        billingData: contactForm.billingData ? {
          vatNumber: contactForm.billingData.vatNumber ? String(contactForm.billingData.vatNumber).substring(0, 20).trim() : undefined,
          fiscalCode: contactForm.billingData.fiscalCode ? String(contactForm.billingData.fiscalCode).substring(0, 20).trim() : undefined,
          legalName: contactForm.billingData.legalName ? String(contactForm.billingData.legalName).substring(0, 100).trim() : undefined,
          billingAddress: contactForm.billingData.billingAddress ? String(contactForm.billingData.billingAddress).substring(0, 200).trim() : undefined,
          billingCity: contactForm.billingData.billingCity ? String(contactForm.billingData.billingCity).substring(0, 50).trim() : undefined,
          billingPostalCode: contactForm.billingData.billingPostalCode ? String(contactForm.billingData.billingPostalCode).substring(0, 10).trim() : undefined,
          billingProvince: contactForm.billingData.billingProvince ? String(contactForm.billingData.billingProvince).substring(0, 5).trim() : undefined,
          sdi: contactForm.billingData.sdi ? String(contactForm.billingData.sdi).substring(0, 10).trim() : undefined,
          pec: contactForm.billingData.pec ? String(contactForm.billingData.pec).toLowerCase().substring(0, 100).trim() : undefined
        } : undefined
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

    // Data validation - ensure data structure matches service type
    if (serviceType === 'white-label') {
      if (!sanitizedData.canSelection) {
        console.error('❌ White Label request missing canSelection data')
        return NextResponse.json(
          { success: false, error: 'White Label requests require can selection data' },
          { status: 400 }
        )
      }
    } else if (serviceType === 'private-label') {
      if (!sanitizedData.beverageSelection || !sanitizedData.volumeFormatSelection || !sanitizedData.packagingSelection) {
        console.error('❌ Private Label request missing product configuration:', {
          hasBeverage: !!sanitizedData.beverageSelection,
          hasVolume: !!sanitizedData.volumeFormatSelection,
          hasPackaging: !!sanitizedData.packagingSelection
        })
        return NextResponse.json(
          { success: false, error: 'Private Label requests require complete product configuration' },
          { status: 400 }
        )
      }
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
  const emailSubject = `${data.contactForm.company || data.contactForm.firstName} - Nuova Richiesta ${isPrivateLabel ? 'PRIVATE LABEL' : 'WHITE LABEL'}`
  
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
        <h3 style="color: #333; margin-top: 0;">Dettagli Progetto:</h3>
        <ul style="list-style: none; padding: 0;">
          ${data.canSelection ? `
            <li><strong>Tipo:</strong> White Label</li>
            <li><strong>Quantità lattine:</strong> ${data.canSelection.quantity}</li>
            <li><strong>Prezzo totale:</strong> €${data.canSelection.totalPrice}</li>
          ` : ''}
          ${data.beverageSelection ? `
            <li><strong>Tipo:</strong> Private Label</li>
            <li><strong>Bevanda:</strong> ${getBeverageDisplayName(data.beverageSelection.selectedBeverage, data.beverageSelection.customBeverageText)}</li>
            ${data.volumeFormatSelection ? `<li><strong>Produzione:</strong> ${data.volumeFormatSelection.volumeLiters.toLocaleString()} litri × ${data.volumeFormatSelection.formatMl}ml = ${data.volumeFormatSelection.totalPieces.toLocaleString()} pezzi</li>` : ''}
            ${data.packagingSelection ? `<li><strong>Packaging:</strong> ${data.packagingSelection.packagingType === 'label' ? 'Etichetta Antiumidità' : 'Stampa Digitale'}</li>` : ''}
          ` : ''}
          <li><strong>Richiede campione:</strong> ${data.wantsSample ? 'SÌ (€50)' : 'NO'}</li>
        </ul>
      </div>

      <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Preferenze Contatto:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Modalità contatto preferita:</strong> ${data.contactForm.emailOnly ? '📧 SOLO EMAIL' : '📞 Telefono consentito'}</li>
          ${data.contactForm.emailOnly ? '' : `<li><strong>Consenso chiamata:</strong> ${data.contactForm.canCall ? 'SÌ' : 'NO'}</li>`}
          ${data.contactForm.canCall && !data.contactForm.emailOnly ? `<li><strong>Orario preferito:</strong> ${data.contactForm.preferredCallTime || 'Non specificato'}</li>` : ''}
        </ul>
      </div>

      ${data.contactForm.billingData && Object.values(data.contactForm.billingData).some(value => value) ? `
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #333; margin-top: 0;">📄 Dati Fatturazione (Cliente li ha compilati):</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.contactForm.billingData.vatNumber ? `<li><strong>Partita IVA:</strong> ${data.contactForm.billingData.vatNumber}</li>` : ''}
            ${data.contactForm.billingData.fiscalCode ? `<li><strong>Codice Fiscale:</strong> ${data.contactForm.billingData.fiscalCode}</li>` : ''}
            ${data.contactForm.billingData.legalName ? `<li><strong>Denominazione Sociale:</strong> ${data.contactForm.billingData.legalName}</li>` : ''}
            ${data.contactForm.billingData.billingAddress ? `<li><strong>Indirizzo:</strong> ${data.contactForm.billingData.billingAddress}</li>` : ''}
            ${data.contactForm.billingData.billingCity || data.contactForm.billingData.billingPostalCode || data.contactForm.billingData.billingProvince ? 
              `<li><strong>Città:</strong> ${data.contactForm.billingData.billingCity || ''} ${data.contactForm.billingData.billingPostalCode || ''} (${data.contactForm.billingData.billingProvince || ''})</li>` : ''}
            ${data.contactForm.billingData.sdi ? `<li><strong>Codice SDI:</strong> ${data.contactForm.billingData.sdi}</li>` : ''}
            ${data.contactForm.billingData.pec ? `<li><strong>Email PEC:</strong> ${data.contactForm.billingData.pec}</li>` : ''}
          </ul>
          <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0;">
            <strong>⚠️ IMPORTANTE:</strong> Il cliente ha compilato i dati fatturazione. Usare questi dati per la fattura.
          </p>
        </div>
      ` : ''}

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

// Email Customer Confirmation with language selection - Unified per White Label + Private Label
async function sendCustomerConfirmation(data: UnifiedQuoteData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY!
  
  const isItaly = data.country?.toLowerCase() === 'italy'
  
  // Send Italian email for Italy, English for all other countries
  if (isItaly) {
    await sendCustomerConfirmationItalian(data, RESEND_API_KEY)
  } else {
    await sendCustomerConfirmationEnglish(data, RESEND_API_KEY)
  }
}

// Helper function per leggere e convertire ZIP in base64 - Enterprise Edge Compatible
async function getTemplateAttachment(): Promise<{ filename: string; content: string } | null> {
  try {
    // Try multiple approaches for maximum compatibility
    // Approach 1: Direct URL fetch
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'production'
        ? 'https://configuratore-nextjs.vercel.app'  // Fallback production URL
        : 'http://localhost:3000'
    
    console.log('🔍 Trying to fetch template from:', `${baseUrl}/templates/Testi_template.zip`)
    const response = await fetch(`${baseUrl}/templates/Testi_template.zip`)
    
    if (!response.ok) {
      console.error('❌ Template ZIP not found via fetch:', response.status, baseUrl)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    console.log('📦 ZIP file size:', arrayBuffer.byteLength, 'bytes')
    
    const buffer = Buffer.from(arrayBuffer)
    const base64Content = buffer.toString('base64')
    console.log('✅ Base64 conversion successful, length:', base64Content.length)
    
    return {
      filename: 'white-label-templates.zip',
      content: base64Content
    }
  } catch (error) {
    console.error('❌ Error reading template ZIP via fetch:', error)
    return null
  }
}

// Italian customer confirmation - Unified per White Label + Private Label
async function sendCustomerConfirmationItalian(data: UnifiedQuoteData, RESEND_API_KEY: string): Promise<void> {
  const isPrivateLabel = data.serviceType === 'private-label'
  const emailSubject = `Conferma richiesta preventivo ${isPrivateLabel ? 'Private Label' : 'White Label'} - Configuratore Enterprise`
  
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
          per packaging ${isPrivateLabel ? 'Private Label' : 'White Label'} e ti contatteremo a breve.
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
            <strong style="color: #2d5a3d;">Dettagli progetto:</strong><br>
            <span style="color: #666;">
              Paese: ${data.country}<br>
              ${data.canSelection ? `
                Tipo: White Label<br>
                Quantità lattine: ${data.canSelection.quantity}<br>
                Prezzo totale: €${data.canSelection.totalPrice}<br>
              ` : ''}
              ${data.beverageSelection ? `
                Tipo: Private Label<br>
                Bevanda: ${getBeverageDisplayName(data.beverageSelection.selectedBeverage, data.beverageSelection.customBeverageText)}<br>
                ${data.volumeFormatSelection ? `Produzione: ${data.volumeFormatSelection.volumeLiters.toLocaleString()} litri × ${data.volumeFormatSelection.formatMl}ml<br>` : ''}
                ${data.packagingSelection ? `Packaging: ${data.packagingSelection.packagingType === 'label' ? 'Etichetta Antiumidità' : 'Stampa Digitale'}<br>` : ''}
              ` : ''}
              Campione richiesto: ${data.wantsSample ? 'SÌ (€50)' : 'NO'}
            </span>
          </div>
        </div>

        ${data.contactForm.billingData && Object.values(data.contactForm.billingData).some(value => value) ? `
          <div style="background: #fff9e6; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">📄 Dati fatturazione confermati:</h3>
            <div style="color: #333; font-size: 14px; line-height: 1.5;">
              ${data.contactForm.billingData.legalName ? `<strong>Denominazione:</strong> ${data.contactForm.billingData.legalName}<br>` : ''}
              ${data.contactForm.billingData.vatNumber ? `<strong>P.IVA:</strong> ${data.contactForm.billingData.vatNumber}<br>` : ''}
              ${data.contactForm.billingData.fiscalCode ? `<strong>C.F.:</strong> ${data.contactForm.billingData.fiscalCode}<br>` : ''}
              ${data.contactForm.billingData.billingAddress ? `<strong>Indirizzo:</strong> ${data.contactForm.billingData.billingAddress}<br>` : ''}
              ${data.contactForm.billingData.billingCity || data.contactForm.billingData.billingPostalCode ? 
                `<strong>Città:</strong> ${data.contactForm.billingData.billingCity || ''} ${data.contactForm.billingData.billingPostalCode || ''}<br>` : ''}
              ${data.contactForm.billingData.sdi ? `<strong>SDI:</strong> ${data.contactForm.billingData.sdi}<br>` : ''}
              ${data.contactForm.billingData.pec ? `<strong>PEC:</strong> ${data.contactForm.billingData.pec}<br>` : ''}
            </div>
            <p style="color: #856404; font-size: 12px; margin: 15px 0 0 0; font-style: italic;">
              La fattura sarà emessa con questi dati specifici che hai fornito.
            </p>
          </div>
        ` : ''}
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">📞 Come ti contatteremo:</h3>
          <div style="color: #333; margin: 10px 0;">
            ${data.contactForm.emailOnly 
              ? '<strong style="color: #2d5a3d;">📧 Ti contatteremo esclusivamente via email</strong> come da tua richiesta.' 
              : data.contactForm.canCall 
                ? `<strong style="color: #2d5a3d;">📞 Ti contatteremo telefonicamente</strong> ${data.contactForm.preferredCallTime ? `preferibilmente ${data.contactForm.preferredCallTime.toLowerCase()}` : ''} oppure via email.`
                : '<strong style="color: #2d5a3d;">📧 Ti contatteremo via email</strong> (non hai dato consenso alle chiamate).'
            }
          </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">🚀 Prossimi passi:</h3>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Analizzeremo la tua richiesta entro 24 ore</li>
            <li style="margin: 8px 0;">Ti invieremo un preventivo dettagliato personalizzato</li>
            <li style="margin: 8px 0;">Un nostro esperto ti contatterà per finalizzare i dettagli</li>
            ${data.wantsSample ? '<li style="margin: 8px 0;">Il campione verrà spedito dopo conferma pagamento</li>' : ''}
            ${data.serviceType === 'white-label' ? '<li style="margin: 8px 0;"><strong>📎 Template allegati:</strong> Trovi i template ZIP in allegato per iniziare subito</li>' : ''}
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
          Configuratore Enterprise - ${isPrivateLabel ? 'Private Label' : 'White Label'} Packaging<br>
          Email di conferma generata automaticamente
        </p>
      </div>
    </div>
  `

  // Prepara allegato ZIP solo per White Label
  const attachment = data.serviceType === 'white-label' ? await getTemplateAttachment() : null
  
  const emailPayload: {
    from: string
    to: string
    subject: string
    html: string
    attachments?: Array<{ filename: string; content: string; type?: string; disposition?: string }>
  } = {
    from: 'onboarding@resend.dev',
    to: 'a.guarnieri.portfolio@gmail.com', // TEMP: Solo email verificata per testing
    subject: `${emailSubject} - Per: ${data.contactForm.email}`,
    html: emailContent
  }
  
  // Aggiungi allegato se disponibile e se è White Label
  if (attachment && data.serviceType === 'white-label') {
    emailPayload.attachments = [{
      filename: attachment.filename,
      content: attachment.content,
      type: 'application/zip',
      disposition: 'attachment'
    }]
    console.log('📎 Adding ZIP attachment:', attachment.filename, 'Size:', attachment.content.length)
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
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
                Beverage: ${getBeverageDisplayNameEnglish(data.beverageSelection.selectedBeverage, data.beverageSelection.customBeverageText)}<br>
                ${data.volumeFormatSelection ? `Production: ${data.volumeFormatSelection.volumeLiters.toLocaleString()} liters × ${data.volumeFormatSelection.formatMl}ml<br>` : ''}
                ${data.packagingSelection ? `Packaging: ${data.packagingSelection.packagingType === 'label' ? 'Anti-humidity Label' : 'Digital Print'}<br>` : ''}
              ` : ''}
              Sample requested: ${data.wantsSample ? 'YES (€50)' : 'NO'}
            </span>
          </div>
        </div>

        ${data.contactForm.billingData && Object.values(data.contactForm.billingData).some(value => value) ? `
          <div style="background: #fff9e6; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">📄 Billing information confirmed:</h3>
            <div style="color: #333; font-size: 14px; line-height: 1.5;">
              ${data.contactForm.billingData.legalName ? `<strong>Company Name:</strong> ${data.contactForm.billingData.legalName}<br>` : ''}
              ${data.contactForm.billingData.vatNumber ? `<strong>VAT Number:</strong> ${data.contactForm.billingData.vatNumber}<br>` : ''}
              ${data.contactForm.billingData.fiscalCode ? `<strong>Tax Code:</strong> ${data.contactForm.billingData.fiscalCode}<br>` : ''}
              ${data.contactForm.billingData.billingAddress ? `<strong>Address:</strong> ${data.contactForm.billingData.billingAddress}<br>` : ''}
              ${data.contactForm.billingData.billingCity || data.contactForm.billingData.billingPostalCode ? 
                `<strong>City:</strong> ${data.contactForm.billingData.billingCity || ''} ${data.contactForm.billingData.billingPostalCode || ''}<br>` : ''}
              ${data.contactForm.billingData.sdi ? `<strong>SDI Code:</strong> ${data.contactForm.billingData.sdi}<br>` : ''}
              ${data.contactForm.billingData.pec ? `<strong>PEC Email:</strong> ${data.contactForm.billingData.pec}<br>` : ''}
            </div>
            <p style="color: #856404; font-size: 12px; margin: 15px 0 0 0; font-style: italic;">
              The invoice will be issued with these specific data you provided.
            </p>
          </div>
        ` : ''}
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">📞 How we'll contact you:</h3>
          <div style="color: #333; margin: 10px 0;">
            ${data.contactForm.emailOnly 
              ? '<strong style="color: #2d5a3d;">📧 We will contact you exclusively via email</strong> as requested.' 
              : data.contactForm.canCall 
                ? `<strong style="color: #2d5a3d;">📞 We will contact you by phone</strong> ${data.contactForm.preferredCallTime ? `preferably in the ${data.contactForm.preferredCallTime.toLowerCase()}` : ''} or via email.`
                : '<strong style="color: #2d5a3d;">📧 We will contact you via email</strong> (you did not consent to phone calls).'
            }
          </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2d5a3d; margin-top: 0; font-size: 16px;">🚀 Next steps:</h3>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li style="margin: 8px 0;">We'll analyze your request within 24 hours</li>
            <li style="margin: 8px 0;">You'll receive a detailed personalized quote</li>
            <li style="margin: 8px 0;">Our expert will contact you to finalize details</li>
            ${data.wantsSample ? '<li style="margin: 8px 0;">Sample will be shipped after payment confirmation</li>' : ''}
            ${data.serviceType === 'white-label' ? '<li style="margin: 8px 0;"><strong>📎 Templates attached:</strong> Find the ZIP templates attached to get started immediately</li>' : ''}
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

  // Prepara allegato ZIP solo per White Label
  const attachment = data.serviceType === 'white-label' ? await getTemplateAttachment() : null
  
  const emailPayload: {
    from: string
    to: string
    subject: string
    html: string
    attachments?: Array<{ filename: string; content: string; type?: string; disposition?: string }>
  } = {
    from: 'onboarding@resend.dev',
    to: 'a.guarnieri.portfolio@gmail.com', // TEMP: Solo email verificata per testing
    subject: `${emailSubject} - For: ${data.contactForm.email}`,
    html: emailContent
  }
  
  // Aggiungi allegato se disponibile e se è White Label
  if (attachment && data.serviceType === 'white-label') {
    emailPayload.attachments = [{
      filename: attachment.filename,
      content: attachment.content,
      type: 'application/zip',
      disposition: 'attachment'
    }]
    console.log('📎 Adding ZIP attachment:', attachment.filename, 'Size:', attachment.content.length)
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`English customer email failed: ${errorData.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ English customer confirmation sent to:', data.contactForm.email, '- ID:', result.id)
}