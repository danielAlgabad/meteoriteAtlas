import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useGlobe } from '../../hooks/useGlobe'

// rotateSpeed at maximum camera distance — scales linearly down to zero as
// the camera approaches the surface, so panning feels slow and precise
// when zoomed in close.
const MAX_DIST = 4
const BASE_ROTATE_SPEED = 0.35

export function GlobeControls() {
  const { selectedId } = useGlobe()
  const controlsRef = useRef()

  useFrame(({ camera }) => {
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
    />
  )
}
