import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'

/**
 * SignatureCamera – deterministic camera for Phase 2 reveal & performance.
 *
 * Cinematic beats driven by scrollProgress:
 *   0.00‑0.30  Mystery – close, slightly off‑centre, slow drift.
 *   0.30‑0.55  Reveal  – stable front/three‑quarter view.
 *   0.55‑0.65  Transition into Performance – dramatic push-in, low & close.
 *   0.65‑0.72  Performance Hero Hold – Senna fills right ~65% of frame;
 *              left ~35% negative space for "2.8 s / 0–100 km/h".
 *   0.72‑0.75  Transition out toward Powertrain/Hero.
 *   0.75‑1.00  Hero – low, confident commercial front composition.
 */
export default function SignatureCamera({ scrollProgress }) {
  const { camera } = useThree()

  // ---- Pose definitions ---------------------------------------------------
  // Mystery start (p = 0.00)
  const MYSTERY_POS = new THREE.Vector3(1.2, 3.0, 9.0)
  const MYSTERY_TGT = new THREE.Vector3(0, 1.0, 0)

  // Reveal pose (stable during 0.30‑0.55)
  const REVEAL_POS = new THREE.Vector3(0.3, 3.3, 12.0)
  const REVEAL_TGT = new THREE.Vector3(0, 1.1, 0)

  // Identity pose (p ≈ 0.55)
  const IDENTITY_POS = new THREE.Vector3(0.6, 3.2, 10.5)
  const IDENTITY_TGT = new THREE.Vector3(0, 1.1, 0)

  // Performance Hero poses (p ≈ 0.65–0.72):
  // Very close, low front three-quarter. Camera almost at bumper height.
  // Car post-reveal sits at [0, 0.45, -2.5], faces +Z, front at Z ≈ +0.88.
  // Camera at Z ≈ 1.5 puts it ~0.6m from the front face → car fills ~75% of viewport width.
  // X offset of +2.2 pushes car mass hard right, opening left negative space.
  const PERF_ENTER_POS = new THREE.Vector3(2.2, 0.75, 1.5)
  const PERF_ENTER_TGT = new THREE.Vector3(-0.4, 0.55, -2.0)

  const PERF_HOLD_POS  = new THREE.Vector3(2.15, 0.72, 1.35)
  const PERF_HOLD_TGT  = new THREE.Vector3(-0.35, 0.53, -2.1)

  const PERF_EXIT_POS  = new THREE.Vector3(1.8, 0.85, 1.8)
  const PERF_EXIT_TGT  = new THREE.Vector3(-0.2, 0.50, -1.5)

  // Hero pose (p = 1.00) – UNCHANGED
  const HERO_POS = new THREE.Vector3(0, 1.5, 5.0)
  const HERO_TGT = new THREE.Vector3(0, 0.5, 0)

  // Smooth‑follow refs (avoid per‑frame allocations)
  const smoothPos = useRef(MYSTERY_POS.clone())
  const smoothTgt = useRef(MYSTERY_TGT.clone())
  const targetPos = useRef(new THREE.Vector3())
  const targetTgt = useRef(new THREE.Vector3())

  // ---- Initial camera setup ---------------------------------------------
  useLayoutEffect(() => {
    camera.fov = 44
    camera.near = 0.1
    camera.far = 100
    camera.position.copy(MYSTERY_POS)
    camera.lookAt(MYSTERY_TGT)
    camera.updateProjectionMatrix()
  }, [camera])

  // ---- Per‑frame update ---------------------------------------------------
  useFrame(() => {
    const p = scrollProgress?.current ?? 0
    const tPos = targetPos.current
    const tTgt = targetTgt.current

    if (p <= 0.30) {
      const t = p / 0.30
      tPos.copy(MYSTERY_POS).lerp(REVEAL_POS, t)
      tTgt.copy(MYSTERY_TGT).lerp(REVEAL_TGT, t)
    } else if (p <= 0.55) {
      const t = (p - 0.30) / 0.25
      tPos.copy(REVEAL_POS).lerp(IDENTITY_POS, t)
      tTgt.copy(REVEAL_TGT).lerp(IDENTITY_TGT, t)
    } else if (p <= 0.65) {
      // Dramatic push-in from Identity to Performance Hero (0.55‑0.65)
      const t = (p - 0.55) / 0.10
      const ease = t * t * (3 - 2 * t)
      tPos.copy(IDENTITY_POS).lerp(PERF_ENTER_POS, ease)
      tTgt.copy(IDENTITY_TGT).lerp(PERF_ENTER_TGT, ease)
    } else if (p <= 0.72) {
      // Performance Hero hold – very subtle drift only (0.65‑0.72)
      const t = (p - 0.65) / 0.07
      tPos.copy(PERF_ENTER_POS).lerp(PERF_HOLD_POS, t)
      tTgt.copy(PERF_ENTER_TGT).lerp(PERF_HOLD_TGT, t)
    } else if (p <= 0.75) {
      // Transition out of Performance (0.72‑0.75)
      const t = (p - 0.72) / 0.03
      const ease = t * t * (3 - 2 * t)
      tPos.copy(PERF_HOLD_POS).lerp(PERF_EXIT_POS, ease)
      tTgt.copy(PERF_HOLD_TGT).lerp(PERF_EXIT_TGT, ease)
    } else {
      // Hero transition (0.75‑1.00)
      const t = (p - 0.75) / 0.25
      tPos.copy(PERF_EXIT_POS).lerp(HERO_POS, t)
      tTgt.copy(PERF_EXIT_TGT).lerp(HERO_TGT, t)
    }

    smoothPos.current.lerp(tPos, 0.07)
    smoothTgt.current.lerp(tTgt, 0.07)
    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothTgt.current)
  })

  return null
}
