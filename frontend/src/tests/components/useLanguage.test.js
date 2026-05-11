import { renderHook } from '@testing-library/react'
import { useT } from '../../hooks/useLanguage'

vi.mock('../../store', () => ({
  useStore: vi.fn((selector) => selector({ language: 'en' })),
}))

describe('useT (English)', () => {
  test('returns English translation for a known key', () => {
    const { result } = renderHook(() => useT())
    expect(result.current('filter.title')).toBe('Filters')
  })

  test('interpolates {{variables}} in translation strings', () => {
    const { result } = renderHook(() => useT())
    expect(result.current('header.impacts', { count: '1,234' })).toBe('1,234 impacts on globe')
  })

  test('returns the key itself when translation is missing', () => {
    const { result } = renderHook(() => useT())
    expect(result.current('nonexistent.key')).toBe('nonexistent.key')
  })
})
