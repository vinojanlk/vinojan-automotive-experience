import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'

/**
 * SignatureCamera – deterministic camera for Phase 2 reveal.
 *
 * Three cinematic beats driven by scrollProgress:
 *   0.00‑0.30  Mystery – close, slightly off‑centre, slow drift.
 *   0.30‑0.60  Reveal – stable front/three‑quarter view (minimal movement).
 *   0.60‑1.00  Hero   – low, confident commercial composition.
 *
 * Camera follows the same `scrollProgress` reference used by the scene,
 * ensuring deterministic behaviour on reverse scroll and jumps.
 */
export default function SignatureCamera({ scrollProgress }) {
  const { camera } = useThree()

  // ---- Pose definitions ---------------------------------------------------
  // Mystery start (p = 0.00)
  const MYSTERY_POS = new THREE.Vector3(1.2, 3.0, 9.0)
  const MYSTERY_TGT = new THREE.Vector3(0, 1.0, 0)

  // Reveal pose (stable during 0.30‑0.60)
  const REVEAL_POS = new THREE.Vector3(0.3, 3.3, 12.0)
  const REVEAL_TGT = new THREE.Vector3(0, 1.1, 0)

  // Hero pose (final)
  const HERO_POS = new THREE.Vector3(0, 1.5, 5.0)
  const HERO_TGT = new THREE.Vector3(0, 0.5, 0)

  // Smooth‑follow refs (avoid per‑frame allocations)
  const smoothPos = useRef(MYSTERY_POS.clone())
  const smoothTgt = useRef(MYSTERY_TGT.clone())

  // ---- Initial camera setup ---------------------------------------------
  useLayoutEffect(() => {
    camera.fov = 44 // within 42‑45° range
    camera.near = 0.1
    camera.far = 100
    camera.position.copy(MYSTERY_POS)
    camera.lookAt(MYSTERY_TGT)
    camera.updateProjectionMatrix()
  }, [camera])

  // ---- Per‑frame update ---------------------------------------------------
  useFrame(() => {
    const p = scrollProgress?.current ?? 0
    let targetPos = new THREE.Vector3()
    let targetTgt = new THREE.Vector3()

    if (p <= 0.30) {
      // Interpolate from Mystery start to Reveal pose over 0‑0.30
      const t = p / 0.30
      targetPos.copy(MYSTERY_POS).lerp(REVEAL_POS, t)
      targetTgt.copy(MYSTERY_TGT).lerp(REVEAL_TGT, t)
    } else if (p <= 0.60) {
      // Stable Reveal pose – minimal movement
      targetPos.copy(REVEAL_POS)
      targetTgt.copy(REVEAL_TGT)
    } else {
      // Hero interpolation from Reveal to Hero over 0.60‑1.00
      const t = (p - 0.60) / 0.40
      targetPos.copy(REVEAL_POS).lerp(HERO_POS, t)
      targetTgt.copy(REVEAL_TGT).lerp(HERO_TGT, t)
    }

    // Smooth follow – small inertia for cinematic feel
    smoothPos.current.lerp(targetPos, 0.07)
    smoothTgt.current.lerp(targetTgt, 0.07)
    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothTgt.current)
  })

  return null
}
