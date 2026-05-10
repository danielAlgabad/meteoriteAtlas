import '@testing-library/jest-dom'

// Recharts / responsive containers need ResizeObserver — jsdom doesn't have it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('three', () => {
  const makeMock = () => ({
    set: vi.fn().mockReturnThis(),
    copy: vi.fn().mockReturnThis(),
    setScalar: vi.fn().mockReturnThis(),
    compose: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
  })
  return {
    Color: vi.fn(makeMock),
    Vector3: vi.fn(makeMock),
    Matrix4: vi.fn(makeMock),
    Quaternion: vi.fn(() => ({})),
    BackSide: 1,
  }
})

vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn(() => null),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: vi.fn(() => null),
  Stars: vi.fn(() => null),
  useTexture: vi.fn(() => ({})),
}))
