import { useEffect, useRef } from 'react'

/**
 * VehicleStory – Editorial Automotive Typography
 *
 * Designed according to V/MOTION Director V2 & Visual Quality Auditor principles:
 * - "This is a shot, not a spec sheet."
 * - Car first. One selected fact second. Everything else subordinate.
 * - Negative space is shaped and belongs to the composition.
 * - Colors:
 *     Primary: warm off-white (#F1EFEA)
 *     Secondary: muted editorial grey (#C4C1BB)
 *     Metadata: quiet tone (#99968F)
 *
 * Timeline:
 *   0.00–0.54 : SILENCE (Logo & vehicle mystery/anticipation/reveal have visual priority)
 *   0.54–0.60 : IDENTITY ("McLaren Senna" - restrained editorial introduction)
 *   0.60–0.75 : PERFORMANCE (Hero: "2.8 s" + "0–100 km/h", subordinate secondary "335 km/h")
 *   0.75–0.88 : POWERTRAIN (Primary: "4.0 L twin-turbo V8", supporting pair: "800 PS Power · 800 Nm Torque")
 *   0.88–1.00 : OWNERSHIP (Quiet hero: "McLaren Senna", "Request a viewing ↗", "V/MOTION COLOMBO, SRI LANKA")
 *
 * Zero React re-renders on scroll; driven strictly via rAF and direct DOM style updates.
 */
