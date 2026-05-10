import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Timeline } from '../../components/Timeline/Timeline'

const STATS_DATA = {
  total: 45716,
  observed_falling: 1107,
  by_century: {
    '9th': 1,
    '10th': 2,
    '19th': 500,
    '20th': 12000,
    '21st': 13213,
  },
  by_class_group: {},
  latest_year: 2013,
  earliest_year: 860,
}

vi.mock('../../hooks/useMeteorities', () => ({
  useStats: vi.fn(() => ({ data: STATS_DATA, isLoading: false })),
}))

const mocks = vi.hoisted(() => ({
  setFilter: vi.fn(),
  resetFilters: vi.fn(),
  filters: { year_from: undefined, year_to: undefined },
}))

vi.mock('../../store', () => ({
  useStore: vi.fn((selector) =>
    selector({
      filters: mocks.filters,
      setFilter: mocks.setFilter,
      resetFilters: mocks.resetFilters,
    })
  ),
}))

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

describe('Timeline', () => {
  test('renders the section header', () => {
    render(<Timeline />, { wrapper })
    expect(screen.getByText(/impacts by century/i)).toBeInTheDocument()
  })

  test('does not show clear filter button when no year filter is active', () => {
    render(<Timeline />, { wrapper })
    expect(screen.queryByText(/clear filter/i)).not.toBeInTheDocument()
  })

  test('shows clear filter button when year_from is set', () => {
    mocks.filters = { year_from: 2000, year_to: undefined }
    render(<Timeline />, { wrapper })
    expect(screen.getByText(/clear filter/i)).toBeInTheDocument()
  })

  test('renders without crashing when stats are available', () => {
    const { container } = render(<Timeline />, { wrapper })
    expect(container.firstChild).toBeInTheDocument()
  })
})
