import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'

/**
 * SignatureCamera – deterministic camera for Phase 2 reveal, performance, and power.
 *
 * Cinematic beats driven by scrollProgress:
 *   0.00‑0.30  Mystery – close, slightly off‑centre, slow drift.
 *   0.30‑0.55  Reveal  – stable front/three‑quarter view.
 *   0.55‑0.65  Transition into Performance – dramatic push-in, low & close.
 *   0.65‑0.72  Performance Hero Hold – Senna fills right ~65% of frame;
 *              left ~35% negative space for "2.8 s / 0–100 km/h".
 *   0.72‑0.78  Controlled deceleration / settlement into POWER.
 *   0.78‑0.88  POWER ("HELD FORCE") – target completely static, sustained stillness.
 *   0.88‑1.00  Release into final Hero – low, confident commercial front composition.
 */
export default function SignatureCamera({ scrollProgress, interactionRef }) {
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

  // Performance Hero poses (p ≈ 0.65–0.72)
  const PERF_ENTER_POS = new THREE.Vector3(2.2, 0.75, 1.5)
  const PERF_ENTER_TGT = new THREE.Vector3(-0.4, 0.55, -2.0)

  const PERF_HOLD_POS  = new THREE.Vector3(2.15, 0.72, 1.35)
  const PERF_HOLD_TGT  = new THREE.Vector3(-0.35, 0.53, -2.1)

  // POWER pose (p ≈ 0.78–0.88: "HELD FORCE")
  // Matches existing Performance exit pose; target completely static during hold
  const POWER_POS = new THREE.Vector3(1.8, 0.85, 1.8)
  const POWER_TGT = new THREE.Vector3(-0.2, 0.50, -1.5)

  // Hero pose (p = 1.00) – UNCHANGED
  const HERO_POS = new THREE.Vector3(0, 1.5, 5.0)
  const HERO_TGT = new THREE.Vector3(0, 0.5, 0)

  // Verified world-space presentation centre of the McLaren Senna at p=1.00
  const PRESENTATION_CENTER = new THREE.Vector3(0, 1.2656317, -2.4309483)
  const UP_AXIS = new THREE.Vector3(0, 1, 0)
  const MAX_ORBIT_RAD = (2.5 * Math.PI) / 180 // ±2.5 degrees max

  // Smooth‑follow refs (avoid per‑frame allocations)
  const smoothPos = useRef(MYSTERY_POS.clone())
  const smoothTgt = useRef(MYSTERY_TGT.clone())
  const targetPos = useRef(new THREE.Vector3())
  const targetTgt = useRef(new THREE.Vector3())

  // Display copies (ensuring scroll smoothing histories are never mutated)
  const displayPos = useRef(new THREE.Vector3())
  const displayTgt = useRef(new THREE.Vector3())

  // Interactive horizontal orbit angle (radians), exponentially damped
  const interactiveAngle = useRef(0)

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
  useFrame((state, delta) => {
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
      // Transition from Identity to Performance Hero (0.55‑0.65)
      const t = (p - 0.55) / 0.10
      const ease = t * t * (3 - 2 * t)
      tPos.copy(IDENTITY_POS).lerp(PERF_ENTER_POS, ease)
      tTgt.copy(IDENTITY_TGT).lerp(PERF_ENTER_TGT, ease)
    } else if (p <= 0.72) {
      // Performance Hero hold – subtle drift only (0.65‑0.72) (UNCHANGED)
      const t = (p - 0.65) / 0.07
      tPos.copy(PERF_ENTER_POS).lerp(PERF_HOLD_POS, t)
      tTgt.copy(PERF_ENTER_TGT).lerp(PERF_HOLD_TGT, t)
    } else if (p <= 0.78) {
      // 0.72–0.78: smoothly settle from PERF_HOLD toward POWER
      const t = (p - 0.72) / 0.06
      const ease = t * t * (3 - 2 * t)
      tPos.copy(PERF_HOLD_POS).lerp(POWER_POS, ease)
      tTgt.copy(PERF_HOLD_TGT).lerp(POWER_TGT, ease)
    } else if (p <= 0.88) {
      // 0.78–0.88: POWER TARGET COMPLETELY STATIC (sustained stillness)
      tPos.copy(POWER_POS)
      tTgt.copy(POWER_TGT)
    } else {
      // 0.88–1.00: smoothstep from POWER to the existing HERO_POS / HERO_TGT
      const t = (p - 0.88) / 0.12
      const ease = t * t * (3 - 2 * t)
      tPos.copy(POWER_POS).lerp(HERO_POS, ease)
      tTgt.copy(POWER_TGT).lerp(HERO_TGT, ease)
    }

    // Existing 0.07 smoothing lets camera finish settling naturally
    smoothPos.current.lerp(tPos, 0.07)
    smoothTgt.current.lerp(tTgt, 0.07)

    // Interaction authority:
    // p <= 0.98: ZERO camera interaction
    // p 0.98 -> 1.00: smooth ramp 0 -> 1
    let authority = 0
    if (p > 0.98) {
      const t = (p - 0.98) / 0.02
      authority = t * t * (3 - 2 * t)
    }

    const inter = interactionRef?.current
    let targetAngle = 0

    if (inter && inter.hasMouse && !inter.reducedMotion && inter.isValid && authority > 0.001) {
      let nx = inter.targetNormalizedX || 0
      // Small center dead zone to prevent micro-wobble
      if (Math.abs(nx) < 0.03) {
        nx = 0
      } else {
        nx = Math.sign(nx) * ((Math.abs(nx) - 0.03) / 0.97)
      }
      targetAngle = nx * MAX_ORBIT_RAD * authority
    }

    // Exponential damping: angle += (targetAngle - angle) * (1 - exp(-4 * delta))
    const dt = Math.min(delta, 0.1)
    const damp = 1 - Math.exp(-4 * dt)
    interactiveAngle.current += (targetAngle - interactiveAngle.current) * damp

    // When scrolling backward below interaction region, ensure zero residue
    if (authority <= 0.0001 && Math.abs(interactiveAngle.current) < 0.0001) {
      interactiveAngle.current = 0
    }

    // Assign display copies (preserving smoothPos and smoothTgt histories untouched)
    displayPos.current.copy(smoothPos.current)
    displayTgt.current.copy(smoothTgt.current)

    const angle = interactiveAngle.current
    if (Math.abs(angle) > 1e-5) {
      displayPos.current.sub(PRESENTATION_CENTER)
      displayPos.current.applyAxisAngle(UP_AXIS, angle)
      displayPos.current.add(PRESENTATION_CENTER)

      displayTgt.current.sub(PRESENTATION_CENTER)
      displayTgt.current.applyAxisAngle(UP_AXIS, angle)
      displayTgt.current.add(PRESENTATION_CENTER)
    }

    camera.position.copy(displayPos.current)
    camera.lookAt(displayTgt.current)
  })

  return null
}
