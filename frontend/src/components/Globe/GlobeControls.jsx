import { OrbitControls } from '@react-three/drei'

export function GlobeControls() {
  return (
    <OrbitControls
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      minDistance={1.5}
      maxDistance={4}
      autoRotate
      autoRotateSpeed={0.3}
    />
  )
}
