import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'

/**
 * LoadingScreen
 *
 * Full-screen black cover that sits above the canvas while the scene loads.
 * Fades out gracefully once Three.js reports loading is complete.
 *
 * In Phase 1 (no heavy assets) this resolves almost instantly.
 * When the car GLB is added, this becomes a real loading state —
 * the V/MOTION identity on a dark screen is the natural waiting experience.
 *
 * A thin progress line beneath the wordmark communicates loading state
 * without being an intrusive spinner or loading bar.
 */
export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const ref = useRef()
  const hasDismissed = useRef(false)

  useEffect(() => {
    if (!active && !hasDismissed.current && ref.current) {
      hasDismissed.current = true
      gsap.to(ref.current, {
        opacity: 0,
        duration: 1.4,
        delay: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          if (ref.current) ref.current.style.display = 'none'
        },
      })
    }
  }, [active])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#050507',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1.8rem',
        pointerEvents: 'none',
      }}
    >
      {/* Identity while loading */}
      <div
        style={{
          fontFamily: "'Space Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
          fontWeight: 300,
          fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
          letterSpacing: '0.3em',
          color: '#ffffff',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        V<span style={{ color: '#555', fontWeight: 300, letterSpacing: 0 }}>/</span>MOTION
      </div>

      {/* Progress line */}
      <div
        style={{
          width: '100px',
          height: '1px',
          background: '#111116',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.5)',
            transform: `scaleX(${progress / 100})`,
            transformOrigin: 'left center',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
