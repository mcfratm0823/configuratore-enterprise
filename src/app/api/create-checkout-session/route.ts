import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verifica chiave Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }

    // Parse request body
    const { customerEmail, customerName, amount, sessionId } = await request.json()

    // Validation enterprise
    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { success: false, error: 'Customer data required' },
        { status: 400 }
      )
    }

    if (amount !== 5000) { // €50 in centesimi
      return NextResponse.json(
        { success: false, error: 'Invalid amount for sample order' },
        { status: 400 }
      )
    }

    // Import Stripe dinamicamente
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      metadata: {
        type: 'sample_request',
        customer_name: customerName,
        session_id: sessionId || 'unknown',
        amount: '50.00'
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
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment session creation failed' 
      },
      { status: 500 }
    )
  }
}