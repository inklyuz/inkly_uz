"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, useAnimationFrame } from "framer-motion"

// ─────────────────────────────────────────────────────────────────────────────
// WaveBackground — to'lqin fon + ilon izi kursor animatsiyasi
// Endi konteyner o'lchamiga (ResizeObserver orqali) haqiqiy moslashadi:
// mobile / tablet / desktop — barchasi bitta dinamik hisoblash orqali ishlaydi.
// ─────────────────────────────────────────────────────────────────────────────

const WAVE_COLORS = [
  { base: "#FF6A00", from: "#FF6A00", to: "#FF8A3D" },
  { base: "#3B82F6", from: "#3B82F6", to: "#60A5FA" },
  { base: "#10B981", from: "#10B981", to: "#34D399" },
  { base: "#8B5CF6", from: "#8B5CF6", to: "#A78BFA" },
  { base: "#F43F5E", from: "#F43F5E", to: "#FB7185" },
]

const SNAKE_PALETTE = [
  { r: 255, g: 106, b: 0   },
  { r: 59,  g: 130, b: 246 },
  { r: 16,  g: 185, b: 129 },
  { r: 139, g: 92,  b: 246 },
  { r: 244, g: 63,  b: 94  },
]

const SEGMENT_COUNT   = 28
const SEGMENT_SPACING = 13
const HEAD_RADIUS     = 8
const TAIL_MIN_RADIUS = 2.5
const HEAD_EASE       = 0.38
const BODY_EASE       = 0.18

// Wave "davri" — bu masofada bitta to'liq to'lqin tugaydi (piksel).
// Kenglik qanday bo'lishidan qat'i nazar zichlik bir xil bo'lib qoladi.
const WAVE_PERIOD_PX = 220

type Breakpoint = "mobile" | "tablet" | "desktop"

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

