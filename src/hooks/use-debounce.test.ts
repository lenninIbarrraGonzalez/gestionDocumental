import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // Value should still be initial immediately after change
    rerender({ value: 'changed' })
    expect(result.current).toBe('initial')

    // After delay, value should be updated
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('changed')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // Multiple rapid changes
    rerender({ value: 'change1' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'change2' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'final' })

    // Still initial because timer keeps resetting
    expect(result.current).toBe('initial')

    // After full delay from last change
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('final')
  })
})
