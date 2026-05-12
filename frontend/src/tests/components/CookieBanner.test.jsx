import { render, screen, fireEvent } from '@testing-library/react'
import { CookieBanner } from '../../components/CookieBanner/CookieBanner'

const CONSENT_KEY = 'meteorite_atlas_cookie_consent'

vi.mock('../../store', () => ({
  useStore: vi.fn((selector) => selector({ language: 'en', setLanguage: vi.fn() })),
}))

beforeEach(() => {
  localStorage.clear()
})

describe('CookieBanner', () => {
  test('shows banner when consent has not been given', () => {
    render(<CookieBanner />)
    expect(screen.getByText('Accept')).toBeInTheDocument()
    expect(screen.getByText('Decline')).toBeInTheDocument()
  })

  test('does not show banner when consent is already stored', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    render(<CookieBanner />)
    expect(screen.queryByText('Accept')).not.toBeInTheDocument()
  })

  test('accept stores consent and hides banner', () => {
    render(<CookieBanner />)
    fireEvent.click(screen.getByText('Accept'))
    expect(localStorage.getItem(CONSENT_KEY)).toBe('accepted')
    expect(screen.queryByText('Accept')).not.toBeInTheDocument()
  })

  test('decline stores decision and hides banner', () => {
    render(<CookieBanner />)
    fireEvent.click(screen.getByText('Decline'))
    expect(localStorage.getItem(CONSENT_KEY)).toBe('declined')
    expect(screen.queryByText('Decline')).not.toBeInTheDocument()
  })

  test('opens privacy policy modal when link is clicked', () => {
    render(<CookieBanner />)
    fireEvent.click(screen.getByText('Privacy Policy'))
    expect(screen.getByText('What We Store')).toBeInTheDocument()
  })

  test('closes privacy policy modal when close button is clicked', () => {
    render(<CookieBanner />)
    fireEvent.click(screen.getByText('Privacy Policy'))
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByText('What We Store')).not.toBeInTheDocument()
  })

  test('shows persistent privacy link after consent is given', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    render(<CookieBanner />)
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })
})
