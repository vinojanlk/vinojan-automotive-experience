import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTING KEYFRAMES
//
// Each light has an independent intensity curve keyed to scroll progress.
// All lights start at near-zero — darkness is Scene 01's composition.
//
// Lights defined:
//   ambient   — tiny fill to prevent pure black rendering artifacts
//   stripTop  — overhead strip reveals form through fabric/cover folds
//   keyFront  — primary key light for the front of the car
//   fillSide  — soft fill on the driver/passenger side
//   rimBack   — rear rim light for silhouette and depth
//
// Extend these curves as new scenes are added.
// ─────────────────────────────────────────────────────────────────────────────
const CURVES = {
  ambient:  [{ p: 0.00, v: 0.03 }, { p: 1.00, v: 0.08 }],
  stripTop: [{ p: 0.00, v: 0.00 }, { p: 0.12, v: 0.50 }, { p: 0.40, v: 1.20 }, { p: 0.60, v: 0.80 }, { p: 1.00, v: 1.00 }],
  keyFront: [{ p: 0.00, v: 0.00 }, { p: 0.50, v: 0.00 }, { p: 0.65, v: 1.80 }, { p: 0.85, v: 2.20 }, { p: 1.00, v: 2.50 }],
  fillSide: [{ p: 0.00, v: 0.00 }, { p: 0.65, v: 0.00 }, { p: 0.80, v: 1.00 }, { p: 1.00, v: 1.20 }],
  rimBack:  [{ p: 0.00, v: 0.00 }, { p: 0.75, v: 0.00 }, { p: 0.90, v: 1.20 }, { p: 1.00, v: 1.00 }],
}

function sample(curve, progress) {
  let from = curve[0]
  let to = curve[curve.length - 1]
  for (let i = 0; i < curve.length - 1; i++) {
    if (progress >= curve[i].p && progress <= curve[i + 1].p) {
      from = curve[i]
      to = curve[i + 1]
      break
    }
  }
  const span = to.p - from.p
  const t = span === 0 ? 0 : (progress - from.p) / span
  return from.v + (to.v - from.v) * t
}

/**
 * StudioLighting
 *
 * All lights are created once and persist through the experience.
 * Intensities are driven frame-by-frame by scroll progress.
 *
 * automotive-lighting-director principle:
 *   Darkness is part of the composition.
 *   Light reveals the vehicle — it does not simply illuminate everything.
 */
export default function StudioLighting({ scrollProgress }) {
  const ambientRef  = useRef()
  const stripRef    = useRef()
  const keyRef      = useRef()
  const fillRef     = useRef()
  const rimRef      = useRef()

  useFrame(() => {
    const p = scrollProgress.current
    if (ambientRef.current)  ambientRef.current.intensity = sample(CURVES.ambient,  p)
    if (stripRef.current)    stripRef.current.intensity   = sample(CURVES.stripTop, p)
    if (keyRef.current)      keyRef.current.intensity     = sample(CURVES.keyFront, p)
    if (fillRef.current)     fillRef.current.intensity    = sample(CURVES.fillSide, p)
    if (rimRef.current)      rimRef.current.intensity     = sample(CURVES.rimBack,  p)
  })

  return (
    <>
      {/* Ambient — prevents WebGL black-artefact on unlit faces */}
      <ambientLight
        ref={ambientRef}
        color="#ffffff"
        intensity={0.03}
      />

      {/* Strip top — wide overhead panel, reveals cover folds and body form */}
      <rectAreaLight
        ref={stripRef}
        color="#f0ece8"
        intensity={0}
        width={14}
        height={1.2}
        position={[0, 9, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Key front — primary automotive key light */}
      <spotLight
        ref={keyRef}
        color="#f8f4f0"
        intensity={0}
        position={[3, 7, 9]}
        angle={0.28}
        penumbra={0.85}
        distance={30}
        decay={2}
        castShadow={false}
      />

      {/* Fill side — soft fill from driver side */}
      <spotLight
        ref={fillRef}
        color="#d8e4f0"
        intensity={0}
        position={[-7, 4, 3]}
        angle={0.45}
        penumbra={1.0}
        distance={25}
        decay={2}
        castShadow={false}
      />

      {/* Rim back — rear silhouette light */}
      <spotLight
        ref={rimRef}
        color="#c0d0e8"
        intensity={0}
        position={[1.5, 5, -9]}
        angle={0.35}
        penumbra={0.7}
        distance={22}
        decay={2}
        castShadow={false}
      />
    </>
  )
}
