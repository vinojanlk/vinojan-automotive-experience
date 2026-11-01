import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA KEYFRAMES
//
// Format: { p: scrollProgress 0–1, pos: [x,y,z], target: [x,y,z] }
//
// Designed with vmotion-director scene structure in mind:
//
//  0.00 – Scene 01: Mystery — wide, high, static
//  0.15 – Scene 02: Covered car — push forward, slightly down
//  0.35 – Scene 02/03: Closer to cover, anticipation
//  0.55 – Scene 03: Reveal begins, slight offset front
//  0.70 – Scene 04: Front identity, car revealed
//  0.85 – Scene 05: Pull back to side profile
//  1.00 – Scene 06: Hero pullback, final composition
//
// Extend this table as new scenes are added — no other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────
const KEYFRAMES = [
  { p: 0.00, pos: [0,    4.0, 14.0], target: [0, 1.4, 0] },
  { p: 0.15, pos: [0,    3.2, 11.0], target: [0, 1.1, 0] },
  { p: 0.35, pos: [0.5,  2.8,  9.0], target: [0, 0.9, 0] },
  { p: 0.55, pos: [-1.5, 2.4,  8.5], target: [0, 0.8, 0] },
  { p: 0.70, pos: [-2.5, 2.2,  8.0], target: [0, 0.7, 0] },
  { p: 0.85, pos: [-6.0, 2.5,  5.0], target: [0, 0.8, 0] },
  { p: 1.00, pos: [-4.0, 5.0, 14.0], target: [0, 1.0, 0] },
]

/**
 * Sample camera state at a given scroll progress value.
 * Finds the surrounding keyframes and interpolates with ease-in-out cubic.
 */
function sampleKeyframes(keyframes, progress) {
  let from = keyframes[0]
  let to = keyframes[keyframes.length - 1]

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].p && progress <= keyframes[i + 1].p) {
      from = keyframes[i]
      to = keyframes[i + 1]
      break
    }
  }

  const span = to.p - from.p
  const t = span === 0 ? 0 : (progress - from.p) / span
  // Ease-in-out cubic
  const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  return {
    pos: from.pos.map((v, i) => v + (to.pos[i] - v) * ease),
    target: from.target.map((v, i) => v + (to.target[i] - v) * ease),
  }
}

/**
 * CinematicCamera
 *
 * Reads scrollProgress each frame and moves the camera along
 * the authored keyframe path. A lerp factor of 0.06 provides
 * cinematic inertia without disconnecting from scroll position.
 *
 * No OrbitControls — camera is fully owned by the cinematic sequence.
 */
export default function CinematicCamera({ scrollProgress }) {
  const { camera } = useThree()

  const smoothPos = useRef(new THREE.Vector3(...KEYFRAMES[0].pos))
  const smoothTarget = useRef(new THREE.Vector3(...KEYFRAMES[0].target))
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    camera.fov = 45
    camera.near = 0.1
    camera.far = 100
    camera.position.set(...KEYFRAMES[0].pos)
    camera.lookAt(...KEYFRAMES[0].target)
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame(() => {
    const { pos, target } = sampleKeyframes(KEYFRAMES, scrollProgress.current)

    targetPos.current.set(...pos)
    targetLookAt.current.set(...target)

    // Smooth follow — cinematic inertia
    smoothPos.current.lerp(targetPos.current, 0.06)
    smoothTarget.current.lerp(targetLookAt.current, 0.06)

    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothTarget.current)
  })

  return null
}
