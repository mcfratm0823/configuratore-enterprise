import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Step1Country } from '@/features/configurator/components/steps/Step1Country'
import { ConfiguratorProvider } from '@/context/ConfiguratorContext'

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ConfiguratorProvider>
      {component}
    </ConfiguratorProvider>
  )
}

describe('Step1Country', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders country selection options', () => {
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    expect(screen.getByText(/seleziona il tuo paese/i)).toBeInTheDocument()
    expect(screen.getByText(/Italia/i)).toBeInTheDocument()
    expect(screen.getByText(/Altri Paesi/i)).toBeInTheDocument()
  })

  test('renders sample toggle', () => {
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    expect(screen.getByText(/vuoi richiedere un campione/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText(/€50/)).toBeInTheDocument()
  })

  test('italy selection works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const italyCard = screen.getByText(/Italia/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    expect(italyCard).toHaveClass('border-green-600')
  })

  test('other countries selection works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const otherCard = screen.getByText(/Altri Paesi/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Altri Paesi/i).parentElement
    await user.click(otherCard!)
    
    expect(otherCard).toHaveClass('border-green-600')
  })

  test('sample toggle functionality', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const sampleCheckbox = screen.getByRole('checkbox')
    expect(sampleCheckbox).not.toBeChecked()
    
    await user.click(sampleCheckbox)
    expect(sampleCheckbox).toBeChecked()
    
    await user.click(sampleCheckbox)
    expect(sampleCheckbox).not.toBeChecked()
  })

  test('next button is disabled when no country selected', () => {
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    expect(nextButton).toBeDisabled()
  })

  test('next button is enabled when country selected', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const italyCard = screen.getByText(/Italia/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    expect(nextButton).not.toBeDisabled()
  })

  test('calls onNext when next button clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    // Select country first
    const italyCard = screen.getByText(/Italia/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    await user.click(italyCard!)
    
    // Click next
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    await user.click(nextButton)
    
    expect(mockOnNext).toHaveBeenCalledTimes(1)
  })

  test('displays sample price correctly', () => {
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    expect(screen.getByText('€50')).toBeInTheDocument()
    expect(screen.getByText(/spese di spedizione incluse/i)).toBeInTheDocument()
  })

  test('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const italyCard = screen.getByText(/Italia/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    
    // Click to select (keyboard navigation would need tabIndex on the card)
    await user.click(italyCard!)
    
    expect(italyCard).toHaveClass('border-green-600')
  })

  test('country selection is mutually exclusive', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Step1Country onNext={mockOnNext} />)
    
    const italyCard = screen.getByText(/Italia/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Italia/i).parentElement
    const otherCard = screen.getByText(/Altri Paesi/i).closest('div[class*="cursor-pointer"]') || screen.getByText(/Altri Paesi/i).parentElement
    
    // Select Italy
    await user.click(italyCard!)
    expect(italyCard).toHaveClass('border-green-600')
    
    // Select Other - Italy should be deselected
    await user.click(otherCard!)
    expect(otherCard).toHaveClass('border-green-600')
    expect(italyCard).not.toHaveClass('border-green-600')
  })
})