import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * GalleryArchitecture — Prototype V1 Refined
 *
 * Restrained architectural backdrop located around Z ≈ -12.
 * Visual rhythm:
 *   SOLID (Panel 1)
 *   → RECESS (Recess 1, x > -9)
 *   → SOLID (Panel 2)
 *   → LONG QUIET SECTION (Panel 3, behind Senna)
 *   → RECESS (Recess 2, central accent)
 *   → SOLID (Panel 4)
 *   → RECESS (Recess 3, right flank)
 *   → SOLID (Panel 5 & 6, right terminal)
 *
 * Palette:
 *   Main dark panel: #141619
 *   Secondary warm charcoal: #1c1a17
 *   Recess return jambs: #24201c
 *   Recess diffuser illumination: #B7AA96
 *
 * Scroll Progression:
 *   p < 0.65      : Entire group hidden (visible = false)
 *   p 0.65–0.72   : Appears very gently from 0 to 35% visual strength
 *   p 0.72–0.88   : HOLD at 35% (POWER chapter owns the frame, zero gallery animation)
 *   p 0.88–0.96   : Progresses from 35% to 100% final presence
 *   p 0.96–1.00   : HOLD at 100% final presence
 */

// Architectural layout parameters with depth stagger & 50cm physical reveals
const PANELS = [
  // 1. Far Left Solid (x: -13.0 to -8.82) — Dark anchor behind left typography
  { id: 'p1', x: -10.91, y: 1.8, z: -12.02, w: 4.18, h: 3.6, d: 0.30, mat: 'dark' },

  // 2. Recess 1 Opening (x: -8.80 to -7.60) — First warm diffuser, safely right of x = -9
  { id: 'r1-diffuser', x: -8.20, y: 1.8, z: -12.35, w: 1.16, h: 3.3, d: 0.05, mat: 'recess' },
  { id: 'r1-jamb-l',   x: -8.79, y: 1.8, z: -12.10, w: 0.04, h: 3.6, d: 0.50, mat: 'jamb' },
  { id: 'r1-jamb-r',   x: -7.61, y: 1.8, z: -12.10, w: 0.04, h: 3.6, d: 0.50, mat: 'jamb' },

  // 3. Intermediate Solid (x: -7.58 to -4.62) — Warm charcoal panel, subtle forward reveal
  { id: 'p2', x: -6.10, y: 1.8, z: -11.96, w: 2.96, h: 3.6, d: 0.32, mat: 'warm' },

  // 4. Long Quiet Center (x: -4.58 to -0.82) — Deep dark anchor behind vehicle body
  { id: 'p3', x: -2.70, y: 1.8, z: -12.04, w: 3.76, h: 3.6, d: 0.30, mat: 'dark' },

  // 5. Recess 2 Opening (x: -0.80 to +0.40) — Central accent
  { id: 'r2-diffuser', x: -0.20, y: 1.8, z: -12.35, w: 1.16, h: 3.3, d: 0.05, mat: 'recess' },
  { id: 'r2-jamb-l',   x: -0.79, y: 1.8, z: -12.10, w: 0.04, h: 3.6, d: 0.50, mat: 'jamb' },
  { id: 'r2-jamb-r',   x: +0.39, y: 1.8, z: -12.10, w: 0.04, h: 3.6, d: 0.50, mat: 'jamb' },

  // 6. Solid Transition (x: +0.42 to +2.38) — Warm charcoal transition panel
  { id: 'p4', x: 1.40, y: 1.8, z: -11.96, w: 1.96, h: 3.6, d: 0.32, mat: 'warm' },

  // 7. Recess 3 Opening (x: +2.40 to +3.40) — Right flank accent
  { id: 'r3-diffuser', x: 2.90, y: 1.8, z: -12.35, w: 0.96, h: 3.3, d: 0.05, mat: 'recess' },
  { id: 'r3-jamb-l',   x: 2.41, y: 1.8, z: -12.10, w: 0.04, h: 3.6, d: 0.50, mat: 'jamb' },
  { id: 'r3-jamb-r',   x: 3.39, y: 1.8, z: -12.10, w: 0.04, h: 3.6, d: 0.50, mat: 'jamb' },

  // 8. Right Solid Panels (x: +3.42 to +5.80) — Terminal panels with reveal gap
  { id: 'p5', x: 4.10, y: 1.8, z: -12.04, w: 1.36, h: 3.6, d: 0.30, mat: 'dark' },
  { id: 'p6', x: 5.30, y: 1.8, z: -11.96, w: 1.00, h: 3.6, d: 0.32, mat: 'warm' },
]

