import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Logo
 *
 * VINOJAN brand identity — opening signature.
 *
 * Motion system (scroll-driven, via rAF + GSAP.set):
 *
 *   0–5%    Fade in from black. Centered. Full scale. Opening identity.
 *   5–12%   Hold. Logo owns the screen alongside the darkness.
 *   12–30%  Migrate to top-left corner. Scale down.
 *   30–36%  Settled corner presence.
 *   36–42%  Fade out completely before the vehicle reveal.
 *   42–100% Fully hidden (opacity: 0, visibility: hidden). Vehicle owns the frame.
 *
 * Driven entirely by rAF + gsap.set (no React state).
 * Zero re-renders. Zero scroll event listeners in React.
 *
 * Visual language:
 *   - Space Grotesk 300 — refined, not heavy
 *   - Letter-spacing 0.3em — premium automotive feeling
 *   - Thin horizontal rule beneath — compositional breath
 */
export default function Logo({ scrollProgress }) {
  const wrapRef = useRef()
  const rafRef  = useRef()

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    // Measure logo once after mount
    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const w  = el.offsetWidth
      const h  = el.offsetHeight

      // Centered position (from top-left origin)
      const cx = vw / 2 - w / 2
      const cy = vh / 2 - h / 2

      // Corner position (top-left)
      const kx = 32
      const ky = 28

      return { cx, cy, kx, ky }
    }

    let positions = measure()
    const onResize = () => { positions = measure() }
    window.addEventListener('resize', onResize)

    // Start off-screen invisible
    gsap.set(el, { x: positions.cx, y: positions.cy, opacity: 0, scale: 1, visibility: 'visible' })

    function animate() {
      const p = scrollProgress.current ?? 0
      const { cx, cy, kx, ky } = positions

      let opacity, scale, x, y

      if (p < 0.05) {
        // Fade in at centre
        const t = p / 0.05
        opacity = t
        scale   = 1
        x       = cx
        y       = cy
      } else if (p < 0.12) {
        // Hold — logo owns the opening
        opacity = 1
        scale   = 1
        x       = cx
        y       = cy
      } else if (p < 0.30) {
        // Migrate to corner
        const t    = (p - 0.12) / 0.18
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        opacity    = 1 - ease * 0.35
        scale      = 1 - ease * 0.60
        x          = cx + (kx - cx) * ease
        y          = cy + (ky - cy) * ease
      } else if (p < 0.36) {
        // Settled corner presence
        opacity = 0.65
        scale   = 0.40
        x       = kx
        y       = ky
      } else if (p < 0.42) {
        // Smooth fade out into blackout / car reveal
        const t = (p - 0.36) / 0.06
        opacity = 0.65 * (1 - t)
        scale   = 0.40
        x       = kx
        y       = ky
      } else {
        // Complete exit — vehicle reveal owns the frame
        opacity = 0
        scale   = 0.40
        x       = kx
        y       = ky
      }

      gsap.set(el, {
        x,
        y,
        opacity,
        scale,
        visibility: p < 0.42 ? 'visible' : 'hidden',
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [scrollProgress])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        pointerEvents: 'none',
        userSelect: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* Primary wordmark */}
      <h1
        style={{
          fontFamily: "'Space Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
          fontWeight: 300,
          fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
          letterSpacing: '0.3em',
          color: '#ffffff',
          lineHeight: 1,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        VINOJAN
      </h1>

      {/* Fine rule — compositional breath beneath the wordmark */}
      <div
        style={{
          width: '100%',
          height: '1px',
          marginTop: '0.65rem',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.25) 60%, transparent)',
        }}
      />
    </div>
  )
}
