import '@testing-library/jest-dom'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js server modules for API tests
jest.mock('next/headers', () => ({
  headers: () => Promise.resolve({
    get: jest.fn(),
  }),
}))

// Define globals first to avoid circular dependency
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.body = options.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
  
  async text() {
    return this.body || ''
  }
}

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.ok = this.status >= 200 && this.status < 300
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
  
  static json(data, options = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options.headers
      }
    })
  }
}

// Mock NextRequest/NextResponse after globals are defined
jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = {
        get: jest.fn((key) => {
          const headerMap = options.headers || {}
          return headerMap[key.toLowerCase()] || null
        })
      }
      this.body = options.body
      
      // Add nextUrl property that NextRequest expects
      const urlObj = new URL(url)
      this.nextUrl = {
        origin: urlObj.origin,
        pathname: urlObj.pathname,
        search: urlObj.search,
        href: url
      }
    }
    
    async json() {
      if (!this.body) return {}
      try {
        return JSON.parse(this.body)
      } catch (error) {
        console.error('Mock request JSON parse error:', error)
        return {}
      }
    }
    
    async text() {
      return this.body || ''
    }
  }
  
  class MockNextResponse {
    constructor(body, options = {}) {
      this.body = body
      this.status = options.status || 200
      this.statusText = options.statusText || 'OK'
      this.headers = new Map(Object.entries(options.headers || {}))
      this.ok = this.status >= 200 && this.status < 300
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
    }
    
    static json(data, options = {}) {
      return new MockNextResponse(JSON.stringify(data), {
        ...options,
        status: options.status || 200,
        headers: {
          'content-type': 'application/json',
          ...options.headers
        }
      })
    }
  }
  
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse
  }
})

// Mock environment variables
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Global test utilities
global.fetch = jest.fn()

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})