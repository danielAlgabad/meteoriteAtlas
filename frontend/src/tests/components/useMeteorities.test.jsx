import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGlobeData, useMeteoriteDetail, useStats } from '../../hooks/useMeteorities'

vi.mock('../../services/api', () => ({
  fetchMeteorities: vi.fn().mockResolvedValue({
    items: [
      { id: 1, name: 'Alpha', lat: 10, lon: 20, mass: 100, fall: 'Fell' },
      { id: 2, name: 'Beta', lat: -30, lon: 150, mass: null, fall: 'Found' },
    ],
    total: 2,
    page: 1,
    size: 500,
    pages: 1,
  }),
  fetchMeteoriteById: vi.fn().mockResolvedValue({
    id: 42,
    name: 'Hoba',
    mass: 60000000,
    year: 1920,
    lat: -19.58,
    lon: 17.92,
    meteorite_class: 'Iron, IVB',
    classification_group: 'Iron',
    fall: 'Found',
  }),
  fetchStats: vi.fn().mockResolvedValue({
    total: 45716,
    with_coordinates: 38000,
    observed_falling: 1107,
    largest_mass_g: 60000000,
    earliest_year: 860,
    latest_year: 2013,
    by_century: { '21st': 13213 },
    by_class_group: { L: 5000 },
  }),
}))

vi.mock('../../store', () => ({
  useStore: vi.fn((selector) =>
    selector({
      filters: { page: 1, size: 500 },
    })
  ),
}))

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useGlobeData', () => {
  test('returns filtered meteorites (only those with coordinates)', async () => {
    const { result } = renderHook(() => useGlobeData(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // Both items have coords, so both should appear
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0].name).toBe('Alpha')
  })
})

describe('useMeteoriteDetail', () => {
  test('fetches meteorite by id when id is provided', async () => {
    const { result } = renderHook(() => useMeteoriteDetail(42), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data.name).toBe('Hoba')
    expect(result.current.data.id).toBe(42)
  })

  test('does not fetch when id is null', () => {
    const { result } = renderHook(() => useMeteoriteDetail(null), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useStats', () => {
  test('fetches and returns stats', async () => {
    const { result } = renderHook(() => useStats(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data.total).toBe(45716)
    expect(result.current.data.by_century['21st']).toBe(13213)
  })
})
