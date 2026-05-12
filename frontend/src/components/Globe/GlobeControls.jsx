import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useGlobe } from '../../hooks/useGlobe'
import { useStore } from '../../store'

// rotateSpeed at maximum camera distance — scales linearly down to zero as
// the camera approaches the surface, so panning feels slow and precise
// when zoomed in close.
const MAX_DIST = 4
const BASE_ROTATE_SPEED = 0.35

// Squared distance threshold before triggering a viewport refetch (~0.2 world units)
const MOVE_THRESHOLD_SQ = 0.04

function computeViewport(camera) {
  const { x, y, z } = camera.position
  const dist = Math.sqrt(x * x + y * y + z * z)
  const lat = Math.asin(y / dist) * (180 / Math.PI)
  const theta = Math.atan2(z, -x)
  const thetaNorm = theta >= 0 ? theta : theta + 2 * Math.PI
  const lon = thetaNorm * (180 / Math.PI) - 180
  // Angular radius of visible hemisphere + 10% buffer
  const radius = Math.acos(Math.min(1, 1 / dist)) * (180 / Math.PI) * 1.1
  return { lat, lon, radius }
}

export function GlobeControls() {
  const { selectedId } = useGlobe()
  const setViewport = useStore((s) => s.setViewport)
  const controlsRef = useRef()
  // Track last camera position that triggered a viewport update
  const lastFirePos = useRef({ x: 0, y: 0, z: 2.8 })
  const throttleRef = useRef(true)

  useFrame(({ camera }) => {
    if (!controlsRef.current) return
    const dist = camera.position.length()
    controlsRef.current.rotateSpeed = BASE_ROTATE_SPEED * (dist / MAX_DIST)

    const { x, y, z } = camera.position
    const last = lastFirePos.current
    const sqDist = (x - last.x) ** 2 + (y - last.y) ** 2 + (z - last.z) ** 2

    if (sqDist > MOVE_THRESHOLD_SQ && throttleRef.current) {
      throttleRef.current = false
      lastFirePos.current = { x, y, z }
      setViewport(computeViewport(camera))
      setTimeout(() => { throttleRef.current = true }, 1500)
    }
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
    />
  )
}
