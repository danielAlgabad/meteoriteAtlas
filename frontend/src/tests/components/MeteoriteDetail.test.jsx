import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MeteoriteDetail } from '../../components/MeteoriteDetail/MeteoriteDetail'

// vi.hoisted runs before vi.mock factories, making these available inside factories
const mocks = vi.hoisted(() => ({
  setSelectedId: vi.fn(),
  selectedId: { current: 1 },
}))

vi.mock('../../store', () => ({
  useStore: vi.fn((selector) =>
    selector({
      selectedId: mocks.selectedId.current,
      setSelectedId: mocks.setSelectedId,
      isFilterPanelOpen: true,
      toggleFilterPanel: vi.fn(),
    })
  ),
}))

vi.mock('../../hooks/useMeteorities', () => ({
  useMeteoriteDetail: vi.fn(() => ({
    data: {
      id: 1,
      name: 'Hoba',
      mass: 60000000,
      year: 1920,
      lat: -19.5833,
      lon: 17.9167,
      meteorite_class: 'Iron, IVB',
      classification_group: 'Iron',
      fall: 'Found',
    },
    isLoading: false,
  })),
}))

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

describe('MeteoriteDetail', () => {
  beforeEach(() => {
    mocks.setSelectedId.mockClear()
    mocks.selectedId.current = 1
  })

  test('renders meteorite name', () => {
    render(<MeteoriteDetail />, { wrapper })
    expect(screen.getByText('Hoba')).toBeInTheDocument()
  })

  test('renders fall badge', () => {
    render(<MeteoriteDetail />, { wrapper })
    expect(screen.getByText('Found')).toBeInTheDocument()
  })

  test('renders mass formatted in tonnes', () => {
    render(<MeteoriteDetail />, { wrapper })
    expect(screen.getByText('60.00 t')).toBeInTheDocument()
  })

  test('renders year', () => {
    render(<MeteoriteDetail />, { wrapper })
    expect(screen.getByText('1920')).toBeInTheDocument()
  })

  test('renders class', () => {
    render(<MeteoriteDetail />, { wrapper })
    expect(screen.getByText('Iron, IVB')).toBeInTheDocument()
  })

  test('calls setSelectedId(null) on close button click', () => {
    render(<MeteoriteDetail />, { wrapper })
    fireEvent.click(screen.getByLabelText('Close'))
    expect(mocks.setSelectedId).toHaveBeenCalledWith(null)
  })

  test('renders nothing when selectedId is null', () => {
    mocks.selectedId.current = null
    const { container } = render(<MeteoriteDetail />, { wrapper })
    expect(container.firstChild).toBeNull()
  })
})
