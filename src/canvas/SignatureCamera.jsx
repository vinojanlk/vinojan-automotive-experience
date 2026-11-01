import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'

/**
 * SignatureCamera – deterministic camera for Phase 2 reveal.
 *
 * * 0.00 – 0.75  : locked to a fixed high‑silhouette pose.
 * * 0.75 – 1.00 : smooth move to a low‑hero composition.
 *
 * The camera follows the same `scrollProgress` reference used by the
 * scene, ensuring deterministic behaviour on reverse scroll and jumps.
 */
export default function SignatureCamera({ scrollProgress }) {
  const { camera } = useThree()

  // Locked pose (covers the concealed car)
  const LOCK_POS = new THREE.Vector3(0, 4, 14)
  const LOCK_TGT = new THREE.Vector3(0, 1.4, 0)

  // Hero pose – low, wide, planted
  const HERO_POS = new THREE.Vector3(0, 1.5, 5)
  const HERO_TGT = new THREE.Vector3(0, 0.5, 0)

  const smoothPos = useRef(LOCK_POS.clone())
  const smoothTgt = useRef(LOCK_TGT.clone())

  useLayoutEffect(() => {
    camera.fov = 45
    camera.near = 0.1
    camera.far = 100
    camera.position.copy(LOCK_POS)
    camera.lookAt(LOCK_TGT)
    camera.updateProjectionMatrix()
  }, [camera])

  useFrame(() => {
    const p = scrollProgress?.current ?? 0
    let targetPos, targetTgt
    if (p < 0.75) {
      targetPos = LOCK_POS
      targetTgt = LOCK_TGT
    } else {
      // Interpolate from lock to hero as p goes 0.75 -> 1.0
      const t = (p - 0.75) / 0.25
      targetPos = LOCK_POS.clone().lerp(HERO_POS, t)
      targetTgt = LOCK_TGT.clone().lerp(HERO_TGT, t)
    }
    // Smooth follow – small inertia for cinematic feel
    smoothPos.current.lerp(targetPos, 0.07)
    smoothTgt.current.lerp(targetTgt, 0.07)
    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothTgt.current)
  })

  return null
}
