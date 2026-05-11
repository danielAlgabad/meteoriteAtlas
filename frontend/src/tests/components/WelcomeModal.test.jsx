import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeModal } from '../../components/WelcomeModal/WelcomeModal'

const STORAGE_KEY = 'meteorite_atlas_welcomed'

beforeEach(() => {
  localStorage.clear()
})

describe('WelcomeModal', () => {
  test('renders on first visit', () => {
    render(<WelcomeModal />)
    expect(screen.getByText('Start Exploring')).toBeInTheDocument()
  })

  test('does not render when already visited', () => {
    localStorage.setItem(STORAGE_KEY, '1')
    render(<WelcomeModal />)
    expect(screen.queryByText('Start Exploring')).not.toBeInTheDocument()
  })

  test('closes and sets localStorage when dismissed', () => {
    render(<WelcomeModal />)
    fireEvent.click(screen.getByText('Start Exploring'))
    expect(screen.queryByText('Start Exploring')).not.toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')
  })

  test('closes when backdrop is clicked', () => {
    render(<WelcomeModal />)
    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(screen.queryByText('Start Exploring')).not.toBeInTheDocument()
  })
})
