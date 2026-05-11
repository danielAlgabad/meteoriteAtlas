import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FilterPanel } from '../../components/FilterPanel/FilterPanel'

vi.mock('../../hooks/useMeteorities', () => ({
  useStats: vi.fn(() => ({
    data: {
      total: 45716,
      observed_falling: 1107,
      by_century: { '21st': 13000 },
      by_class_group: {},
    },
    isLoading: false,
  })),
}))

vi.mock('../../store', () => {
  const filters = {
    mass_min: undefined,
    mass_max: undefined,
    year_from: undefined,
    year_to: undefined,
    fall: ['Fell', 'Found'],
    meteorite_class: undefined,
    page: 1,
    size: 500,
  }
  const setFilter = vi.fn()
  const resetFilters = vi.fn()
  const setPointLimit = vi.fn()
  return {
    useStore: vi.fn((selector) =>
      selector({
        filters,
        setFilter,
        resetFilters,
        pointLimit: 10000,
        setPointLimit,
        isFilterPanelOpen: true,
        toggleFilterPanel: vi.fn(),
        selectedId: null,
        setSelectedId: vi.fn(),
        language: 'en',
        setLanguage: vi.fn(),
      })
    ),
  }
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('FilterPanel', () => {
  test('renders without crashing', () => {
    render(<FilterPanel />, { wrapper })
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  test('displays fall type toggle buttons', () => {
    render(<FilterPanel />, { wrapper })
    // "Fell" and "Found" appear in both toggle buttons and legend
    expect(screen.getAllByText('Fell').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Found').length).toBeGreaterThan(0)
  })

  test('shows stats labels', () => {
    render(<FilterPanel />, { wrapper })
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Observed')).toBeInTheDocument()
  })

  test('shows class dropdown', () => {
    render(<FilterPanel />, { wrapper })
    expect(screen.getByText('All classes')).toBeInTheDocument()
  })

  test('shows fall type toggle buttons', () => {
    render(<FilterPanel />, { wrapper })
    expect(screen.getAllByText('Fell').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Found').length).toBeGreaterThan(0)
  })
})
