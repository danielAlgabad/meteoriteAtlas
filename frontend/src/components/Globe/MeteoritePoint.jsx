import { useRef, useEffect, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useGlobe } from '../../hooks/useGlobe'

const GLOBE_RADIUS = 1.02
const BASE_SCALE = 0.007

function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

function getMassScale(mass) {
  if (!mass || mass <= 0) return 0.6
  const log = Math.log10(mass)
  // log scale: 1g→0.6, 1kg→0.9, 1t→1.5, 10t→2.0
  return Math.min(Math.max(0.4 + log * 0.2, 0.4), 2.8)
}

const FELL_COLOR = new THREE.Color('#f97316')
const FOUND_COLOR = new THREE.Color('#22d3ee')
const UNKNOWN_COLOR = new THREE.Color('#a78bfa')
const SELECTED_COLOR = new THREE.Color('#ffffff')

export function MeteoritePoints({ meteorites }) {
  const meshRef = useRef()
  const { selectedId, setSelectedId } = useGlobe()

  const filtered = useMemo(
    () =>
      meteorites
        .filter((m) => m.lat != null && m.lon != null)
        .slice(0, 10000),
    [meteorites]
  )

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || filtered.length === 0) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const color = new THREE.Color()

    filtered.forEach((m, i) => {
      const [x, y, z] = latLonToVec3(m.lat, m.lon, GLOBE_RADIUS)
      position.set(x, y, z)
      const s = BASE_SCALE * getMassScale(m.mass)
      scale.setScalar(s)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(i, matrix)

      if (m.id === selectedId) color.copy(SELECTED_COLOR)
      else if (m.fall === 'Fell') color.copy(FELL_COLOR)
      else if (m.fall === 'Found') color.copy(FOUND_COLOR)
      else color.copy(UNKNOWN_COLOR)

      mesh.setColorAt(i, color)
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.count = filtered.length
  }, [filtered, selectedId])

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      const m = filtered[e.instanceId]
      if (m) setSelectedId(m.id)
    },
    [filtered, setSelectedId]
  )

  if (filtered.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, 10000]}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  )
}
