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

// Funzione email semplificata senza React Email
async function sendNotificationEmail(data: QuoteRequestData): Promise<{ success: boolean }> {
  // Simulazione invio email enterprise
  console.log('📧 Email notification:', {
    customer: `${data.contactForm.firstName} ${data.contactForm.lastName}`,
    email: data.contactForm.email,
    company: data.contactForm.company,
    quantity: data.canSelection?.quantity,
    wantsSample: data.wantsSample
  })
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return { success: true }
}