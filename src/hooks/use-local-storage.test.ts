import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update value and persist to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new-value')
  })

  it('should handle objects', () => {
    const initialObj = { name: 'test', count: 0 }
    const { result } = renderHook(() => useLocalStorage('obj-key', initialObj))

    expect(result.current[0]).toEqual(initialObj)

    act(() => {
      result.current[1]({ name: 'updated', count: 1 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', count: 1 })
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('should remove value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[2]()
    })

    expect(result.current[0]).toBe('initial')
    expect(localStorage.getItem('test-key')).toBeNull()
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('bad-key', 'not valid json')
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })
})
