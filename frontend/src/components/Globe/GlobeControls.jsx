import { OrbitControls } from '@react-three/drei'
import { useGlobe } from '../../hooks/useGlobe'

export function GlobeControls() {
  const { selectedId } = useGlobe()

  return (
    <OrbitControls
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.35}
      zoomSpeed={0.8}
      minDistance={1.12}
      maxDistance={4}
      autoRotate={!selectedId}
      autoRotateSpeed={0.15}
    />
  )
}