export default function VehicleStory({ scrollProgress }) {
  const identityRef = useRef()
  const performanceRef = useRef()
  const powertrainRef = useRef()
  const ownershipRef = useRef()

  useEffect(() => {
    let rafId

    // Smooth ease helper
    const smoothstep = (min, max, value) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
      return x * x * (3 - 2 * x)
    }

    const update = () => {
      const p = scrollProgress.current ?? 0

      // Helper for clean editorial entry & exit with subtle 8-16px translateY
      const applyTransition = (el, enterStart, enterEnd, exitStart, exitEnd, maxTranslate = 14) => {
        if (!el) return

        let opacity = 0
        let translateY = maxTranslate

        if (p < enterStart || p > exitEnd) {
          opacity = 0
          translateY = p < enterStart ? maxTranslate : -maxTranslate
        } else if (p >= enterStart && p < enterEnd) {
          const t = smoothstep(enterStart, enterEnd, p)
          opacity = t
          translateY = (1 - t) * maxTranslate
        } else if (p >= enterEnd && p <= exitStart) {
          opacity = 1
          translateY = 0
        } else if (p > exitStart && p <= exitEnd) {
          const t = smoothstep(exitStart, exitEnd, p)
          opacity = 1 - t
          translateY = -t * maxTranslate
        }

        el.style.opacity = opacity.toFixed(4)
        el.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`
        el.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible'
      }

      // ── 01. IDENTITY (0.54 – 0.60) ──
      // Enters after reveal silence. Leaves as Performance takes over.
      applyTransition(identityRef.current, 0.54, 0.56, 0.585, 0.605)

      // ── 02. PERFORMANCE (0.60 – 0.75) ──
      // Hero: 2.8 s. Secondary: 335 km/h fades in smoothly later in the beat (~0.67+).
      applyTransition(performanceRef.current, 0.605, 0.63, 0.725, 0.75)

      // Subordinate secondary element inside performance
      if (performanceRef.current) {
        const sec = performanceRef.current.querySelector('.perf-secondary')
        if (sec) {
          const secOpacity = p >= 0.67 && p <= 0.73
            ? smoothstep(0.67, 0.70, p)
            : p > 0.73
            ? 1 - smoothstep(0.73, 0.75, p)
            : 0
          sec.style.opacity = secOpacity.toFixed(4)
        }
      }

      // ── 03. POWERTRAIN (0.75 – 0.88) ──
      // Primary: 4.0 L twin-turbo V8. Supporting: 800 PS / 800 Nm.
      applyTransition(powertrainRef.current, 0.75, 0.775, 0.855, 0.88)

      // ── 04. OWNERSHIP (0.88 – 1.00) ──
      // Quiet, confident closing composition.
      applyTransition(ownershipRef.current, 0.88, 0.915, 1.00, 1.05)

      rafId = requestAnimationFrame(update)
    }

    update()
    return () => cancelAnimationFrame(rafId)
  }, [scrollProgress])

  // Shared font & typography styles
  const fontPrimary = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
        userSelect: 'none',
        fontFamily: fontPrimary,
      }}
    >
      {/* ──────────────────────────────────────────────────────────
          BEAT 01: IDENTITY (p = 0.54 – 0.60)
          Positioned in genuine negative space on the left.
          44px reference size at 1440x900, warm off-white, tight tracking.
      ────────────────────────────────────────────────────────── */}
      <div
        ref={identityRef}
        style={{
          position: 'absolute',
          top: '38%',
          left: 'clamp(3rem, 7vw, 9rem)',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(2.2rem, 3.1vw, 2.75rem)', // ~44px at 1440w
            fontWeight: 400,
            color: '#F1EFEA',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}
        >
          McLaren Senna
        </h2>
      </div>

      {/* ──────────────────────────────────────────────────────────
          BEAT 02: PERFORMANCE (p = 0.60 – 0.75)
          Hero: "2.8 s" + "0–100 km/h"
          Secondary: "335 km/h" + "Maximum speed" (subordinate)
      ────────────────────────────────────────────────────────── */}
      <div
        ref={performanceRef}
        style={{
          position: 'absolute',
          top: '34%',
          left: 'clamp(3rem, 7.5vw, 10rem)',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        {/* Hero stat */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
          <span
            style={{
              fontSize: 'clamp(5.5rem, 7.8vw, 7rem)',
              fontWeight: 400,
              color: '#F1EFEA',
              letterSpacing: '-0.035em',
              lineHeight: 0.92,
            }}
          >
            2.8
          </span>
          <span
            style={{
              fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
              fontWeight: 300,
              color: '#C4C1BB',
              letterSpacing: '-0.01em',
            }}
          >
            s
          </span>
        </div>

        {/* Directly associated label */}
        <div
          style={{
            marginTop: '0.65rem',
            fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
            fontWeight: 400,
            color: '#99968F',
            letterSpacing: '0.04em',
          }}
        >
          0–100 km/h
        </div>

        {/* Subordinate secondary fact */}
        <div
          className="perf-secondary"
          style={{
            marginTop: '3.25rem',
            opacity: 0,
            transition: 'opacity 0.2s linear',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(1.5rem, 2vw, 1.85rem)',
              fontWeight: 400,
              color: '#F1EFEA',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            335 km/h
          </div>
          <div
            style={{
              marginTop: '0.35rem',
              fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)',
              fontWeight: 400,
              color: '#99968F',
              letterSpacing: '0.03em',
            }}
          >
            Maximum speed
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          BEAT 03: POWERTRAIN (p = 0.75 – 0.88)
          Primary: "4.0 L twin-turbo V8"
          Supporting: "800 PS Power · 800 Nm Torque" (supporting pair)
      ────────────────────────────────────────────────────────── */}
      <div
        ref={powertrainRef}
        style={{
          position: 'absolute',
          top: '35%',
          left: 'clamp(3rem, 7.5vw, 10rem)',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        {/* Primary headline */}
        <div>
          <div
            style={{
              fontSize: 'clamp(3.2rem, 4.8vw, 4.2rem)',
              fontWeight: 400,
              color: '#F1EFEA',
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
            }}
          >
            4.0 L
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              fontSize: 'clamp(1.1rem, 1.4vw, 1.35rem)',
              fontWeight: 300,
              color: '#C4C1BB',
              letterSpacing: '0.01em',
            }}
          >
            twin-turbo V8
          </div>
        </div>

        {/* Supporting facts pair */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            marginTop: '2.8rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 'clamp(1.35rem, 1.8vw, 1.65rem)',
                fontWeight: 400,
                color: '#F1EFEA',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              800 PS
            </div>
            <div
              style={{
                marginTop: '0.25rem',
                fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)',
                fontWeight: 400,
                color: '#99968F',
                letterSpacing: '0.03em',
              }}
            >
              Power
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 'clamp(1.35rem, 1.8vw, 1.65rem)',
                fontWeight: 400,
                color: '#F1EFEA',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              800 Nm
            </div>
            <div
              style={{
                marginTop: '0.25rem',
                fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)',
                fontWeight: 400,
                color: '#99968F',
                letterSpacing: '0.03em',
              }}
            >
              Torque
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          BEAT 04: OWNERSHIP / HERO (p = 0.88 – 1.00)
          Quieter than the technical middle.
          "McLaren Senna", "Request a viewing ↗", "V/MOTION COLOMBO, SRI LANKA"
      ────────────────────────────────────────────────────────── */}
      <div
        ref={ownershipRef}
        style={{
          position: 'absolute',
          bottom: 'clamp(3.5rem, 8vh, 6.5rem)',
          left: 'clamp(3rem, 7vw, 9rem)',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'clamp(1.8rem, 2.6vw, 2.3rem)',
            fontWeight: 400,
            color: '#F1EFEA',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          McLaren Senna
        </h3>

        <div style={{ marginTop: '1.25rem' }}>
          <span
            style={{
              fontSize: 'clamp(0.95rem, 1.15vw, 1.05rem)',
              fontWeight: 400,
              color: '#F1EFEA',
              letterSpacing: '0.01em',
              borderBottom: '1px solid rgba(241, 239, 234, 0.4)',
              paddingBottom: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            Request a viewing
            <span style={{ fontSize: '0.9em', color: '#C4C1BB' }}>↗</span>
          </span>
        </div>

        <div
          style={{
            marginTop: '1.8rem',
            fontSize: '0.72rem',
            fontWeight: 400,
            color: '#99968F',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight: 1.45,
          }}
        >
          <div>V/MOTION</div>
          <div style={{ color: 'rgba(153, 150, 143, 0.75)' }}>Colombo, Sri Lanka</div>
        </div>
      </div>
    </div>
  )
}