// Har qanday kenglik/balandlik uchun to'lqin path'ini quradi.
// Endi qattiq 390/1280 emas — real o'lchamga qarab humplar soni o'zi hisoblanadi.
function buildPath(y: number, offset: number, width: number, ampScale: number) {
  const yo = y + offset
  const margin = WAVE_PERIOD_PX
  let x = -margin
  let d = `M ${x} ${yo}`
  let toggle = 1
  const amp = 60 * ampScale
  while (x < width + margin) {
    const midX = x + WAVE_PERIOD_PX / 2
    const midY = yo + toggle * amp
    const endX = x + WAVE_PERIOD_PX
    d += ` Q ${midX.toFixed(1)} ${midY.toFixed(1)}, ${endX.toFixed(1)} ${yo}`
    toggle *= -1
    x = endX
  }
  return d
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getSnakeColor(i: number) {
  const t   = i / (SEGMENT_COUNT - 1)
  const idx = t * (SNAKE_PALETTE.length - 1)
  const lo  = Math.floor(idx)
  const hi  = Math.min(lo + 1, SNAKE_PALETTE.length - 1)
  const f   = idx - lo
  const a   = SNAKE_PALETTE[lo]
  const b   = SNAKE_PALETTE[hi]
  return {
    r: a.r + (b.r - a.r) * f,
    g: a.g + (b.g - a.g) * f,
    b: a.b + (b.b - a.b) * f,
  }
}

// ── Animated wave path — useAnimationFrame bilan haqiqiy float ──────────────
function FloatingPath({
  baseY,
  amplitude,
  period,
  phaseOffset,
  stroke,
  strokeWidth,
  opacity,
  width,
  ampScale,
}: {
  baseY: number
  amplitude: number
  period: number
  phaseOffset: number
  stroke: string
  strokeWidth: number
  opacity: number
  width: number
  ampScale: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const t0 = useRef(performance.now())

  useAnimationFrame(() => {
    if (!pathRef.current) return
    const elapsed = (performance.now() - t0.current) / 1000
    const offset  = Math.sin((elapsed / period) * Math.PI * 2 + phaseOffset) * amplitude
    pathRef.current.setAttribute("d", buildPath(baseY, offset, width, ampScale))
  })

  return (
    <path
      ref={pathRef}
      d={buildPath(baseY, 0, width, ampScale)}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity={opacity}
    />
  )
}

// ── Snake canvas hook ──────────────────────────────────────────────────────
function useSnakeCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = 0, H = 0, rafId = 0
    let mouseX: number | null = null
    let mouseY: number | null = null
    let active = false
    const segments: { x: number; y: number }[] = []

    function resize() {
      const rect = container!.getBoundingClientRect()
      W = rect.width; H = rect.height
      canvas!.width  = W * devicePixelRatio
      canvas!.height = H * devicePixelRatio
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    function initSegments(cx: number, cy: number) {
      segments.length = 0
      for (let i = 0; i < SEGMENT_COUNT; i++)
        segments.push({ x: cx - i * SEGMENT_SPACING, y: cy })
    }

    function onMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      if (!active) { active = true; initSegments(mouseX, mouseY) }
    }

    function onLeave() { mouseX = null; mouseY = null }

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      if (!active || segments.length === 0) { rafId = requestAnimationFrame(draw); return }

      if (mouseX !== null && mouseY !== null) {
        segments[0].x = lerp(segments[0].x, mouseX, HEAD_EASE)
        segments[0].y = lerp(segments[0].y, mouseY, HEAD_EASE)
      }

      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i - 1], cur = segments[i]
        const dx = cur.x - prev.x, dy = cur.y - prev.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
        if (dist > SEGMENT_SPACING) {
          const ratio = (dist - SEGMENT_SPACING) / dist
          cur.x -= dx * ratio * 0.72; cur.y -= dy * ratio * 0.72
        } else {
          cur.x = lerp(cur.x, prev.x + (dx / dist) * SEGMENT_SPACING, BODY_EASE)
          cur.y = lerp(cur.y, prev.y + (dy / dist) * SEGMENT_SPACING, BODY_EASE)
        }
      }

      for (let i = segments.length - 1; i >= 0; i--) {
        const t      = i / (segments.length - 1)
        const radius = lerp(HEAD_RADIUS, TAIL_MIN_RADIUS, Math.pow(t, 0.7))
        const alpha  = lerp(1, 0.07, Math.pow(t, 1.1))
        const c      = getSnakeColor(i)
        const seg    = segments[i]
        const prev   = segments[Math.max(0, i - 1)]
        const angle  = Math.atan2(prev.y - seg.y, prev.x - seg.x)

        ctx!.save()
        ctx!.translate(seg.x, seg.y)
        ctx!.rotate(angle)
        ctx!.scale(1.3, 1.0)

        ctx!.beginPath()
        ctx!.arc(0, 0, radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${alpha.toFixed(3)})`
        ctx!.fill()

        if (i === 0) {
          ctx!.beginPath(); ctx!.arc( HEAD_RADIUS*0.28, -radius*0.32, radius*0.22, 0, Math.PI*2)
          ctx!.fillStyle = "rgba(255,255,255,0.88)"; ctx!.fill()
          ctx!.beginPath(); ctx!.arc(-HEAD_RADIUS*0.28, -radius*0.32, radius*0.22, 0, Math.PI*2)
          ctx!.fillStyle = "rgba(255,255,255,0.88)"; ctx!.fill()
          ctx!.beginPath(); ctx!.arc( HEAD_RADIUS*0.28, -radius*0.32, radius*0.1, 0, Math.PI*2)
          ctx!.fillStyle = "rgba(0,0,0,0.75)"; ctx!.fill()
          ctx!.beginPath(); ctx!.arc(-HEAD_RADIUS*0.28, -radius*0.32, radius*0.1, 0, Math.PI*2)
          ctx!.fillStyle = "rgba(0,0,0,0.75)"; ctx!.fill()
          const ts = HEAD_RADIUS + 1
          ctx!.strokeStyle = `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},0.95)`
          ctx!.lineWidth = 1.5; ctx!.lineCap = "round"
          ctx!.beginPath(); ctx!.moveTo(ts, 0);     ctx!.lineTo(ts+8, 0);      ctx!.stroke()
          ctx!.beginPath(); ctx!.moveTo(ts+8, 0);   ctx!.lineTo(ts+13, -3.5); ctx!.stroke()
          ctx!.beginPath(); ctx!.moveTo(ts+8, 0);   ctx!.lineTo(ts+13,  3.5); ctx!.stroke()
        }
        ctx!.restore()
      }
      rafId = requestAnimationFrame(draw)
    }

    resize()
    initSegments(W / 2, H / 2)
    active = false
    container.addEventListener("mousemove", onMove)
    container.addEventListener("mouseleave", onLeave)
    window.addEventListener("resize", resize)
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      container.removeEventListener("mousemove", onMove)
      container.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("resize", resize)
    }
  }, [enabled, canvasRef, containerRef])
}

// ── ShimmerPath — to'lqin ustidan yorug' chiziq o'tadi ──────────────────────
function ShimmerPath({
  baseY,
  amplitude,
  period,
  phaseOffset,
  colorIdx,
  idPrefix,
  delay,
  shimmerDuration,
  width,
  ampScale,
}: {
  baseY: number
  amplitude: number
  period: number
  phaseOffset: number
  colorIdx: number
  idPrefix: string
  delay: number
  shimmerDuration: number
  width: number
  ampScale: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const t0 = useRef(performance.now())

  useAnimationFrame(() => {
    if (!pathRef.current) return
    const elapsed = (performance.now() - t0.current) / 1000
    const offset  = Math.sin((elapsed / period) * Math.PI * 2 + phaseOffset) * amplitude
    pathRef.current.setAttribute("d", buildPath(baseY, offset, width, ampScale))
  })

  return (
    <motion.path
      ref={pathRef}
      d={buildPath(baseY, 0, width, ampScale)}
      fill="none"
      stroke={`url(#${idPrefix}-shimmer-${colorIdx})`}
      strokeWidth="3"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="0.07 0.93"
      initial={{ strokeDashoffset: 1.07 }}
      animate={{ strokeDashoffset: -0.07 }}
      transition={{
        duration: shimmerDuration,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      }}
    />
  )
}

