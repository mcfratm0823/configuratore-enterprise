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
  // RFC 5322 compliant email regex with additional security
  const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return emailRegex.test(sanitized) && sanitized.length <= 254 && sanitized.length >= 5;
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
 * 🛡️ PHONE VALIDATION - Validazione telefono internazionale
 */
export function validatePhone(phone: string): boolean {
  const sanitized = sanitizeInput(phone);
  // Supporta formati internazionali: +39 123 456 7890, +1-555-123-4567, etc.
  const phoneRegex = /^\+?[1-9]\d{1,14}$|^[\+]?[1-9][\d\s\-\(\)]{8,20}$/;
  const cleanPhone = sanitized.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 8 && cleanPhone.length <= 20;
}

/**
 * 🛡️ COMPANY NAME VALIDATION - Validazione nome azienda
 */
export function validateCompany(company: string): boolean {
  const sanitized = sanitizeInput(company);
  // Consente lettere, numeri, spazi e caratteri aziendali comuni
  const companyRegex = /^[a-zA-ZÀ-ÿ0-9\s&.,'-]{2,100}$/;
  return companyRegex.test(sanitized);
}

/**
 * 🛡️ TEXT AREA VALIDATION - Validazione testo con prevenzione XSS
 */
export function validateTextArea(text: string, maxLength: number = 1000): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (typeof text !== 'string') {
    errors.push('Invalid text format');
    return { isValid: false, sanitized: '', errors };
  }

  // Rimuovi script tags e HTML pericoloso
  let sanitized = text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:(?!image\/[png|jpg|jpeg|gif|svg])/gi, '')
    .trim();

  // Controllo lunghezza
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    errors.push(`Text exceeds maximum length of ${maxLength} characters`);
  }

  // Controllo caratteri sospetti
  const suspiciousPatterns = [
    /<[^>]*>/g, // HTML tags
    /\{\{.*?\}\}/g, // Template injection
    /\$\{.*?\}/g, // Template literals
    /eval\s*\(/gi, // eval calls
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      errors.push('Text contains potentially dangerous content');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * 🛡️ VAT NUMBER VALIDATION - Validazione Partita IVA per paese
 */
export function validateVATNumber(vatNumber: string, country: string = 'IT'): boolean {
  const sanitized = sanitizeInput(vatNumber);
  
  switch (country.toUpperCase()) {
    case 'IT': // Italia
      const itVatRegex = /^IT[0-9]{11}$|^[0-9]{11}$/;
      return itVatRegex.test(sanitized);
    
    case 'DE': // Germania
      const deVatRegex = /^DE[0-9]{9}$|^[0-9]{9}$/;
      return deVatRegex.test(sanitized);
    
    case 'FR': // Francia
      const frVatRegex = /^FR[0-9A-HJ-NP-Z]{2}[0-9]{9}$|^[0-9A-HJ-NP-Z]{2}[0-9]{9}$/;
      return frVatRegex.test(sanitized);
    
    case 'ES': // Spagna
      const esVatRegex = /^ES[0-9A-Z][0-9]{7}[0-9A-Z]$|^[0-9A-Z][0-9]{7}[0-9A-Z]$/;
      return esVatRegex.test(sanitized);
    
    case 'UK': // Regno Unito
      const ukVatRegex = /^GB[0-9]{9}$|^GB[0-9]{12}$|^GBGD[0-4][0-9]{2}$|^GBHA[5-9][0-9]{2}$|^[0-9]{9}$|^[0-9]{12}$/;
      return ukVatRegex.test(sanitized);
    
    default: // Generico EU
      const genericVatRegex = /^[A-Z]{2}[0-9A-Z]{2,20}$|^[0-9A-Z]{8,20}$/;
      return genericVatRegex.test(sanitized) && sanitized.length >= 8 && sanitized.length <= 15;
  }
}

/**
 * 🛡️ FISCAL CODE VALIDATION - Validazione Codice Fiscale italiano
 */
export function validateFiscalCode(fiscalCode: string): boolean {
  const sanitized = sanitizeInput(fiscalCode).toUpperCase();
  const fiscalRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return fiscalRegex.test(sanitized);
}

/**
 * 🛡️ ADDRESS VALIDATION - Validazione indirizzo con prevenzione XSS
 */
export function validateAddress(address: string): boolean {
  const sanitized = sanitizeInput(address);
  // Consente lettere, numeri, spazi e caratteri comuni negli indirizzi
  const addressRegex = /^[a-zA-ZÀ-ÿ0-9\s,.-]{5,200}$/;
  return addressRegex.test(sanitized);
}

/**
 * 🛡️ POSTAL CODE VALIDATION - Validazione CAP/codice postale
 */
export function validatePostalCode(postalCode: string, country: string = 'IT'): boolean {
  const sanitized = sanitizeInput(postalCode);
  
  switch (country.toUpperCase()) {
    case 'IT':
      return /^[0-9]{5}$/.test(sanitized);
    case 'DE':
      return /^[0-9]{5}$/.test(sanitized);
    case 'FR':
      return /^[0-9]{5}$/.test(sanitized);
    case 'UK':
      return /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(sanitized);
    case 'US':
      return /^[0-9]{5}(-[0-9]{4})?$/.test(sanitized);
    default:
      return /^[A-Z0-9\s-]{3,10}$/i.test(sanitized);
  }
}

/**
 * 🛡️ CITY/PROVINCE VALIDATION - Validazione città e provincia
 */
export function validateCityOrProvince(text: string): boolean {
  const sanitized = sanitizeInput(text);
  const cityRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  return cityRegex.test(sanitized);
}

/**
 * 🛡️ PEC EMAIL VALIDATION - Validazione email PEC
 */
export function validatePEC(pec: string): boolean {
  if (!validateEmail(pec)) return false;
  // Controllo che contenga domini PEC italiani comuni o pattern PEC
  const pecPatterns = [
    /\.pec\./i,
    /pec@/i,
    /\.pecgov\./i,
    /\.postacert\./i,
    /\.legalmail\./i
  ];
  return pecPatterns.some(pattern => pattern.test(pec));
}

/**
 * 🛡️ SDI CODE VALIDATION - Validazione codice SDI (Sistema di Interscambio)
 */
export function validateSDI(sdi: string): boolean {
  const sanitized = sanitizeInput(sdi).toUpperCase();
  // Codice SDI: 7 caratteri alfanumerici
  const sdiRegex = /^[A-Z0-9]{7}$/;
  return sdiRegex.test(sanitized);
}

/**
 * 🛡️ CUSTOM VOLUME VALIDATION - Validazione volume personalizzato
 */
export function validateCustomVolume(volume: string | number): {
  isValid: boolean;
  value: number;
  errors: string[];
} {
  const errors: string[] = [];
  let numValue: number;

  if (typeof volume === 'string') {
    const sanitized = sanitizeInput(volume);
    numValue = parseInt(sanitized, 10);
  } else {
    numValue = volume;
  }

  if (isNaN(numValue)) {
    errors.push('Volume must be a valid number');
    return { isValid: false, value: 0, errors };
  }

  if (numValue < 1000) {
    errors.push('Minimum volume is 1000 liters');
  }

  if (numValue > 100000) {
    errors.push('Maximum volume is 100000 liters');
  }

  if (!Number.isInteger(numValue)) {
    errors.push('Volume must be a whole number');
  }

  return {
    isValid: errors.length === 0,
    value: numValue,
    errors
  };
}

/**
 * 🛡️ SEARCH TERM VALIDATION - Validazione termini di ricerca
 */
export function validateSearchTerm(searchTerm: string): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (typeof searchTerm !== 'string') {
    errors.push('Search term must be a string');
    return { isValid: false, sanitized: '', errors };
  }

  // Rimuovi caratteri pericolosi mantenendo funzionalità di ricerca
  const sanitized = searchTerm
    .replace(/[<>\"'&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .substring(0, 100);

  if (sanitized.length > 100) {
    errors.push('Search term too long');
  }

  // Controlla pattern sospetti
  const suspiciousPatterns = [
    /script/gi,
    /eval/gi,
    /function/gi,
    /\{\{.*?\}\}/g,
    /\$\{.*?\}/g
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      errors.push('Search term contains invalid characters');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
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
export function handleSecureError(error: unknown): string {
  // Non esporre mai dettagli interni al client
  if (typeof error === 'string') {
    return error.substring(0, 100);
  }
  
  if (error instanceof Error) {
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

/**
 * 🛡️ COMPREHENSIVE FORM VALIDATION INTERFACES
 */

// Contact Form Validation Interface
export interface ContactFormValidation {
  firstName: { isValid: boolean; sanitized: string; errors: string[] };
  lastName: { isValid: boolean; sanitized: string; errors: string[] };
  email: { isValid: boolean; sanitized: string; errors: string[] };
  phone: { isValid: boolean; sanitized: string; errors: string[] };
  company: { isValid: boolean; sanitized: string; errors: string[] };
}

// Billing Data Validation Interface
export interface BillingDataValidation {
  vatNumber: { isValid: boolean; sanitized: string; errors: string[] };
  fiscalCode: { isValid: boolean; sanitized: string; errors: string[] };
  legalName: { isValid: boolean; sanitized: string; errors: string[] };
  billingAddress: { isValid: boolean; sanitized: string; errors: string[] };
  billingCity: { isValid: boolean; sanitized: string; errors: string[] };
  billingPostalCode: { isValid: boolean; sanitized: string; errors: string[] };
  billingProvince: { isValid: boolean; sanitized: string; errors: string[] };
  sdi: { isValid: boolean; sanitized: string; errors: string[] };
  pec: { isValid: boolean; sanitized: string; errors: string[] };
}

/**
 * 🛡️ CONTACT FORM VALIDATOR - Validazione completa form contatto
 */
export function validateContactForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}): ContactFormValidation {
  
  // First Name validation
  const firstName = (() => {
    const errors: string[] = [];
    const sanitized = sanitizeInput(data.firstName);
    const isValid = validateName(sanitized);
    
    if (!sanitized.trim()) errors.push('First name is required');
    if (!isValid && sanitized.trim()) errors.push('First name contains invalid characters');
    if (sanitized.length < 2) errors.push('First name must be at least 2 characters');
    if (sanitized.length > 50) errors.push('First name must be less than 50 characters');
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Last Name validation
  const lastName = (() => {
    const errors: string[] = [];
    const sanitized = sanitizeInput(data.lastName);
    const isValid = validateName(sanitized);
    
    if (!sanitized.trim()) errors.push('Last name is required');
    if (!isValid && sanitized.trim()) errors.push('Last name contains invalid characters');
    if (sanitized.length < 2) errors.push('Last name must be at least 2 characters');
    if (sanitized.length > 50) errors.push('Last name must be less than 50 characters');
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Email validation
  const email = (() => {
    const errors: string[] = [];
    const sanitized = sanitizeInput(data.email);
    const isValid = validateEmail(sanitized);
    
    if (!sanitized.trim()) errors.push('Email is required');
    if (!isValid && sanitized.trim()) errors.push('Please enter a valid email address');
    
    return { isValid: errors.length === 0, sanitized: sanitized.toLowerCase(), errors };
  })();

  // Phone validation
  const phone = (() => {
    const errors: string[] = [];
    const sanitized = sanitizeInput(data.phone);
    const isValid = validatePhone(sanitized);
    
    if (!sanitized.trim()) errors.push('Phone number is required');
    if (!isValid && sanitized.trim()) errors.push('Please enter a valid phone number');
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Company validation
  const company = (() => {
    const errors: string[] = [];
    const sanitized = sanitizeInput(data.company);
    const isValid = validateCompany(sanitized);
    
    if (!sanitized.trim()) errors.push('Company name is required');
    if (!isValid && sanitized.trim()) errors.push('Company name contains invalid characters');
    if (sanitized.length < 2) errors.push('Company name must be at least 2 characters');
    if (sanitized.length > 100) errors.push('Company name must be less than 100 characters');
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  return {
    firstName,
    lastName,
    email,
    phone,
    company
  };
}

/**
 * 🛡️ BILLING DATA VALIDATOR - Validazione completa dati fatturazione
 */
export function validateBillingData(data: {
  vatNumber?: string;
  fiscalCode?: string;
  legalName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingProvince?: string;
  sdi?: string;
  pec?: string;
}, country: string = 'IT'): BillingDataValidation {
  
  // VAT Number validation (optional)
  const vatNumber = (() => {
    const errors: string[] = [];
    const value = data.vatNumber || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      const isValid = validateVATNumber(sanitized, country);
      if (!isValid) errors.push('Invalid VAT number format');
    }
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Fiscal Code validation (optional)
  const fiscalCode = (() => {
    const errors: string[] = [];
    const value = data.fiscalCode || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim() && country.toUpperCase() === 'IT') {
      const isValid = validateFiscalCode(sanitized);
      if (!isValid) errors.push('Invalid fiscal code format');
    }
    
    return { isValid: errors.length === 0, sanitized: sanitized.toUpperCase(), errors };
  })();

  // Legal Name validation (optional)
  const legalName = (() => {
    const errors: string[] = [];
    const value = data.legalName || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (sanitized.length < 2) errors.push('Legal name must be at least 2 characters');
      if (sanitized.length > 200) errors.push('Legal name must be less than 200 characters');
      if (!validateCompany(sanitized)) errors.push('Legal name contains invalid characters');
    }
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Billing Address validation (optional)
  const billingAddress = (() => {
    const errors: string[] = [];
    const value = data.billingAddress || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (!validateAddress(sanitized)) errors.push('Invalid address format');
    }
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Billing City validation (optional)
  const billingCity = (() => {
    const errors: string[] = [];
    const value = data.billingCity || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (!validateCityOrProvince(sanitized)) errors.push('Invalid city format');
    }
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Postal Code validation (optional)
  const billingPostalCode = (() => {
    const errors: string[] = [];
    const value = data.billingPostalCode || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (!validatePostalCode(sanitized, country)) errors.push('Invalid postal code format');
    }
    
    return { isValid: errors.length === 0, sanitized, errors };
  })();

  // Province validation (optional)
  const billingProvince = (() => {
    const errors: string[] = [];
    const value = data.billingProvince || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (!validateCityOrProvince(sanitized)) errors.push('Invalid province format');
    }
    
    return { isValid: errors.length === 0, sanitized: sanitized.toUpperCase(), errors };
  })();

  // SDI Code validation (optional)
  const sdi = (() => {
    const errors: string[] = [];
    const value = data.sdi || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (!validateSDI(sanitized)) errors.push('Invalid SDI code format (7 alphanumeric characters)');
    }
    
    return { isValid: errors.length === 0, sanitized: sanitized.toUpperCase(), errors };
  })();

  // PEC Email validation (optional)
  const pec = (() => {
    const errors: string[] = [];
    const value = data.pec || '';
    const sanitized = sanitizeInput(value);
    
    if (sanitized.trim()) {
      if (!validatePEC(sanitized)) errors.push('Invalid PEC email format');
    }
    
    return { isValid: errors.length === 0, sanitized: sanitized.toLowerCase(), errors };
  })();

  return {
    vatNumber,
    fiscalCode,
    legalName,
    billingAddress,
    billingCity,
    billingPostalCode,
    billingProvince,
    sdi,
    pec
  };
}

/**
 * 🛡️ FORM INPUT HANDLER FACTORY - Crea handler sicuri per input
 */
export function createSecureInputHandler<T>(
  setter: (value: T) => void,
  validator: (value: string) => { isValid: boolean; sanitized: string; errors: string[] },
  onError?: (errors: string[]) => void
) {
  return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { isValid, sanitized, errors } = validator(event.target.value);
    
    if (onError && errors.length > 0) {
      onError(errors);
    }
    
    setter(sanitized as T);
    return { isValid, sanitized, errors };
  };
}

/**
 * 🛡️ REAL-TIME VALIDATION STATE MANAGER
 */
export class ValidationStateManager {
  private validationState: Map<string, { isValid: boolean; errors: string[] }> = new Map();
  private onStateChange?: (field: string, state: { isValid: boolean; errors: string[] }) => void;

  constructor(onStateChange?: (field: string, state: { isValid: boolean; errors: string[] }) => void) {
    this.onStateChange = onStateChange;
  }

  validateField(fieldName: string, value: string, validator: (value: string) => { isValid: boolean; sanitized: string; errors: string[] }): string {
    const result = validator(value);
    const state = { isValid: result.isValid, errors: result.errors };
    
    this.validationState.set(fieldName, state);
    
    if (this.onStateChange) {
      this.onStateChange(fieldName, state);
    }
    
    return result.sanitized;
  }

  getFieldState(fieldName: string): { isValid: boolean; errors: string[] } | undefined {
    return this.validationState.get(fieldName);
  }

  isFormValid(): boolean {
    for (const [, state] of this.validationState) {
      if (!state.isValid) return false;
    }
    return this.validationState.size > 0;
  }

  getFormErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    for (const [field, state] of this.validationState) {
      if (state.errors.length > 0) {
        errors[field] = state.errors;
      }
    }
    return errors;
  }

  reset(): void {
    this.validationState.clear();
  }
}