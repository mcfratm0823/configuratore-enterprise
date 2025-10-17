import { NextRequest, NextResponse } from 'next/server'

// Enterprise type definitions
interface ContactForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  canCall: boolean
  preferredCallTime: string
}

interface CanSelection {
  quantity: number
  totalPrice: number
}

interface QuoteRequestData {
  contactForm: ContactForm
  canSelection: CanSelection | null
  wantsSample: boolean
  country: string
  submittedAt: string
  ip: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const formData = await request.json()
    
    // Validation base
    const { contactForm, canSelection, wantsSample, country } = formData
    
    if (!contactForm || !contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required contact information' },
        { status: 400 }
      )
    }

    // Sanitizzazione dati enterprise
    const sanitizedData = {
      contactForm: {
        firstName: String(contactForm.firstName).substring(0, 50).trim(),
        lastName: String(contactForm.lastName).substring(0, 50).trim(),
        email: String(contactForm.email).toLowerCase().substring(0, 100).trim(),
        phone: String(contactForm.phone || '').substring(0, 20).trim(),
        company: String(contactForm.company || '').substring(0, 100).trim(),
        canCall: Boolean(contactForm.canCall),
        preferredCallTime: String(contactForm.preferredCallTime || '').substring(0, 20)
      },
      canSelection: canSelection ? {
        quantity: Math.min(Math.max(1, Number(canSelection.quantity)), 10000),
        totalPrice: Number(canSelection.totalPrice) || 0
      } : null,
      wantsSample: Boolean(wantsSample),
      country: String(country || '').substring(0, 50),
      submittedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }


    // Invio email con Resend
    try {
      await sendNotificationEmail(sanitizedData)
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

// Funzione email enterprise con Resend
async function sendNotificationEmail(data: QuoteRequestData): Promise<{ success: boolean }> {
  // Verifica chiave Resend
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables')
    console.log('📧 Email notification (NO API KEY - FALLING BACK TO CONSOLE LOG):', {
      customer: `${data.contactForm.firstName} ${data.contactForm.lastName}`,
      email: data.contactForm.email,
      company: data.contactForm.company,
      quantity: data.canSelection?.quantity,
      wantsSample: data.wantsSample,
      timestamp: new Date().toISOString()
    })
    return { success: true }
  }

  try {
    // Chiamata diretta API Resend (senza SDK per evitare dependency issues)
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    console.log('🔑 RESEND_API_KEY found:', RESEND_API_KEY ? 'YES' : 'NO')

    // Contenuto email enterprise
    const emailSubject = `Nuova Richiesta Quote White Label - ${data.contactForm.company || data.contactForm.firstName}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a3d;">Nuova Richiesta di Preventivo White Label</h2>
        
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

    // Chiamata diretta API Resend (senza SDK)
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
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`)
    }

    const result = await response.json()

    console.log('✅ Email inviata con successo:', {
      id: result.id,
      customer: `${data.contactForm.firstName} ${data.contactForm.lastName}`,
      email: data.contactForm.email,
      company: data.contactForm.company
    })

    return { success: true }
    
  } catch (error: unknown) {
    console.error('❌ Errore invio email Resend:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}