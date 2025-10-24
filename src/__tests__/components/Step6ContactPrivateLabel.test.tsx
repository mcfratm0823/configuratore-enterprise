import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Step6ContactPrivateLabel } from '@/features/configurator/components/steps/Step6ContactPrivateLabel'
import { ConfiguratorProvider, useConfigurator, ServiceSubType } from '@/context/ConfiguratorContext'

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    redirectToCheckout: jest.fn(() => Promise.resolve({ error: null }))
  })),
}))

global.fetch = jest.fn()

// Helper component that wraps the actual component and provides pre-configured context
const PrivateLabelTestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { actions, state } = useConfigurator()
  const [isSetup, setIsSetup] = React.useState(false)
  
  React.useEffect(() => {
    if (!isSetup) {
      // Set up all required context for Private Label
      actions.setServiceSubType(ServiceSubType.PRIVATELABEL)
      actions.setPackagingSelection({
        selectedPackaging: 'label',
        packagingType: 'label'
      })
      actions.setBeverageSelection({
        selectedBeverage: 'cold-brew-plain',
        customBeverageText: '',
        isCustom: false
      })
      actions.setVolumeFormatSelection({
        volumeLiters: 1000,
        formatMl: 330,
        totalPieces: 3030,
        cartonsCount: 126,
        isCustomVolume: false
      })
      actions.setCountry('italy')
      setIsSetup(true)
    }
  }, [isSetup, actions])
  
  // Only render children after setup is complete
  if (!isSetup || state.serviceSubType !== ServiceSubType.PRIVATELABEL) {
    return <div>Setting up test...</div>
  }
  
  return <>{children}</>
}

const renderWithProviderForPrivateLabel = (component: React.ReactElement) => {
  return render(
    <ConfiguratorProvider>
      <PrivateLabelTestWrapper>
        {component}
      </PrivateLabelTestWrapper>
    </ConfiguratorProvider>
  )
}

// Also keep the simple provider for other tests that don't need setup
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ConfiguratorProvider>
      {component}
    </ConfiguratorProvider>
  )
}

describe('Step6ContactPrivateLabel', () => {
  const mockOnBack = jest.fn()

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

  test('renders contact form fields', () => {
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    // Check for labels
    expect(screen.getByText(/Nome \*/)).toBeInTheDocument()
    expect(screen.getByText(/Cognome \*/)).toBeInTheDocument()
    expect(screen.getByText(/Email \*/)).toBeInTheDocument()
    expect(screen.getByText(/Numero di Telefono \*/)).toBeInTheDocument()
    expect(screen.getByText(/Azienda \*/)).toBeInTheDocument()
    
    // Check for input fields by placeholder
    expect(screen.getByPlaceholderText(/il tuo nome/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/il tuo cognome/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email@esempio.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/\+39 123 456 7890/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/la tua azienda/i)).toBeInTheDocument()
  })

  test('renders email-only contact preference', () => {
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    expect(screen.getByText(/Voglio essere contattato esclusivamente via email/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  test('email-only preference disables phone options', async () => {
    const user = userEvent.setup()
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    const emailOnlyCheckbox = screen.getByRole('checkbox', { name: /solo via email/i })
    const canCallCheckbox = screen.getByRole('checkbox', { name: /posso chiamarti/i })
    
    expect(canCallCheckbox).not.toBeDisabled()
    
    await user.click(emailOnlyCheckbox)
    expect(canCallCheckbox).toBeDisabled()
  })

  test('renders sample toggle and payment options', () => {
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    expect(screen.getByText(/richiedi campione/i)).toBeInTheDocument()
    expect(screen.getByText(/€50/)).toBeInTheDocument()
  })

  test('shows payment button when sample is requested', async () => {
    const user = userEvent.setup()
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    // Enable sample
    const sampleToggle = screen.getByRole('checkbox')
    await user.click(sampleToggle)
    
    expect(screen.getByRole('button', { name: /paga campione/i })).toBeInTheDocument()
  })

  test('shows submit button when sample is not requested', () => {
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    expect(screen.getByRole('button', { name: /invia richiesta/i })).toBeInTheDocument()
  })

  test('validates required fields', async () => {
    const user = userEvent.setup()
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    const submitButton = screen.getByRole('button', { name: /invia richiesta/i })
    expect(submitButton).toBeDisabled()
    
    // Fill required fields
    await user.type(screen.getByLabelText(/nome/i), 'Test')
    await user.type(screen.getByLabelText(/cognome/i), 'User')
    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  test('submits form without sample', async () => {
    const user = userEvent.setup()
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    // Fill form
    await user.type(screen.getByLabelText(/nome/i), 'Anna')
    await user.type(screen.getByLabelText(/cognome/i), 'Bianchi')
    await user.type(screen.getByLabelText(/email/i), 'anna@test.com')
    await user.type(screen.getByLabelText(/telefono/i), '123456789')
    await user.type(screen.getByLabelText(/azienda/i), 'Test Corp')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /invia richiesta/i })
    await user.click(submitButton)
    
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

  test('handles Stripe payment flow', async () => {
    const user = userEvent.setup()
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    // Enable sample
    const sampleToggle = screen.getByRole('checkbox')
    await user.click(sampleToggle)
    
    // Fill form
    await user.type(screen.getByLabelText(/nome/i), 'Anna')
    await user.type(screen.getByLabelText(/cognome/i), 'Bianchi')
    await user.type(screen.getByLabelText(/email/i), 'anna@test.com')
    
    // Click payment
    const paymentButton = screen.getByRole('button', { name: /paga campione/i })
    await user.click(paymentButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('private-label')
        })
      )
    })
  })

  test('back button calls onBack', async () => {
    const user = userEvent.setup()
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    const backButton = screen.getByRole('button', { name: /indietro/i })
    await user.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  test('displays Private Label project summary', () => {
    renderWithProviderForPrivateLabel(<Step6ContactPrivateLabel onBack={mockOnBack} />)
    
    expect(screen.getByText(/riepilogo private label/i)).toBeInTheDocument()
  })
})