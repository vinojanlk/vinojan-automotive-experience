import { Canvas } from '@react-three/fiber'
import { Suspense, useRef, useEffect } from 'react'
import StudioEnvironment from './StudioEnvironment'
import StudioLighting from './StudioLighting'
import SignatureCamera from './SignatureCamera'
import Phase2Reveal from './Phase2Reveal'
import GalleryArchitecture from './GalleryArchitecture'
import PostEffects from './PostEffects'

/**
 * SceneCanvas
 *
 * The single persistent Three.js canvas.
 * Lives inside the sticky viewport — never unmounts.
 * All animated values are driven by scrollProgress ref via useFrame,
 * so there are no React re-renders during the scroll experience.
 *
 * Owns ONE lightweight shared interaction ref for subtle living-gallery
 * camera parallax and idle studio light excursion.
 */
export default function SceneCanvas({ scrollProgress }) {
  const interactionRef = useRef({
    targetNormalizedX: 0, // -1 (left) to +1 (right)
    hasMouse: false,      // true only if pointerType === 'mouse'
    lastActiveTime: 0,    // performance.now() of last significant pointer motion
    isActive: false,      // pointer moving recently (< 120ms)
    isValid: false,       // document focused, not hidden, pointer inside
    reducedMotion: false, // prefers-reduced-motion
  })

  useEffect(() => {
    const inter = interactionRef.current
    if (typeof window === 'undefined') return

    // Motion preference check
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    inter.reducedMotion = mql.matches
    const onMotionChange = (e) => {
      inter.reducedMotion = e.matches
    }
    mql.addEventListener?.('change', onMotionChange)

    let lastClientX = -9999
    let activeResetTimeout = null

    const onPointerMove = (e) => {
      // Touch input / pen: NO interactive camera or light excursion
      if (e.pointerType && e.pointerType !== 'mouse') {
        inter.hasMouse = false
        return
      }

      inter.hasMouse = true
      inter.isValid = true

      const dx = Math.abs(e.clientX - lastClientX)
      // Ignore sub-2px jitter when updating activity timestamp
      if (dx > 2) {
        inter.lastActiveTime = performance.now()
        inter.isActive = true
        lastClientX = e.clientX

        if (activeResetTimeout) clearTimeout(activeResetTimeout)
        activeResetTimeout = setTimeout(() => {
          inter.isActive = false
        }, 120)
      }

      // Normalized horizontal position across window [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      inter.targetNormalizedX = Math.max(-1, Math.min(1, nx))
    }

    const onPointerLeave = () => {
      inter.targetNormalizedX = 0
      inter.isValid = false
      inter.isActive = false
    }

    const onBlur = () => {
      inter.targetNormalizedX = 0
      inter.isValid = false
      inter.isActive = false
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        inter.targetNormalizedX = 0
        inter.isValid = false
        inter.isActive = false
      } else {
        inter.isValid = true
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (activeResetTimeout) clearTimeout(activeResetTimeout)
      mql.removeEventListener?.('change', onMotionChange)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Deep black background — set at the Three.js level */}
      <color attach="background" args={['#050507']} />

      <Suspense fallback={null}>
        {/* Camera locked during reveal – controlled by SignatureCamera */}
        <SignatureCamera scrollProgress={scrollProgress} interactionRef={interactionRef} />

        {/* Studio: dark floor with subtle reflection, atmospheric fog & grounding */}
        <StudioEnvironment />

        {/* Midnight gallery architecture – emerges after reveal */}
        <GalleryArchitecture scrollProgress={scrollProgress} />

        {/* Lighting rig — all intensities start near-zero, animate with scroll */}
        <StudioLighting scrollProgress={scrollProgress} interactionRef={interactionRef} />

        {/* Phase 2 signature reveal */}
        <Phase2Reveal scrollProgress={scrollProgress} />

        {/* Post-processing: restrained Bloom + Vignette */}
        <PostEffects />
      </Suspense>
    </Canvas>
  )
}
