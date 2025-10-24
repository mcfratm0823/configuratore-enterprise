import { NextRequest } from 'next/server'
import { POST } from '@/app/api/create-checkout-session/route'

// Mock Stripe
const mockStripeCreate = jest.fn()
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeCreate
      }
    }
  }))
})

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

describe('/api/create-checkout-session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStripeCreate.mockResolvedValue({
      id: 'cs_test_mock',
      url: 'https://checkout.stripe.com/pay/cs_test_mock'
    })
  })

  test('creates checkout session for White Label', async () => {
    const requestData = {
      customerEmail: 'mario@test.com',
      customerName: 'Mario Rossi',
      amount: 5000,
      sessionId: 'test-session-123',
      customerData: {
        contactForm: {
          firstName: 'Mario',
          lastName: 'Rossi',
          email: 'mario@test.com',
          phone: '1234567890',
          company: 'Test Corp',
          canCall: true,
          preferredCallTime: 'Mattina',
          emailOnly: false
        },
        canSelection: {
          quantity: 600,
          totalPrice: 1200
        },
        country: 'Italy',
        serviceType: 'white-label'
      }
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.sessionId).toBe('cs_test_mock')
    expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_mock')

    // Verify essential Stripe call parameters
    expect(mockStripeCreate).toHaveBeenCalledTimes(1)
    const stripeCall = mockStripeCreate.mock.calls[0][0]
    
    expect(stripeCall.payment_method_types).toEqual(['card'])
    expect(stripeCall.mode).toBe('payment')
    expect(stripeCall.line_items[0].price_data.unit_amount).toBe(5000)
    expect(stripeCall.line_items[0].price_data.currency).toBe('eur')
    expect(stripeCall.metadata.service_type).toBe('white-label')
    expect(stripeCall.metadata.session_id).toBe('test-session-123')
    expect(stripeCall.metadata.customer_name).toBe('Mario Rossi')
  })

  test('creates checkout session for Private Label', async () => {
    const requestData = {
      customerEmail: 'anna@test.com',
      customerName: 'Anna Bianchi',
      amount: 5000,
      sessionId: 'test-session-456',
      customerData: {
        contactForm: {
          firstName: 'Anna',
          lastName: 'Bianchi',
          email: 'anna@test.com',
          phone: '0987654321',
          company: 'Private Corp',
          canCall: false,
          preferredCallTime: '',
          emailOnly: true
        },
        beverageSelection: {
          selectedBeverage: 'cold-brew-plain',
          customBeverageText: '',
          isCustom: false
        },
        volumeFormatSelection: {
          volumeLiters: 1000,
          formatMl: 330,
          totalPieces: 3030,
          cartonsCount: 126,
          isCustomVolume: false
        },
        packagingSelection: {
          selectedPackaging: 'label',
          packagingType: 'label'
        },
        country: 'Germany',
        serviceType: 'private-label'
      }
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify essential Stripe call parameters
    expect(mockStripeCreate).toHaveBeenCalledTimes(1)
    const stripeCall = mockStripeCreate.mock.calls[0][0]
    
    expect(stripeCall.payment_method_types).toEqual(['card'])
    expect(stripeCall.mode).toBe('payment')
    expect(stripeCall.line_items[0].price_data.unit_amount).toBe(5000)
    expect(stripeCall.line_items[0].price_data.currency).toBe('eur')
    expect(stripeCall.metadata.service_type).toBe('private-label')
    expect(stripeCall.metadata.customer_name).toBe('Anna Bianchi')
  })

  test('handles missing contact form', async () => {
    const requestData = {
      canSelection: {
        quantity: 600,
        totalPrice: 1200
      }
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Customer data required')
  })

  test('handles White Label without can selection', async () => {
    const requestData = {
      contactForm: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        phone: '123',
        company: 'Test',
        canCall: true,
        preferredCallTime: '',
        emailOnly: false
      },
      serviceType: 'white-label'
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Customer data required')
  })

  test('handles Private Label without complete configuration', async () => {
    const requestData = {
      contactForm: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        phone: '123',
        company: 'Test',
        canCall: true,
        preferredCallTime: '',
        emailOnly: false
      },
      serviceType: 'private-label',
      beverageSelection: {
        selectedBeverage: 'cold-brew-plain',
        isCustom: false
      }
      // Missing volumeFormatSelection and packagingSelection
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Customer data required')
  })

  test('handles Stripe API errors', async () => {
    mockStripeCreate.mockRejectedValue(new Error('Stripe API Error'))

    const requestData = {
      customerEmail: 'test@test.com',
      customerName: 'Test User',
      amount: 5000,
      sessionId: 'test-session-error',
      customerData: {
        contactForm: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          phone: '123',
          company: 'Test',
          canCall: true,
          preferredCallTime: '',
          emailOnly: false
        },
        canSelection: {
          quantity: 600,
          totalPrice: 1200
        },
        country: 'Italy',
        serviceType: 'white-label'
      }
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Payment session creation failed')
  })

  test('splits large metadata correctly', async () => {
    const longCustomText = 'A'.repeat(400) // Long text that would exceed metadata limits
    
    const requestData = {
      customerEmail: 'test@test.com',
      customerName: 'Test User',
      amount: 5000,
      sessionId: 'test-session-metadata',
      customerData: {
        contactForm: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          phone: '123',
          company: 'Test Company With Very Long Name',
          canCall: true,
          preferredCallTime: 'Mattina dalle 9 alle 12',
          emailOnly: false
        },
        beverageSelection: {
          selectedBeverage: 'rd-custom',
          customBeverageText: longCustomText,
          isCustom: true
        },
        volumeFormatSelection: {
          volumeLiters: 2000,
          formatMl: 500,
          totalPieces: 4000,
          cartonsCount: 167,
          isCustomVolume: false
        },
        packagingSelection: {
          selectedPackaging: 'digital',
          packagingType: 'digital'
        },
        country: 'Germany',
        serviceType: 'private-label'
      }
    }

    const request = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    // Verify metadata handling for large text
    expect(mockStripeCreate).toHaveBeenCalledTimes(1)
    const stripeCall = mockStripeCreate.mock.calls[0][0]
    expect(stripeCall.metadata.service_type).toBe('private-label')
    expect(stripeCall.metadata.full_beverage_text).toBe(longCustomText)
  })
})