import { Suspense, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useGlobe } from '../../hooks/useGlobe'
import { GlobeControls } from './GlobeControls'
import { MeteoritePoints } from './MeteoritePoint'

// 4K NASA Blue Marble — public domain, CORS-open GitHub raw
const EARTH_TEXTURE_URL =
  //'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg'
  '/textures/earth_color.jpg'

function EarthWithTexture() {
  const map = useTexture(EARTH_TEXTURE_URL)
  return (
    <mesh>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial map={map} roughness={0.65} metalness={0.05} />
    </mesh>
  )
}

function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#1a3a6e" roughness={0.9} metalness={0.05} />
    </mesh>
  )
}

// ErrorBoundary catches texture load failures (404, network errors)
// so the globe still renders even if the CDN is unavailable
class TextureErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function EarthSphere() {
  return (
    <group>
      <TextureErrorBoundary fallback={<EarthFallback />}>
        <Suspense fallback={<EarthFallback />}>
          <EarthWithTexture />
        </Suspense>
      </TextureErrorBoundary>
      {/* Atmospheric glow */}
      <mesh>
        <sphereGeometry args={[1.025, 32, 32]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm tracking-wider">Loading impact data…</p>
      </div>
    </div>
  )
}

export function Globe({ meteorites, isLoading }) {
  const { setSelectedId } = useGlobe()

  return (
    <div className="absolute inset-0">
      {isLoading && <LoadingOverlay />}
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45, near: 0.05 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#060a14' }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />

        <Stars
          radius={80}
          depth={50}
          count={4000}
          factor={3}
          saturation={0}
          fade
          speed={0.3}
        />

        <EarthSphere />
        <MeteoritePoints meteorites={meteorites} />
        <GlobeControls />
      </Canvas>
    </div>
  )
}
