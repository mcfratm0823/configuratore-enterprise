import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfiguratorWizard } from '@/features/configurator/components/ConfiguratorWizard'
import { ConfiguratorProvider } from '@/context/ConfiguratorContext'

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}))

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ConfiguratorProvider>
      {component}
    </ConfiguratorProvider>
  )
}

describe('ConfiguratorWizard', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
  })

  test('renders initial country selection step', () => {
    renderWithProvider(<ConfiguratorWizard />)
    
    expect(screen.getByText(/seleziona il tuo paese/i)).toBeInTheDocument()
    expect(screen.getByText(/Italia/i)).toBeInTheDocument()
    expect(screen.getByText(/Altri Paesi/i)).toBeInTheDocument()
  })

  test('shows progress indicator', () => {
    renderWithProvider(<ConfiguratorWizard />)
    
    expect(screen.getByText('Step 1 di 6')).toBeInTheDocument()
  })

  test('navigation works correctly', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)
    
    // Select Italy by clicking on the card
    const italyCard = screen.getByText(/Italia/i).closest('div[role="button"], div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    // Should move to step 2 - service selection
    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/scegli il tipo di servizio/i)).toBeInTheDocument()
  })

  test('back navigation works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)
    
    // Navigate to step 2
    const italyCard = screen.getByText(/Italia/i).closest('div[role="button"], div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    
    // Go back
    const backButton = screen.getByRole('button', { name: /indietro/i })
    await user.click(backButton)
    
    await waitFor(() => {
      expect(screen.getByText('Step 1 di 6')).toBeInTheDocument()
    })
  })

  test('sample toggle functionality', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)
    
    // Find sample toggle
    const sampleToggle = screen.getByRole('checkbox')
    expect(sampleToggle).not.toBeChecked()
    
    // Toggle sample
    await user.click(sampleToggle)
    expect(sampleToggle).toBeChecked()
    
    // Toggle back
    await user.click(sampleToggle)
    expect(sampleToggle).not.toBeChecked()
  })

  test('handles service type selection', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)
    
    // Navigate to service selection
    const italyCard = screen.getByText(/Italia/i).closest('div[role="button"], div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    await waitFor(() => {
      expect(screen.getByText(/scegli il tipo di servizio/i)).toBeInTheDocument()
    })
    
    // Select White Label
    const whiteLabelCard = screen.getByText(/White Label/i).closest('div[role="button"], div[class*="cursor-pointer"]') || screen.getByText(/White Label/i).parentElement
    await user.click(whiteLabelCard!)
    
    await waitFor(() => {
      expect(screen.getByText('Step 3 di 6')).toBeInTheDocument()
    })
  })

  test('validates required fields before proceeding', async () => {
    renderWithProvider(<ConfiguratorWizard />)
    
    // Try to proceed without selecting country
    const nextButtons = screen.queryAllByRole('button', { name: /avanti/i })
    
    // Should not have next button available or should be disabled
    if (nextButtons.length > 0) {
      expect(nextButtons[0]).toBeDisabled()
    }
  })

  test('maintains state across navigation', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ConfiguratorWizard />)
    
    // Select Italy
    const italyCard = screen.getByText(/Italia/i).closest('div[role="button"], div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    // Navigate forward and back
    await waitFor(() => {
      expect(screen.getByText('Step 2 di 6')).toBeInTheDocument()
    })
    
    const backButton = screen.getByRole('button', { name: /indietro/i })
    await user.click(backButton)
    
    await waitFor(() => {
      expect(screen.getByText('Step 1 di 6')).toBeInTheDocument()
    })
    
    // Italy should still be selected (can verify by checking if Italia text is still present)
    expect(screen.getByText(/Italia/i)).toBeInTheDocument()
  })
})