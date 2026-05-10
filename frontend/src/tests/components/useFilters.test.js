import { renderHook, act } from '@testing-library/react'
import { useFilters } from '../../hooks/useFilters'
import { useStore } from '../../store'

// Reset the store before each test so tests don't bleed into each other
beforeEach(() => {
  useStore.setState({
    filters: {
      mass_min: undefined,
      mass_max: undefined,
      year_from: undefined,
      year_to: undefined,
      fall: ['Fell', 'Found'],
      meteorite_class: undefined,
      page: 1,
      size: 500,
    },
  })
})

describe('useFilters', () => {
  test('returns initial filter state', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.mass_min).toBeUndefined()
    expect(result.current.filters.fall).toEqual(['Fell', 'Found'])
    expect(result.current.filters.page).toBe(1)
  })

  test('setFilter updates a single filter and resets page to 1', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      // Simulate a page change first
      useStore.setState((s) => ({ filters: { ...s.filters, page: 3 } }))
      result.current.setFilter('mass_min', 1000)
    })
    expect(result.current.filters.mass_min).toBe(1000)
    expect(result.current.filters.page).toBe(1)
  })

  test('resetFilters restores all filters to initial values', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setFilter('mass_min', 500)
      result.current.setFilter('fall', ['Fell'])
    })
    act(() => {
      result.current.resetFilters()
    })
    expect(result.current.filters.mass_min).toBeUndefined()
    expect(result.current.filters.fall).toEqual(['Fell', 'Found'])
  })
})
