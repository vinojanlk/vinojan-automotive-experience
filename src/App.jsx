import { Suspense, useRef, useEffect, useState } from 'react'
import { useScrollProgress } from './core/useScrollProgress'
import SceneCanvas from './canvas/SceneCanvas'
import Logo from './overlay/Logo'
import LoadingScreen from './overlay/LoadingScreen'

/**
 * Temporary debug overlay — shows raw scroll and progress values.
 * Remove after confirming the scroll pipeline works.
 */
function DebugHUD({ scrollProgress }) {
  const ref = useRef()
  useEffect(() => {
    let raf
    const loop = () => {
      if (ref.current) {
        const scrollY = window.scrollY
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const raw = maxScroll > 0 ? scrollY / maxScroll : 0
        const p = scrollProgress.current
        ref.current.textContent =
          `scrollY: ${scrollY.toFixed(0)}  max: ${maxScroll.toFixed(0)}  raw: ${raw.toFixed(4)}  progress: ${p.toFixed(4)}`
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [scrollProgress])
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        color: '#0f0',
        fontSize: 12,
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.6)',
        padding: '4px 8px',
        borderRadius: 4,
      }}
    />
  )
}

/**
 * App — root layout
 *
 * Architecture:
 *   #scroll-container  (900vh tall — controls total experience duration)
 *   └── #sticky-viewport  (100vh sticky — the canvas never scrolls away)
 *       ├── SceneCanvas   (Three.js / R3F — always alive, never unmounts)
 *       ├── Logo          (HTML overlay — driven by scrollProgress ref)
 *       └── LoadingScreen (fades out once the scene is ready)
 *
 * scrollProgress is a ref (0→1). It flows from GSAP ScrollTrigger
 * into both the 3D canvas (via useFrame) and the HTML overlay (via rAF).
 * No React state updates on scroll — zero re-renders during the experience.
 */
export default function App() {
  const scrollProgress = useScrollProgress()

  return (
    <div id="scroll-container" style={{ height: '900vh', position: 'relative' }}>
      <div id="sticky-viewport">
        {/* 3D world — position absolute, fills viewport */}
        <SceneCanvas scrollProgress={scrollProgress} />

        {/* HTML overlay — logo and future typography layers */}
        <Logo scrollProgress={scrollProgress} />

        {/* Loading cover — sits above everything until scene is ready */}
        <LoadingScreen />

        {/* Debug — remove after verifying scroll pipeline */}
        {import.meta.env.DEV && <DebugHUD scrollProgress={scrollProgress} />}
      </div>
    </div>
  )
}
