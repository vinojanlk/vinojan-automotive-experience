import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTING KEYFRAMES
//
// Each light has an independent intensity curve keyed to scroll progress.
// All lights start at near-zero — darkness is Scene 01's composition.
//
// Lights defined:
//   ambient   — tiny fill to prevent pure black rendering artifacts
//   stripTop  — overhead strip reveals form through fabric/cover folds & roofline
//   keyFront  — primary key light for the front of the car
//   fillSide  — soft fill on the driver/passenger side
//   rimBack   — rear rim light for silhouette and depth
//   envScale  — reveal-scale curve for controlled darkness during cloth->car swap
//
// POWER ("HELD FORCE") plateau at 0.78–0.88:
//   stripTop ≈ 1.10, keyFront ≈ 2.00, fillSide ≈ 0.35, rimBack ≈ 0.80
// ─────────────────────────────────────────────────────────────────────────────
const ENV_BASE = 0.8

const CURVES = {
  envScale: [
    { p: 0.00, v: 1.00 },
    { p: 0.34, v: 1.00 },
    { p: 0.42, v: 0.03 },
    { p: 0.46, v: 0.03 },
    { p: 0.52, v: 0.25 },
    { p: 0.58, v: 1.00 },
    { p: 1.00, v: 1.00 },
  ],
  ambient:  [
    { p: 0.00, v: 0.03 },
    { p: 1.00, v: 0.08 },
  ],
  stripTop: [
    { p: 0.00, v: 0.00 },
    { p: 0.05, v: 0.12 },
    { p: 0.12, v: 0.35 },
    { p: 0.20, v: 0.55 },
    { p: 0.30, v: 0.20 },
    { p: 0.40, v: 0.02 },
    { p: 0.44, v: 0.02 },
    { p: 0.47, v: 0.20 },
    { p: 0.52, v: 0.35 },
    { p: 0.60, v: 0.80 },
    { p: 0.72, v: 1.04 },
    { p: 0.75, v: 1.10 },
    { p: 0.78, v: 1.10 }, // POWER plateau begin
    { p: 0.88, v: 1.10 }, // POWER plateau end
    { p: 1.00, v: 1.00 },
  ],
  keyFront: [
    { p: 0.00, v: 0.00 },
    { p: 0.50, v: 0.00 },
    { p: 0.65, v: 1.80 },
    { p: 0.72, v: 1.94 },
    { p: 0.75, v: 2.00 },
    { p: 0.78, v: 2.00 }, // POWER plateau begin
    { p: 0.88, v: 2.00 }, // POWER plateau end
    { p: 1.00, v: 2.50 },
  ],
  fillSide: [
    { p: 0.00, v: 0.00 },
    { p: 0.65, v: 0.00 },
    { p: 0.72, v: 0.4667 },
    { p: 0.75, v: 0.6667 },
    { p: 0.78, v: 0.35 }, // POWER plateau begin (deep directional shadow)
    { p: 0.88, v: 0.35 }, // POWER plateau end
    { p: 1.00, v: 1.20 },
  ],
  rimBack:  [
    { p: 0.00, v: 0.00 },
    { p: 0.75, v: 0.00 },
    { p: 0.78, v: 0.80 }, // POWER plateau begin (rear silhouette separation)
    { p: 0.88, v: 0.80 }, // POWER plateau end
    { p: 1.00, v: 1.00 },
  ],
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
 *
 * Acceleration Cue (0.60–0.75):
 *   A single narrow highlight travels smoothly across the car body once,
 *   reinforcing forward intent and articulating the aerodynamic silhouette.
 *
 * POWER Cue (0.78–0.88):
 *   Stable sculptural lighting plateau with deep directional shadow and rear silhouette separation.
 */
export default function StudioLighting({ scrollProgress }) {
  const { scene } = useThree()
  const ambientRef        = useRef()
  const stripRef          = useRef()
  const keyRef            = useRef()
  const fillRef           = useRef()
  const rimRef            = useRef()
  const accelHighlightRef = useRef()

  // Dedicated stationary/tracking target for the acceleration spotlight
  const accelTarget = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    const p = scrollProgress.current
    if (scene) scene.environmentIntensity = ENV_BASE * sample(CURVES.envScale, p)
    if (ambientRef.current)  ambientRef.current.intensity = sample(CURVES.ambient,  p)
    if (stripRef.current)    stripRef.current.intensity   = sample(CURVES.stripTop, p)
    if (keyRef.current)      keyRef.current.intensity     = sample(CURVES.keyFront, p)
    if (fillRef.current)     fillRef.current.intensity    = sample(CURVES.fillSide, p)
    if (rimRef.current)      rimRef.current.intensity     = sample(CURVES.rimBack,  p)

    // Body highlight travel: single pass strictly during 0.60–0.75 (UNCHANGED)
    if (accelHighlightRef.current) {
      if (p >= 0.595 && p <= 0.755) {
        accelHighlightRef.current.visible = true

        const t = Math.max(0, Math.min(1, (p - 0.60) / 0.15))
        // Smootherstep S-curve for progressive movement
        const ease = t * t * t * (t * (t * 6 - 15) + 10)

        // Travel along car flank and roofline from front (+0.5) to rear (-5.5)
        const lx = 1.7 + (1.0 - 1.7) * ease
        const ly = 2.6 + (2.1 - 2.6) * ease
        const lz = 0.5 + (-5.5 - 0.5) * ease
        accelHighlightRef.current.position.set(lx, ly, lz)

        // Target tracks along the vehicle body
        const tz = -1.2 + (-4.2 - (-1.2)) * ease
        accelTarget.position.set(0.15, 0.65, tz)
        accelTarget.updateMatrixWorld()

        // Intensity envelope: rise, hold, resolve, stop
        let intensity = 0
        if (p >= 0.60 && p < 0.64) {
          intensity = 2.2 * ((p - 0.60) / 0.04)
        } else if (p >= 0.64 && p <= 0.70) {
          intensity = 2.2
        } else if (p > 0.70 && p <= 0.75) {
          intensity = 2.2 * Math.max(0, 1 - (p - 0.70) / 0.05)
        }
        accelHighlightRef.current.intensity = intensity
      } else {
        accelHighlightRef.current.visible = false
        accelHighlightRef.current.intensity = 0
      }
    }
  })

  return (
    <>
      {/* Target object for acceleration traveling spotlight */}
      <primitive object={accelTarget} />

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

      {/* Acceleration traveling highlight — narrow, controlled body sweep (0.60–0.75) */}
      <spotLight
        ref={accelHighlightRef}
        target={accelTarget}
        color="#f4f8fc"
        intensity={0}
        position={[1.7, 2.6, 0.5]}
        angle={0.28}
        penumbra={0.85}
        distance={16}
        decay={2}
        castShadow={false}
        visible={false}
      />
    </>
  )
}
