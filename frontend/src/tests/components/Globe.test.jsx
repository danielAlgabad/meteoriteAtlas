import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Globe } from '../../components/Globe/Globe'

const makeWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

const METEORITES = [
  { id: 1, name: 'Alpha', lat: 10, lon: 20, mass: 100, fall: 'Fell' },
  { id: 2, name: 'Beta', lat: -30, lon: 150, mass: 5000, fall: 'Found' },
]

// Globe renders its container div regardless of WebGL/Canvas support
describe('Globe', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <Globe meteorites={[]} isLoading={false} />,
      { wrapper: makeWrapper() }
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  test('shows loading overlay when isLoading is true', () => {
    render(<Globe meteorites={[]} isLoading />, { wrapper: makeWrapper() })
    expect(screen.getByText(/loading impact data/i)).toBeInTheDocument()
  })

  test('hides loading overlay when isLoading is false', () => {
    render(<Globe meteorites={METEORITES} isLoading={false} />, {
      wrapper: makeWrapper(),
    })
    expect(screen.queryByText(/loading impact data/i)).not.toBeInTheDocument()
  })

  test('renders with multiple meteorites without throwing', () => {
    expect(() =>
      render(<Globe meteorites={METEORITES} isLoading={false} />, {
        wrapper: makeWrapper(),
      })
    ).not.toThrow()
  })
})
