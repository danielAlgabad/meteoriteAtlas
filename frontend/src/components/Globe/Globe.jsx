import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useGlobe } from '../../hooks/useGlobe'
import { GlobeControls } from './GlobeControls'
import { MeteoritePoints } from './MeteoritePoint'

function EarthSphere() {
  return (
    <group>
      {/* Ocean base */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#0d1b3e"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      {/* Wireframe grid — gives a sci-fi map feel */}
      <mesh>
        <sphereGeometry args={[1.002, 36, 18]} />
        <meshBasicMaterial
          color="#1e40af"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.04, 32, 32]} />
        <meshBasicMaterial
          color="#1d4ed8"
          transparent
          opacity={0.05}
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
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#060a14' }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 5]} intensity={0.9} color="#ffffff" />
        <hemisphereLight args={['#0033aa', '#000820', 0.15]} />

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
