import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useGlobe } from '../../hooks/useGlobe'
import { useStore } from '../../store'

const MAX_DIST = 4
const BASE_ROTATE_SPEED = 0.35

function computeViewport(camera) {
  const { x, y, z } = camera.position
  const dist = Math.sqrt(x * x + y * y + z * z)
  const lat = Math.asin(y / dist) * (180 / Math.PI)
  const theta = Math.atan2(z, -x)
  const thetaNorm = theta >= 0 ? theta : theta + 2 * Math.PI
  const lon = thetaNorm * (180 / Math.PI) - 180
  const radius = Math.acos(Math.min(1, 1 / dist)) * (180 / Math.PI) * 1.1
  return { lat, lon, radius }
}

export function GlobeControls() {
  const { selectedId } = useGlobe()
  const { camera } = useThree()
  const setViewport = useStore((s) => s.setViewport)
  const controlsRef = useRef()
  // Delay lets OrbitControls damping settle before we snapshot the camera position
  const timerRef = useRef()

  const handleInteractionEnd = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setViewport(computeViewport(camera))
    }, 500)
  }, [camera, setViewport])

  useFrame(() => {
    if (!controlsRef.current) return
    const dist = camera.position.length()
    controlsRef.current.rotateSpeed = BASE_ROTATE_SPEED * (dist / MAX_DIST)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      zoomSpeed={0.8}
      minDistance={1.12}
      maxDistance={MAX_DIST}
      autoRotate={!selectedId}
      autoRotateSpeed={0.15}
      onEnd={handleInteractionEnd}
    />
  )
}
