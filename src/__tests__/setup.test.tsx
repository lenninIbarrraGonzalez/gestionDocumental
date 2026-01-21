import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test to verify testing setup works
describe('Testing Setup', () => {
  it('should render a component', () => {
    render(<div data-testid="test">Hello World</div>)
    expect(screen.getByTestId('test')).toBeInTheDocument()
  })

  it('should have localStorage available', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
  })

  it('should have jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})
