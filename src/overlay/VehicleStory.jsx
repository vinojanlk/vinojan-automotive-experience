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
 *   0.75–0.78 : SILENCE / ARRIVAL (Camera settles into POWER pose, lighting transitions)
 *   0.78–0.88 : POWER ("HELD FORCE" – 800 PS dominant, 800 Nm echo, 4.0 L twin-turbo V8 source)
 *   0.88–1.00 : OWNERSHIP (Quiet hero: "McLaren Senna", "Request a viewing ↗", "V/MOTION COLOMBO, SRI LANKA")
 *
 * Zero React re-renders on scroll; driven strictly via rAF and direct DOM style updates.
 */
export default function VehicleStory({ scrollProgress }) {
  const identityRef    = useRef()
  const performanceRef = useRef()
  const powertrainRef  = useRef()
  const psRef          = useRef()
  const nmRef          = useRef()
  const engineRef      = useRef()
  const ownershipRef   = useRef()

  useEffect(() => {
    let rafId

    // Smooth ease helper
    const smoothstep = (min, max, value) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
      return x * x * (3 - 2 * x)
    }

    const update = () => {
      const p = scrollProgress.current ?? 0

      // Helper for clean editorial entry & exit with subtle 8-16px translateY (for Identity, Performance, Ownership)
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

      // ── 01. IDENTITY (0.54 – 0.60) ── (UNCHANGED)
      applyTransition(identityRef.current, 0.54, 0.56, 0.585, 0.605)

      // ── 02. PERFORMANCE (0.60 – 0.75) ── (UNCHANGED)
      applyTransition(performanceRef.current, 0.605, 0.63, 0.725, 0.75)

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

      // ── 03. POWER: "HELD FORCE" (0.78 – 0.88) ──
      // Pure opacity only – completely stationary.
      // 0.75–0.78: No text. Camera settles, lighting transitions.
      // 0.78–0.795: 800 PS fades in.
      // 0.795–0.810: 800 Nm fades in.
      // 0.810–0.825: 4.0 L twin-turbo V8 fades in.
      // 0.825–0.845: FULL COMPOSITION HOLD.
      // 0.845–0.855: engine caption fades out.
      // 0.855–0.865: 800 Nm fades out.
      // 0.865–0.880: 800 PS fades out.
      // 0.88: POWER typography completely gone.

      let op800PS = 0
      if (p >= 0.78 && p <= 0.88) {
        if (p < 0.795) {
          op800PS = smoothstep(0.78, 0.795, p)
        } else if (p <= 0.865) {
          op800PS = 1
        } else {
          op800PS = 1 - smoothstep(0.865, 0.880, p)
        }
      }

      let op800Nm = 0
      if (p >= 0.795 && p <= 0.865) {
        if (p < 0.810) {
          op800Nm = smoothstep(0.795, 0.810, p)
        } else if (p <= 0.855) {
          op800Nm = 1
        } else {
          op800Nm = 1 - smoothstep(0.855, 0.865, p)
        }
      }

      let opEngine = 0
      if (p >= 0.810 && p <= 0.855) {
        if (p < 0.825) {
          opEngine = smoothstep(0.810, 0.825, p)
        } else if (p <= 0.845) {
          opEngine = 1
        } else {
          opEngine = 1 - smoothstep(0.845, 0.855, p)
        }
      }

      if (psRef.current) {
        psRef.current.style.opacity = op800PS.toFixed(4)
        psRef.current.style.visibility = op800PS <= 0.001 ? 'hidden' : 'visible'
      }
      if (nmRef.current) {
        nmRef.current.style.opacity = op800Nm.toFixed(4)
        nmRef.current.style.visibility = op800Nm <= 0.001 ? 'hidden' : 'visible'
      }
      if (engineRef.current) {
        engineRef.current.style.opacity = opEngine.toFixed(4)
        engineRef.current.style.visibility = opEngine <= 0.001 ? 'hidden' : 'visible'
      }
      if (powertrainRef.current) {
        const anyVisible = op800PS > 0.001 || op800Nm > 0.001 || opEngine > 0.001
        powertrainRef.current.style.visibility = anyVisible ? 'visible' : 'hidden'
      }

      // ── 04. OWNERSHIP (0.88 – 1.00) ── (UNCHANGED)
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
            fontSize: 'clamp(2.2rem, 3.1vw, 2.75rem)',
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
          BEAT 03: POWER ("HELD FORCE") (p = 0.78 – 0.88)
          800 PS (dominant statement)
          800 Nm (smaller echo beneath)
          4.0 L twin-turbo V8 (quiet mechanical-source caption)
          Stationary – pure opacity only.
      ────────────────────────────────────────────────────────── */}
      <div
        ref={powertrainRef}
        style={{
          position: 'absolute',
          top: '34%',
          left: 'clamp(3rem, 7.5vw, 10rem)',
          visibility: 'hidden',
          willChange: 'opacity',
        }}
      >
        {/* 800 PS — Dominant POWER statement */}
        <div
          ref={psRef}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.45rem',
            opacity: 0,
            willChange: 'opacity',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(5.2rem, 7.4vw, 6.6rem)',
              fontWeight: 400,
              color: '#F1EFEA',
              letterSpacing: '-0.035em',
              lineHeight: 0.92,
            }}
          >
            800
          </span>
          <span
            style={{
              fontSize: 'clamp(1.6rem, 2.3vw, 2.1rem)',
              fontWeight: 300,
              color: '#C4C1BB',
              letterSpacing: '-0.01em',
            }}
          >
            PS
          </span>
        </div>

        {/* 800 Nm — Substantially smaller echo beneath */}
        <div
          ref={nmRef}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.35rem',
            marginTop: '1.25rem',
            opacity: 0,
            willChange: 'opacity',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(2.2rem, 3.2vw, 2.85rem)',
              fontWeight: 400,
              color: '#F1EFEA',
              letterSpacing: '-0.025em',
              lineHeight: 1.0,
            }}
          >
            800
          </span>
          <span
            style={{
              fontSize: 'clamp(1.1rem, 1.4vw, 1.3rem)',
              fontWeight: 300,
              color: '#C4C1BB',
              letterSpacing: '-0.01em',
            }}
          >
            Nm
          </span>
        </div>

        {/* 4.0 L twin-turbo V8 — Quiet mechanical-source caption */}
        <div
          ref={engineRef}
          style={{
            marginTop: '2.2rem',
            fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)',
            fontWeight: 400,
            color: '#99968F',
            letterSpacing: '0.04em',
            opacity: 0,
            willChange: 'opacity',
          }}
        >
          4.0 L twin-turbo V8
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
          <div>VINOJAN</div>
          <div style={{ color: 'rgba(153, 150, 143, 0.75)' }}>Colombo, Sri Lanka</div>
        </div>
      </div>
    </div>
  )
}
