// Shared beverage mapping utility for consistent display across components and emails
// Ensures email templates show user-friendly names instead of technical IDs

export interface BeverageOption {
  id: string
  name: string
  description: string
  available: boolean
  category: string
}

// Centralized beverage options - keep in sync with Step3BeverageSelection.tsx
export const beverageOptions: BeverageOption[] = [
  {
    id: 'cold-brew-plain',
    name: 'Cold Brew Coffee',
    description: 'Liscio senza zucchero e senza gas',
    available: true,
    category: 'coffee'
  },
  {
    id: 'cold-brew-sugar',
    name: 'Cold Brew con Zucchero', 
    description: 'Cold brew coffee dolcificato',
    available: true,
    category: 'coffee'
  },
  {
    id: 'cold-tea',
    name: 'Thè Estratto a Freddo',
    description: 'Cold brew tea premium',
    available: true,
    category: 'tea'
  },
  {
    id: 'rd-custom',
    name: 'Ricerca e Sviluppo',
    description: 'Altre bevande da creare da zero',
    available: true,
    category: 'custom'
  }
]

// Utility function to get user-friendly name from technical ID
export function getBeverageDisplayName(beverageId: string, customText?: string): string {
  if (beverageId === 'rd-custom') {
    return `Ricerca e Sviluppo - ${customText || 'Bevanda personalizzata'}`
  }
  
  const option = beverageOptions.find(option => option.id === beverageId)
  return option ? option.name : beverageId // Fallback to ID if not found
}

// English version for multilingual emails
export function getBeverageDisplayNameEnglish(beverageId: string, customText?: string): string {
  const englishMapping: Record<string, string> = {
    'cold-brew-plain': 'Cold Brew Coffee',
    'cold-brew-sugar': 'Cold Brew with Sugar',
    'cold-tea': 'Cold Brew Tea',
    'rd-custom': 'Research & Development'
  }
  
  if (beverageId === 'rd-custom') {
    return `Research & Development - ${customText || 'Custom Beverage'}`
  }
  
  return englishMapping[beverageId] || beverageId // Fallback to ID if not found
}