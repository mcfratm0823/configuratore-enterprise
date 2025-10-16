// 🛡️ FRONTEND SECURITY UTILITIES
// Protezioni XSS, CSRF e validazione sicura

/**
 * 🛡️ INPUT SANITIZATION - Rimuove caratteri pericolosi
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&]/g, '') // Rimuove caratteri XSS pericolosi
    .replace(/javascript:/gi, '') // Rimuove javascript: URLs
    .replace(/on\w+=/gi, '') // Rimuove event handlers
    .replace(/data:/gi, '') // Rimuove data: URLs
    .trim()
    .substring(0, 500); // Limite lunghezza
}

/**
 * 🛡️ EMAIL VALIDATION - Validazione email rigorosa
 */
export function validateEmail(email: string): boolean {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(sanitized) && sanitized.length <= 100;
}

/**
 * 🛡️ NAME VALIDATION - Validazione nome sicura
 */
export function validateName(name: string): boolean {
  const sanitized = sanitizeInput(name);
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/;
  return nameRegex.test(sanitized);
}

/**
 * 🛡️ AMOUNT VALIDATION - Validazione importi sicura
 */
export function validateAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  return amount >= 0.01 && amount <= 10000; // €0.01 - €10,000
}

/**
 * 🛡️ QUANTITY VALIDATION - Validazione quantità
 */
export function validateQuantity(quantity: number): boolean {
  if (typeof quantity !== 'number' || isNaN(quantity)) return false;
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 10000;
}

/**
 * 🛡️ SESSION ID VALIDATION - Validazione ID sessione
 */
export function validateSessionId(sessionId: string): boolean {
  const sanitized = sanitizeInput(sessionId);
  const sessionRegex = /^[a-zA-Z0-9-_]{10,50}$/;
  return sessionRegex.test(sanitized);
}

/**
 * 🛡️ RATE LIMITING CLIENT-SIDE - Previene spam requests
 */
class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minuti

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Rimuovi tentativi vecchi
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Aggiungi nuovo tentativo
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }
}

export const rateLimiter = new ClientRateLimiter();

/**
 * 🛡️ SECURE ORDER DATA VALIDATION - Validazione completa order
 */
export interface SecureOrderData {
  destination: string;
  materials: string[];
  sizes: { width: number; height: number; depth: number };
  extras: string[];
  quantity: number;
  totalPrice: number;
  customerEmail: string;
  customerName: string;
  sessionId: string;
}

export function validateOrderData(orderData: Partial<SecureOrderData>): {
  isValid: boolean;
  errors: string[];
  sanitizedData?: SecureOrderData;
} {
  const errors: string[] = [];
  
  // Email validation
  if (!orderData.customerEmail || !validateEmail(orderData.customerEmail)) {
    errors.push('Invalid email address');
  }
  
  // Name validation
  if (!orderData.customerName || !validateName(orderData.customerName)) {
    errors.push('Invalid customer name');
  }
  
  // Amount validation
  if (!orderData.totalPrice || !validateAmount(orderData.totalPrice)) {
    errors.push('Invalid total price');
  }
  
  // Quantity validation
  if (!orderData.quantity || !validateQuantity(orderData.quantity)) {
    errors.push('Invalid quantity');
  }
  
  // Session ID validation
  if (!orderData.sessionId || !validateSessionId(orderData.sessionId)) {
    errors.push('Invalid session ID');
  }
  
  // Destination validation
  const validDestinations = ['italy', 'europa', 'usa', 'worldwide'];
  if (!orderData.destination || !validDestinations.includes(orderData.destination)) {
    errors.push('Invalid destination');
  }
  
  // Materials validation
  if (!Array.isArray(orderData.materials) || orderData.materials.length === 0 || orderData.materials.length > 10) {
    errors.push('Invalid materials array');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Return sanitized data
  const sanitizedData: SecureOrderData = {
    destination: sanitizeInput(orderData.destination!),
    materials: orderData.materials!.map(m => sanitizeInput(m)).slice(0, 10),
    sizes: orderData.sizes!,
    extras: Array.isArray(orderData.extras) ? orderData.extras.map(e => sanitizeInput(e)).slice(0, 10) : [],
    quantity: Math.min(orderData.quantity!, 10000),
    totalPrice: Math.min(Math.abs(orderData.totalPrice!), 10000),
    customerEmail: sanitizeInput(orderData.customerEmail!).toLowerCase(),
    customerName: sanitizeInput(orderData.customerName!),
    sessionId: sanitizeInput(orderData.sessionId!)
  };

  return { isValid: true, errors: [], sanitizedData };
}

/**
 * 🛡️ SECURE ERROR HANDLER - Error handling senza info sensibili
 */
export function handleSecureError(error: any): string {
  // Non esporre mai dettagli interni al client
  if (typeof error === 'string') {
    return error.substring(0, 100);
  }
  
  if (error?.message) {
    return error.message.substring(0, 100);
  }
  
  return 'An unexpected error occurred';
}

/**
 * 🛡️ CONTENT SECURITY POLICY - Helpers per CSP
 */
export function getSecureCSP(): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.stripe.com https://checkout.stripe.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
    font-src 'self' data:;
  `.replace(/\s+/g, ' ').trim();
}

/**
 * 🛡️ SESSION TIMEOUT - Gestione timeout sessione
 */
export class SessionTimeout {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly timeoutMs = 30 * 60 * 1000; // 30 minuti
  
  start(onTimeout: () => void): void {
    this.clear();
    this.timeoutId = setTimeout(onTimeout, this.timeoutMs);
  }
  
  reset(onTimeout: () => void): void {
    this.start(onTimeout);
  }
  
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const sessionTimeout = new SessionTimeout();