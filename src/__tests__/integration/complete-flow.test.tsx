import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfiguratorWizard } from '@/features/configurator/components/ConfiguratorWizard'
import { ConfiguratorProvider } from '@/context/ConfiguratorContext'

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    redirectToCheckout: jest.fn(() => Promise.resolve({ error: null }))
  })),
}))

// Mock API calls
global.fetch = jest.fn()

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ConfiguratorProvider>
      {component}
    </ConfiguratorProvider>
  )
}

describe('Complete Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      })
    })
  })

  test('completes White Label flow without sample', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)

    // Step 1: Select country
    await user.click(screen.getByRole('button', { name: /italy/i }))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 2: Select service type
    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /white label/i }))

    // Step 3: Select can quantity
    await waitFor(() => {
      expect(screen.getByText('Step 3 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/600 Lattine/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 4: Quote display
    await waitFor(() => {
      expect(screen.getByText('Step 4 di 6')).toBeInTheDocument()
    })
    expect(screen.getByText(/€1\.200/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 5: Template download
    await waitFor(() => {
      expect(screen.getByText('Step 5 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 6: Contact form
    await waitFor(() => {
      expect(screen.getByText('Step 6 di 6')).toBeInTheDocument()
    })

    // Fill contact form
    await user.type(screen.getByLabelText(/nome/i), 'Mario')
    await user.type(screen.getByLabelText(/cognome/i), 'Rossi')
    await user.type(screen.getByLabelText(/email/i), 'mario@test.com')
    await user.type(screen.getByLabelText(/telefono/i), '1234567890')
    await user.type(screen.getByLabelText(/azienda/i), 'Test Corp')

    // Submit without sample
    const submitButton = screen.getByRole('button', { name: /invia richiesta/i })
    await user.click(submitButton)

    // Should call API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/submit-quote-request',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('mario@test.com')
        })
      )
    })
  })

  test('completes White Label flow with sample payment', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)

    // Navigate to Step 1 and enable sample
    const sampleToggle = screen.getByRole('checkbox')
    await user.click(sampleToggle)
    expect(sampleToggle).toBeChecked()

    // Complete flow to Step 6
    await user.click(screen.getByRole('button', { name: /italy/i }))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /white label/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 3 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/600 Lattine/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Skip quote and template steps
    await waitFor(() => {
      expect(screen.getByText('Step 4 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 5 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Fill contact form
    await waitFor(() => {
      expect(screen.getByText('Step 6 di 6')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/nome/i), 'Mario')
    await user.type(screen.getByLabelText(/cognome/i), 'Rossi')
    await user.type(screen.getByLabelText(/email/i), 'mario@test.com')
    await user.type(screen.getByLabelText(/telefono/i), '1234567890')
    await user.type(screen.getByLabelText(/azienda/i), 'Test Corp')

    // Click payment button
    const paymentButton = screen.getByRole('button', { name: /paga campione/i })
    await user.click(paymentButton)

    // Should call Stripe API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('mario@test.com')
        })
      )
    })
  })

  test('completes Private Label flow', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)

    // Step 1: Select country
    await user.click(screen.getByRole('button', { name: /italy/i }))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 2: Select Private Label
    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /private label/i }))

    // Step 3: Select beverage
    await waitFor(() => {
      expect(screen.getByText('Step 3 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/Cold Brew Coffee/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 4: Select volume and format
    await waitFor(() => {
      expect(screen.getByText('Step 4 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/1000L/i))
    await user.click(screen.getByText(/330ml/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 5: Select packaging
    await waitFor(() => {
      expect(screen.getByText('Step 5 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/Etichetta Antiumidità/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Step 6: Contact form
    await waitFor(() => {
      expect(screen.getByText('Step 6 di 6')).toBeInTheDocument()
    })

    // Fill contact form
    await user.type(screen.getByLabelText(/nome/i), 'Anna')
    await user.type(screen.getByLabelText(/cognome/i), 'Bianchi')
    await user.type(screen.getByLabelText(/email/i), 'anna@test.com')
    await user.type(screen.getByLabelText(/telefono/i), '0987654321')
    await user.type(screen.getByLabelText(/azienda/i), 'Private Corp')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /invia richiesta/i })
    await user.click(submitButton)

    // Should call API with Private Label data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/submit-quote-request',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('anna@test.com')
        })
      )
    })
  })

  test('handles navigation back and forth', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)

    // Go forward
    await user.click(screen.getByRole('button', { name: /italy/i }))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })

    // Go back
    await user.click(screen.getByRole('button', { name: /indietro/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 1 di 6')).toBeInTheDocument()
    })

    // Italy should still be selected
    expect(screen.getByRole('button', { name: /italy/i })).toHaveClass('border-green-600')
  })

  test('handles email-only contact preference', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)

    // Navigate to contact form
    await user.click(screen.getByRole('button', { name: /italy/i }))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /white label/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 3 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/600 Lattine/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Skip to contact form
    await waitFor(() => {
      expect(screen.getByText('Step 4 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 5 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 6 di 6')).toBeInTheDocument()
    })

    // Enable email-only preference
    const emailOnlyCheckbox = screen.getByRole('checkbox', { name: /solo via email/i })
    await user.click(emailOnlyCheckbox)

    // Phone options should be disabled
    const canCallCheckbox = screen.getByRole('checkbox', { name: /posso chiamarti/i })
    expect(canCallCheckbox).toBeDisabled()

    // Fill required fields
    await user.type(screen.getByLabelText(/nome/i), 'Test')
    await user.type(screen.getByLabelText(/cognome/i), 'User')
    await user.type(screen.getByLabelText(/email/i), 'test@test.com')

    // Submit
    const submitButton = screen.getByRole('button', { name: /invia richiesta/i })
    await user.click(submitButton)

    // Should include emailOnly: true in the request
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/submit-quote-request',
        expect.objectContaining({
          body: expect.stringContaining('"emailOnly":true')
        })
      )
    })
  })

  test('validates required fields before submission', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)

    // Navigate to contact form quickly
    await user.click(screen.getByRole('button', { name: /italy/i }))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /white label/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 3 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByText(/600 Lattine/i))
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    // Skip to final step
    await waitFor(() => {
      expect(screen.getByText('Step 4 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 5 di 6')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /avanti/i }))

    await waitFor(() => {
      expect(screen.getByText('Step 6 di 6')).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /invia richiesta/i })
    
    // Button should be disabled or form should not submit
    expect(submitButton).toBeDisabled()
  })
})