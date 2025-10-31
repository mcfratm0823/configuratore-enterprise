// Focus Management Utilities for Production-Grade UX
// Handles keyboard navigation, screen reader support, and accessibility

import { useEffect, useRef, useCallback } from 'react'

/**
 * Focus trap utility for modal-like interfaces
 * Keeps focus within specified container
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Get all focusable elements within container
    const getFocusableElements = () => {
      const focusableSelector = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ')

      return Array.from(
        containerRef.current!.querySelectorAll(focusableSelector)
      ) as HTMLElement[]
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Return focus to previously active element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
      }
    }

    // Focus first element when trap activates
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleEscape)
      
      // Restore focus when trap deactivates
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}

/**
 * Auto-focus hook for form inputs and interactive elements
 */
export function useAutoFocus(shouldFocus = true, delay = 100) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!shouldFocus || !elementRef.current) return

    const timer = setTimeout(() => {
      elementRef.current?.focus()
    }, delay)

    return () => clearTimeout(timer)
  }, [shouldFocus, delay])

  return elementRef
}

/**
 * Focus management for step navigation
 */
export function useStepFocusManagement(currentStep: number) {
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const previousStepRef = useRef<number>(currentStep)

  useEffect(() => {
    // Focus heading when step changes
    if (currentStep !== previousStepRef.current && stepHeadingRef.current) {
      stepHeadingRef.current.focus()
      previousStepRef.current = currentStep
    }
  }, [currentStep])

  return stepHeadingRef
}

/**
 * Focus first invalid field in form validation
 */
export function useFocusFirstError() {
  const focusFirstError = useCallback((errors: Record<string, boolean>) => {
    const firstErrorField = Object.keys(errors).find(field => errors[field])
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      element?.focus()
    }
  }, [])

  return focusFirstError
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Focus visible utility for custom focus indicators
 */
export const focusVisibleClasses = 'focus:outline-none'

/**
 * Keyboard event handler for Enter/Space activation
 */
export function createKeyboardActivator(callback: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  }
}