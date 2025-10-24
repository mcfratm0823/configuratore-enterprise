import { NextRequest } from 'next/server'
import { POST } from '@/app/api/submit-quote-request/route'

// Mock fetch for Resend API
global.fetch = jest.fn()

// Mock environment variables
process.env.RESEND_API_KEY = 'test_resend_key'

describe('/api/submit-quote-request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email_test_id' })
    })
  })

  test('successfully submits White Label quote request', async () => {
    const requestData = {
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
      wantsSample: true,
      country: 'Italy',
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Quote request submitted successfully')
    expect(data.quoteId).toMatch(/^quote_\d+_/)

    // Should have called Resend API twice (admin + customer)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  test('successfully submits Private Label quote request', async () => {
    const requestData = {
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
      wantsSample: false,
      country: 'Germany',
      requestType: 'private-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Should have sent emails
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  test('handles missing contact information', async () => {
    const requestData = {
      canSelection: {
        quantity: 600,
        totalPrice: 1200
      },
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Missing required contact information')
  })

  test('validates White Label requires can selection', async () => {
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
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('White Label requests require can selection data')
  })

  test('validates Private Label requires complete configuration', async () => {
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
      beverageSelection: {
        selectedBeverage: 'cold-brew-plain',
        isCustom: false
      },
      // Missing volumeFormatSelection and packagingSelection
      requestType: 'private-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Private Label requests require complete product configuration')
  })

  test('handles invalid request type', async () => {
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
      requestType: 'invalid-type'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid service type request')
  })

  test('sanitizes input data correctly', async () => {
    const requestData = {
      contactForm: {
        firstName: 'A'.repeat(100), // Too long
        lastName: 'B'.repeat(100), // Too long
        email: 'TEST@EXAMPLE.COM', // Should be lowercased
        phone: '123456789012345678901234567890', // Too long
        company: 'C'.repeat(200), // Too long
        canCall: 'true', // String instead of boolean
        preferredCallTime: 'D'.repeat(50), // Too long
        emailOnly: 1 // Number instead of boolean
      },
      canSelection: {
        quantity: 999999, // Too high
        totalPrice: 1200
      },
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify sanitization by checking email calls
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        body: expect.stringContaining('test@example.com') // Lowercased email
      })
    )
  })

  test('handles email sending failure gracefully', async () => {
    // Mock fetch to fail
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Email API Error'))

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
      canSelection: {
        quantity: 600,
        totalPrice: 1200
      },
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    const response = await POST(request)
    const data = await response.json()

    // Should still return success even if email fails
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  test('sends Italian email for Italy', async () => {
    const requestData = {
      contactForm: {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario@test.com',
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
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    await POST(request)

    // Check that Italian email was sent
    const emailCalls = (global.fetch as jest.Mock).mock.calls.filter(
      call => call[0] === 'https://api.resend.com/emails'
    )
    
    expect(emailCalls).toHaveLength(2)
    
    // Customer email should be in Italian
    const customerEmailCall = emailCalls.find(call => {
      const body = JSON.parse(call[1].body)
      return body.subject.includes('Conferma richiesta preventivo')
    })
    expect(customerEmailCall).toBeDefined()
  })

  test('sends English email for other countries', async () => {
    const requestData = {
      contactForm: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
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
      country: 'Germany',
      requestType: 'white-label-quote'
    }

    const request = new NextRequest('http://localhost:3000/api/submit-quote-request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })

    await POST(request)

    // Check that English email was sent
    const emailCalls = (global.fetch as jest.Mock).mock.calls.filter(
      call => call[0] === 'https://api.resend.com/emails'
    )
    
    // Customer email should be in English
    const customerEmailCall = emailCalls.find(call => {
      const body = JSON.parse(call[1].body)
      return body.subject.includes('Quote Request Confirmation')
    })
    expect(customerEmailCall).toBeDefined()
  })
})