// ── TrailPath — chapdan o'ngga suzuvchi trail ────────────────────────────────
function TrailPath({
  baseY,
  amplitude,
  period,
  phaseOffset,
  colorIdx,
  idPrefix,
  dashDuration,
  dashDelay,
  width,
  ampScale,
}: {
  baseY: number
  amplitude: number
  period: number
  phaseOffset: number
  colorIdx: number
  idPrefix: string
  dashDuration: number
  dashDelay: number
  width: number
  ampScale: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const t0 = useRef(performance.now())

  useAnimationFrame(() => {
    if (!pathRef.current) return
    const elapsed = (performance.now() - t0.current) / 1000
    const offset  = Math.sin((elapsed / period) * Math.PI * 2 + phaseOffset) * amplitude
    pathRef.current.setAttribute("d", buildPath(baseY, offset, width, ampScale))
  })

  return (
    <motion.path
      ref={pathRef}
      d={buildPath(baseY, 0, width, ampScale)}
      fill="none"
      stroke={`url(#${idPrefix}-trail-${colorIdx})`}
      strokeWidth="3.5"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="0.11 0.89"
      initial={{ strokeDashoffset: 1 }}
      animate={{ strokeDashoffset: -0.11 }}
      transition={{
        duration: dashDuration,
        delay: dashDelay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      }}
    />
  )
}

// ── Props ──────────────────────────────────────────────────────────────────
interface WaveBackgroundProps {
  opacity?: number
  idPrefix?: string
  className?: string
  snakeEnabled?: boolean
}

// ── Komponent ──────────────────────────────────────────────────────────────
export function WaveBackground({
  opacity      = 1,
  idPrefix     = "wave",
  className,
  snakeEnabled = true,
}: WaveBackgroundProps) {
  const reducedMotionRaw = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pointerFine, setPointerFine] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)

  const reducedMotion = mounted ? (reducedMotionRaw ?? false) : false

  // Real konteyner o'lchamini kuzatish — mobile/tablet/desktop hammasi
  // shu orqali avtomatik to'g'ri hisoblanadi (qattiq breakpoint yo'q).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize((prev) =>
        Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1
          ? { width, height }
          : prev,
      )
      setMounted(true)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sichqoncha bormi yo'qmi — width breakpointdan mustaqil, chunki keng
  // ekranli touch qurilmalarda ham snake keraksiz.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)")
    setPointerFine(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPointerFine(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const snakeActive = snakeEnabled && !reducedMotion && pointerFine && mounted
  useSnakeCanvas(canvasRef, containerRef, snakeActive)

  const width  = size.width  || 1280
  const height = size.height || 900
  const breakpoint = getBreakpoint(width)

  // Amplituda kenglikka nisbatan — juda tor ekranda to'lqin haddan
  // tashqari "keskin" ko'rinmasligi uchun kichraytiriladi.
  const ampScale =
    breakpoint === "mobile" ? 0.45 : breakpoint === "tablet" ? 0.75 : 1

  // Qatorlar soni real balandlikka qarab hisoblanadi — statik massiv yo'q.
  const rowSpacing = breakpoint === "mobile" ? 110 : breakpoint === "tablet" ? 120 : 100
  const rowCount = Math.max(5, Math.ceil(height / rowSpacing) + 2)
  const baseYs = Array.from({ length: rowCount }, (_, i) => -40 + i * rowSpacing)

  // Har 3-qatorni "trail" (suzuvchi chiziq) sifatida belgilaymiz.
  const snakeStep = Math.max(2, Math.ceil(rowCount / 4))
  const snakeRowIndices = baseYs
    .map((_, i) => i)
    .filter((i) => i % snakeStep === 0)
    .slice(0, 5)

  const strokeWidth = breakpoint === "desktop" ? 1.4 : 1.8
  const strokeOpacity = breakpoint === "desktop" ? 0.18 : 0.28

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className={
        className ??
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      }
      initial={false}
      animate={{ opacity: mounted ? opacity : 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {mounted && (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            {WAVE_COLORS.map((c, i) => (
              <linearGradient key={i} id={`${idPrefix}-trail-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={c.from} stopOpacity="0"    />
                <stop offset="40%"  stopColor={c.to}   stopOpacity="0.95" />
                <stop offset="65%"  stopColor={c.from} stopOpacity="0.55" />
                <stop offset="100%" stopColor={c.from} stopOpacity="0"    />
              </linearGradient>
            ))}
            {WAVE_COLORS.map((c, i) => (
              <linearGradient key={`sg-${i}`} id={`${idPrefix}-shimmer-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#fff"  stopOpacity="0"   />
                <stop offset="44%"  stopColor="#fff"  stopOpacity="0"   />
                <stop offset="50%"  stopColor={c.to}  stopOpacity="0.7" />
                <stop offset="52%"  stopColor="#fff"  stopOpacity="1"   />
                <stop offset="56%"  stopColor={c.to}  stopOpacity="0.7" />
                <stop offset="65%"  stopColor="#fff"  stopOpacity="0"   />
                <stop offset="100%" stopColor="#fff"  stopOpacity="0"   />
              </linearGradient>
            ))}
          </defs>

          {baseYs.map((y, i) => {
            const amp    = 7 + (i % 4) * 3
            const period = 4 + (i % 5) * 0.9
            const phase  = (i * Math.PI) / 3
            return (
              <FloatingPath
                key={`base-${i}`}
                baseY={y}
                amplitude={amp}
                period={period}
                phaseOffset={phase}
                stroke={WAVE_COLORS[i % WAVE_COLORS.length].base}
                strokeWidth={strokeWidth}
                opacity={strokeOpacity}
                width={width}
                ampScale={ampScale}
              />
            )
          })}

          {!reducedMotion && snakeRowIndices.map((rowIdx, i) => (
            <TrailPath
              key={`trail-${i}`}
              baseY={baseYs[rowIdx]}
              amplitude={10 + i * 3}
              period={5 + i * 1.2}
              phaseOffset={(i * Math.PI) / 2}
              colorIdx={i % WAVE_COLORS.length}
              idPrefix={idPrefix}
              dashDuration={12 + i * 2.5}
              dashDelay={i * 3}
              width={width}
              ampScale={ampScale}
            />
          ))}

          {!reducedMotion && baseYs.map((y, i) => (
            <ShimmerPath
              key={`shimmer-${i}`}
              baseY={y}
              amplitude={7 + (i % 4) * 3}
              period={4 + (i % 5) * 0.9}
              phaseOffset={(i * Math.PI) / 3}
              colorIdx={i % WAVE_COLORS.length}
              idPrefix={idPrefix}
              delay={i * 0.5}
              shimmerDuration={3 + (i % 4) * 0.7}
              width={width}
              ampScale={ampScale}
            />
          ))}
        </svg>
      )}

      {mounted && snakeActive && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
          }}
        />
      )}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 rounded-full lg:block"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,0,0.10) 0%, rgba(255,138,61,0.04) 45%, transparent 70%)",
        }}
        initial={false}
        animate={
          !mounted ? { opacity: 0.9, scale: 1 }
          : reducedMotion ? { opacity: 0.9, scale: 1 }
          : { scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }
        }
        transition={{ duration: 6, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-[30%] h-[240px] w-[240px] rounded-full lg:hidden"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,0,0.07) 0%, rgba(255,138,61,0.03) 45%, transparent 70%)",
        }}
        initial={false}
        animate={
          !mounted ? { opacity: 0.85, scale: 1 }
          : reducedMotion ? { opacity: 0.85, scale: 1 }
          : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 6, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}