export default function GalleryArchitecture({ scrollProgress }) {
  const groupRef        = useRef()
  const darkMatRef      = useRef()
  const warmMatRef      = useRef()
  const jambMatRef      = useRef()
  const recessMatRef    = useRef()

  // Base palette definitions (never mutated)
  const BASE_DARK   = useMemo(() => new THREE.Color('#141619'), [])
  const BASE_WARM   = useMemo(() => new THREE.Color('#1c1a17'), [])
  const BASE_JAMB   = useMemo(() => new THREE.Color('#24201c'), [])
  const BASE_RECESS = useMemo(() => new THREE.Color('#B7AA96'), [])

  // Inexpensive shared materials (instantiated once)
  const materials = useMemo(() => {
    const dark = new THREE.MeshStandardMaterial({
      color: BASE_DARK.clone(),
      emissive: new THREE.Color('#0c0d10'),
      emissiveIntensity: 0,
      roughness: 0.88,
      metalness: 0.08,
      depthWrite: true,
    })
    const warm = new THREE.MeshStandardMaterial({
      color: BASE_WARM.clone(),
      emissive: new THREE.Color('#12100d'),
      emissiveIntensity: 0,
      roughness: 0.88,
      metalness: 0.08,
      depthWrite: true,
    })
    const jamb = new THREE.MeshStandardMaterial({
      color: BASE_JAMB.clone(),
      emissive: new THREE.Color('#171410'),
      emissiveIntensity: 0,
      roughness: 0.82,
      metalness: 0.10,
      depthWrite: true,
    })
    const recess = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 0, 0),
      fog: true,
      depthWrite: true,
    })

    darkMatRef.current   = dark
    warmMatRef.current   = warm
    jambMatRef.current   = jamb
    recessMatRef.current = recess

    return { dark, warm, jamb, recess }
  }, [BASE_DARK, BASE_WARM, BASE_JAMB])

  // Smoothstep utility
  const smoothstep = (min, max, val) => {
    const x = Math.max(0, Math.min(1, (val - min) / (max - min)))
    return x * x * (3 - 2 * x)
  }

  useFrame(() => {
    const p = scrollProgress?.current ?? 0

    if (!groupRef.current) return

    // 0.00–0.65: Gallery completely removed from rendering
    if (p < 0.65) {
      if (groupRef.current.visible) {
        groupRef.current.visible = false
      }
      return
    }

    if (!groupRef.current.visible) {
      groupRef.current.visible = true
    }

    // Progression curve:
    //   p: 0.65 -> 0.72 : 0.00 -> 0.35
    //   p: 0.72 -> 0.88 : 0.35 (HOLD)
    //   p: 0.88 -> 0.96 : 0.35 -> 1.00
    //   p: 0.96 -> 1.00 : 1.00 (HOLD)
    let factor = 0
    if (p >= 0.65 && p < 0.72) {
      const t = smoothstep(0.65, 0.72, p)
      factor = 0.35 * t
    } else if (p >= 0.72 && p <= 0.88) {
      factor = 0.35
    } else if (p > 0.88 && p <= 0.96) {
      const t = smoothstep(0.88, 0.96, p)
      factor = 0.35 + 0.65 * t
    } else if (p > 0.96) {
      factor = 1.0
    }

    // Recess diffuser luminance: subdued warm glow (capped at 0.38)
    // Lower than initial prototype (0.55) to prevent stark flat rectangles
    const recessLuminance = factor * 0.38
    if (recessMatRef.current) {
      recessMatRef.current.color.copy(BASE_RECESS).multiplyScalar(recessLuminance)
    }

    // Panels emerge subtly from deep atmospheric void
    // At p≈0.70 / 0.82 (factor = 0.35): emissiveIntensity is low (~0.26), panels stay deep in shadow
    // At p=1.00 (factor = 1.0): emissiveIntensity reaches calibrated levels, panels separate softly from #050507
    const panelPresence = 0.25 + 0.75 * factor
    if (darkMatRef.current) {
      darkMatRef.current.color.copy(BASE_DARK).multiplyScalar(panelPresence)
      darkMatRef.current.emissiveIntensity = factor * 0.75
    }
    if (warmMatRef.current) {
      warmMatRef.current.color.copy(BASE_WARM).multiplyScalar(panelPresence)
      warmMatRef.current.emissiveIntensity = factor * 0.85
    }
    if (jambMatRef.current) {
      jambMatRef.current.color.copy(BASE_JAMB).multiplyScalar(panelPresence)
      jambMatRef.current.emissiveIntensity = factor * 0.90
    }
  })

  return (
    <group ref={groupRef} name="gallery-architecture" visible={false}>
      {PANELS.map((p) => {
        const mat =
          p.mat === 'recess'
            ? materials.recess
            : p.mat === 'jamb'
            ? materials.jamb
            : p.mat === 'warm'
            ? materials.warm
            : materials.dark

        return (
          <mesh
            key={p.id}
            position={[p.x, p.y, p.z]}
            material={mat}
            receiveShadow={false}
          >
            <boxGeometry args={[p.w, p.h, p.d]} />
          </mesh>
        )
      })}
    </group>
  )
}
