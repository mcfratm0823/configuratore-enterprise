// Performance Optimization Utilities
// Production-grade optimizations for React components

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'

/**
 * Debounced value hook for expensive operations
 * Delays expensive calculations until user stops typing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttled callback hook for scroll and resize events
 * Limits function execution frequency for better performance
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args)
        lastRan.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Memoized component wrapper
 * Prevents unnecessary re-renders for expensive components
 */
export function memo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, propsAreEqual)
}

/**
 * Intersection Observer hook for lazy loading
 * Optimizes rendering of off-screen components
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  threshold = 0.1
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, threshold])

  return isIntersecting
}

/**
 * Virtual list hook for large data sets
 * Renders only visible items for better performance
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 1, items.length)
    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    totalHeight,
    setScrollTop,
    visibleRange
  }
}

/**
 * Optimized form validation hook
 * Debounces validation to prevent excessive re-renders
 */
export function useOptimizedValidation<T>(
  values: T,
  validationRules: (values: T) => Record<string, boolean>,
  debounceDelay = 300
) {
  const debouncedValues = useDebounce(values, debounceDelay)
  
  const errors = useMemo(() => {
    return validationRules(debouncedValues)
  }, [debouncedValues, validationRules])

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error)
  }, [errors])

  return { errors, isValid }
}

/**
 * Memoized country search
 * Optimizes country filtering performance
 */
export function useMemoizedCountrySearch(countries: Array<{id: string, label: string, flag: string}>, searchTerm: string) {
  return useMemo(() => {
    if (!searchTerm.trim()) return countries
    
    const lowercaseSearch = searchTerm.toLowerCase()
    return countries.filter(country => 
      country.label.toLowerCase().includes(lowercaseSearch) ||
      country.id.toLowerCase().includes(lowercaseSearch)
    )
  }, [countries, searchTerm])
}

/**
 * Optimized scroll handler
 * Throttles scroll events for better performance
 */
export function useOptimizedScroll(callback: () => void, delay = 16) {
  const throttledCallback = useThrottle(callback, delay)
  
  useEffect(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true })
    return () => window.removeEventListener('scroll', throttledCallback)
  }, [throttledCallback])
}

/**
 * Memoized calculation hook
 * Caches expensive calculations
 */
export function useMemoizedCalculation<T, R>(
  input: T,
  calculator: (input: T) => R,
  dependencies: unknown[] = []
): R {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => calculator(input), [input, calculator, ...dependencies])
}

