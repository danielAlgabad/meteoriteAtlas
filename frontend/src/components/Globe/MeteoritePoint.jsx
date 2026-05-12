import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGlobe } from '../../hooks/useGlobe'

const GLOBE_RADIUS = 1.005

// Reference camera distance — points are sized for this zoom level
const REF_DIST = 2.8

// Base world-space radius of each point at REF_DIST
const BASE_SCALE = 0.007

const WHITE = new THREE.Color('#ffffff')

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
  return Math.min(Math.max(0.4 + log * 0.18, 0.4), 2.2)
}

// One InstancedMesh per color — avoids vertex-color instability.
// useFrame patches only the scale diagonal (col-major 0, 5, 10) each frame
// so points keep a constant apparent screen size as the user zooms.
// Per-instance color (setColorAt) highlights the selected point in white
// without altering its size or adding extra geometry.
function PointGroup({ points, color, onClickPoint, selectedId }) {
  const meshRef = useRef()
  const baseColor = useMemo(() => new THREE.Color(color), [color])

  // Capacity only grows — never shrinks. Shrinking args triggers InstancedMesh
  // recreation in R3F, which destroys pointer-event state mid-interaction and
  // leaves the mesh without matrices until the next useEffect fires.
  const peakCountRef = useRef(0)
  const instanceCapacity = Math.max(peakCountRef.current, points.length)
  peakCountRef.current = instanceCapacity

  const baseScales = useMemo(
    () => Float32Array.from(points.map((m) => BASE_SCALE * getMassScale(m.mass))),
    [points]
  )

  // Surface normals (unit vectors) for each point — used every frame to test
  // whether the point is on the camera-facing hemisphere.
  const normals = useMemo(() => {
    const arr = new Float32Array(points.length * 3)
    points.forEach((m, i) => {
      const [x, y, z] = latLonToVec3(m.lat, m.lon, 1)
      arr[i * 3] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    })
    return arr
  }, [points])

  // Set initial instance matrices (position + reference scale)
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || points.length === 0) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    points.forEach((m, i) => {
      const [x, y, z] = latLonToVec3(m.lat, m.lon, GLOBE_RADIUS)
      position.set(x, y, z)
      scale.setScalar(baseScales[i])
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(i, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    mesh.count = points.length
  }, [points, baseScales])

  // Recolor instances when selection changes — selected turns white, others stay default.
  // Material color must be #ffffff so instance color passes through unmodified.
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || points.length === 0) return

    points.forEach((m, i) => {
      mesh.setColorAt(i, m.id === selectedId ? WHITE : baseColor)
    })

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [points, selectedId, baseColor])

  // Each frame: update scale for each point.
  // Points on the back hemisphere (dot product ≤ 0 with camera direction) get
  // scale = 0 — invisible and unreachable by raycasting. Front-facing points
  // keep zoom-proportional scale so they appear constant size on screen.
  useFrame(({ camera }) => {
    const mesh = meshRef.current
    if (!mesh || points.length === 0) return

    const dist = camera.position.length()
    const zoom = dist / REF_DIST
    const arr = mesh.instanceMatrix.array

    // Camera direction as unit vector (from globe center toward camera)
    const cx = camera.position.x / dist
    const cy = camera.position.y / dist
    const cz = camera.position.z / dist

    const count = Math.min(mesh.count, baseScales.length)
    for (let i = 0; i < count; i++) {
      const dot = normals[i * 3] * cx + normals[i * 3 + 1] * cy + normals[i * 3 + 2] * cz
      const s = dot > 0 ? baseScales[i] * zoom : 0
      const base = i * 16
      arr[base] = s
      arr[base + 5] = s
      arr[base + 10] = s
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  const downPos = useRef(null)

  const handlePointerDown = useCallback((e) => {
    downPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
  }, [])

  const handlePointerUp = useCallback(
    (e) => {
      if (!downPos.current) return
      const dx = e.nativeEvent.clientX - downPos.current.x
      const dy = e.nativeEvent.clientY - downPos.current.y
      downPos.current = null
      if (dx * dx + dy * dy > 25) return
      if (e.instanceId == null || e.instanceId >= points.length) return
      e.stopPropagation()
      onClickPoint(points[e.instanceId].id)
    },
    [points, onClickPoint]
  )

  if (points.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, instanceCapacity]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.78} />
    </instancedMesh>
  )
}

export function MeteoritePoints({ meteorites }) {
  const { selectedId, setSelectedId } = useGlobe()

  const allPoints = useMemo(
    () => meteorites.filter((m) => m.lat != null && m.lon != null),
    [meteorites]
  )

  const { fell, found, other } = useMemo(
    () => ({
      fell: allPoints.filter((m) => m.fall === 'Fell'),
      found: allPoints.filter((m) => m.fall === 'Found'),
      other: allPoints.filter((m) => m.fall !== 'Fell' && m.fall !== 'Found'),
    }),
    [allPoints]
  )

  if (allPoints.length === 0) return null

  return (
    <group>
      <PointGroup points={fell} color="#f97316" onClickPoint={setSelectedId} selectedId={selectedId} />
      <PointGroup points={found} color="#22d3ee" onClickPoint={setSelectedId} selectedId={selectedId} />
      <PointGroup points={other} color="#a78bfa" onClickPoint={setSelectedId} selectedId={selectedId} />
    </group>
  )
}
