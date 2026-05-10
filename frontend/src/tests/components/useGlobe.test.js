import { renderHook, act } from '@testing-library/react'
import { useGlobe } from '../../hooks/useGlobe'
import { useStore } from '../../store'

beforeEach(() => {
  useStore.setState({ selectedId: null, isFilterPanelOpen: true })
})

describe('useGlobe', () => {
  test('returns null selectedId by default', () => {
    const { result } = renderHook(() => useGlobe())
    expect(result.current.selectedId).toBeNull()
  })

  test('setSelectedId updates the selected meteorite id', () => {
    const { result } = renderHook(() => useGlobe())
    act(() => {
      result.current.setSelectedId(42)
    })
    expect(result.current.selectedId).toBe(42)
  })

  test('setSelectedId(null) deselects', () => {
    const { result } = renderHook(() => useGlobe())
    act(() => result.current.setSelectedId(5))
    act(() => result.current.setSelectedId(null))
    expect(result.current.selectedId).toBeNull()
  })

  test('toggleFilterPanel flips the panel open state', () => {
    const { result } = renderHook(() => useGlobe())
    expect(result.current.isFilterPanelOpen).toBe(true)
    act(() => result.current.toggleFilterPanel())
    expect(result.current.isFilterPanelOpen).toBe(false)
    act(() => result.current.toggleFilterPanel())
    expect(result.current.isFilterPanelOpen).toBe(true)
  })
})
