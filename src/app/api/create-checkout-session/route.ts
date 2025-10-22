import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔧 DEBUG: Starting checkout session creation')
  console.log('🔧 DEBUG: STRIPE_SECRET_KEY exists?', !!process.env.STRIPE_SECRET_KEY)
  console.log('🔧 DEBUG: request.nextUrl.origin:', request.nextUrl.origin)
  
  try {
    // Verifica chiave Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured')
      throw new Error('Stripe secret key not configured')
    }

    // Parse request body
    const { customerEmail, customerName, amount, sessionId, customerData } = await request.json()
    
    console.log('🔧 DEBUG: Request data:', { customerEmail, customerName, amount, sessionId })

    // Validation enterprise
    if (!customerEmail || !customerName || !customerData) {
      console.error('❌ Missing customer data:', { customerEmail: !!customerEmail, customerName: !!customerName, customerData: !!customerData })
      return NextResponse.json(
        { success: false, error: 'Customer data required' },
        { status: 400 }
      )
    }

    if (amount !== 5000) { // €50 in centesimi
      console.error('❌ Invalid amount:', amount, 'expected: 5000')
      return NextResponse.json(
        { success: false, error: 'Invalid amount for sample order' },
        { status: 400 }
      )
    }

    // Import Stripe dinamicamente per Next.js enterprise
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Crea Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Campione White Label - 200ml',
              description: 'Campione lattine 200ml per test etichette personalizzate',
              images: [], // TODO: Aggiungere immagine prodotto
            },
            unit_amount: amount, // €50.00 in centesimi
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `https://configuratore-enterprise.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://configuratore-enterprise.vercel.app/cancel`,
      metadata: {
        type: 'sample_request',
        customer_name: customerName,
        session_id: sessionId || 'unknown',
        amount: '50.00',
        service_type: customerData.serviceType || 'white-label',
        // Dividiamo i dati in più campi per rispettare il limite 500 char
        contact_data: JSON.stringify(customerData.contactForm || {}),
        config_data: JSON.stringify({
          country: customerData.country,
          canSelection: customerData.canSelection,
          beverageSelection: customerData.beverageSelection ? {
            ...customerData.beverageSelection,
            // Tronca il testo custom per metadata (max 100 char)
            customBeverageText: customerData.beverageSelection.customBeverageText?.substring(0, 100) || ''
          } : null,
          volumeFormatSelection: customerData.volumeFormatSelection,
          packagingSelection: customerData.packagingSelection,
          wantsSample: customerData.wantsSample
        }),
        // Salviamo il testo completo in un campo separato (per le email)
        full_beverage_text: customerData.beverageSelection?.customBeverageText?.substring(0, 450) || ''
      },
      // Enterprise settings
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['IT', 'DE', 'FR', 'ES', 'AT', 'BE', 'NL', 'CH']
      }
    })


    // Risposta successo
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
    
  } catch (error: unknown) {
    // Enterprise error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Stripe checkout session creation failed:', errorMessage)
    console.error('❌ Full error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Payment session creation failed: ${errorMessage}` 
      },
      { status: 500 }
    )
  }
}