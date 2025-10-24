import { 
  getBeverageDisplayName, 
  getBeverageDisplayNameEnglish 
} from '@/utils/beverage-mapping'

describe('beverage-mapping utils', () => {
  describe('getBeverageDisplayName (Italian)', () => {
    test('maps cold-brew-plain correctly', () => {
      const result = getBeverageDisplayName('cold-brew-plain')
      expect(result).toBe('Cold Brew Coffee')
    })

    test('maps cold-brew-sugar correctly', () => {
      const result = getBeverageDisplayName('cold-brew-sugar')
      expect(result).toBe('Cold Brew con Zucchero')
    })

    test('maps cold-tea correctly', () => {
      const result = getBeverageDisplayName('cold-tea')
      expect(result).toBe('Thè Estratto a Freddo')
    })

    test('maps custom beverage correctly', () => {
      const result = getBeverageDisplayName('rd-custom')
      expect(result).toBe('Ricerca e Sviluppo - Bevanda personalizzata')
    })

    test('handles custom beverage with text', () => {
      const customText = 'Mia bevanda speciale con ingredienti unici'
      const result = getBeverageDisplayName('rd-custom', customText)
      expect(result).toBe('Ricerca e Sviluppo - Mia bevanda speciale con ingredienti unici')
    })

    test('handles long custom text', () => {
      const longText = 'A'.repeat(150)
      const result = getBeverageDisplayName('rd-custom', longText)
      expect(result).toContain('Ricerca e Sviluppo')
      expect(result).toContain(longText)
    })

    test('handles unknown beverage IDs', () => {
      const result = getBeverageDisplayName('unknown-beverage')
      expect(result).toBe('unknown-beverage')
    })

    test('handles empty custom text', () => {
      const result = getBeverageDisplayName('rd-custom', '')
      expect(result).toBe('Ricerca e Sviluppo - Bevanda personalizzata')
    })

    test('handles null custom text', () => {
      const result = getBeverageDisplayName('rd-custom', null)
      expect(result).toBe('Ricerca e Sviluppo - Bevanda personalizzata')
    })
  })

  describe('getBeverageDisplayNameEnglish', () => {
    test('maps cold-brew-plain correctly', () => {
      const result = getBeverageDisplayNameEnglish('cold-brew-plain')
      expect(result).toBe('Cold Brew Coffee')
    })

    test('maps cold-brew-sugar correctly', () => {
      const result = getBeverageDisplayNameEnglish('cold-brew-sugar')
      expect(result).toBe('Cold Brew with Sugar')
    })

    test('maps cold-tea correctly', () => {
      const result = getBeverageDisplayNameEnglish('cold-tea')
      expect(result).toBe('Cold Brew Tea')
    })

    test('maps custom beverage correctly', () => {
      const result = getBeverageDisplayNameEnglish('rd-custom')
      expect(result).toBe('Research & Development - Custom Beverage')
    })

    test('handles custom beverage with text', () => {
      const customText = 'My special beverage with unique ingredients'
      const result = getBeverageDisplayNameEnglish('rd-custom', customText)
      expect(result).toBe('Research & Development - My special beverage with unique ingredients')
    })

    test('handles long custom text', () => {
      const longText = 'B'.repeat(150)
      const result = getBeverageDisplayNameEnglish('rd-custom', longText)
      expect(result).toContain('Research & Development')
      expect(result).toContain(longText)
    })

    test('handles unknown beverage IDs', () => {
      const result = getBeverageDisplayNameEnglish('unknown-beverage')
      expect(result).toBe('unknown-beverage')
    })

    test('handles empty custom text', () => {
      const result = getBeverageDisplayNameEnglish('rd-custom', '')
      expect(result).toBe('Research & Development - Custom Beverage')
    })
  })

  describe('edge cases', () => {
    test('handles undefined beverage ID', () => {
      const result = getBeverageDisplayName(undefined as unknown as string)
      expect(result).toBe(undefined)
    })

    test('handles null beverage ID', () => {
      const result = getBeverageDisplayName(null as unknown as string)
      expect(result).toBe(null)
    })

    test('handles numeric beverage ID', () => {
      const result = getBeverageDisplayName(123 as unknown as string)
      expect(result).toBe(123)
    })

    test('handles whitespace in custom text', () => {
      const result = getBeverageDisplayName('rd-custom', '   Spaced Text   ')
      expect(result).toBe('Ricerca e Sviluppo -    Spaced Text   ')
    })

    test('handles special characters in custom text', () => {
      const customText = 'Bevanda con café & cioccolato (50%)'
      const result = getBeverageDisplayName('rd-custom', customText)
      expect(result).toBe('Ricerca e Sviluppo - Bevanda con café & cioccolato (50%)')
    })
  })

  describe('consistency between languages', () => {
    const testCases = ['cold-brew-plain', 'cold-brew-sugar', 'cold-tea', 'rd-custom']

    testCases.forEach(beverageId => {
      test(`both functions handle ${beverageId} without crashing`, () => {
        expect(() => getBeverageDisplayName(beverageId)).not.toThrow()
        expect(() => getBeverageDisplayNameEnglish(beverageId)).not.toThrow()
      })
    })

    test('both functions handle custom text consistently', () => {
      const customText = 'Test beverage'
      const italian = getBeverageDisplayName('rd-custom', customText)
      const english = getBeverageDisplayNameEnglish('rd-custom', customText)
      
      expect(italian).toContain(customText)
      expect(english).toContain(customText)
    })
  })
})