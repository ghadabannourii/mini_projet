import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValue, useSpring,
} from "framer-motion";
import {
  Sparkles, Heart, Droplet, Sun,
  Play, Pause, ChevronLeft, ChevronRight, Star, ArrowRight, Zap,
} from "lucide-react";
import { AmbientBackground } from "@/components/skin-beauty/AmbientBackground";
import { Navbar } from "@/components/skin-beauty/Navbar";
import {
  useState, useEffect, useRef, useCallback, useMemo,
  type MouseEvent,
} from "react";
import video1 from "@/assets/1.mp4";
import video2 from "@/assets/2.mp4";
import video3 from "@/assets/3.mp4";
import video4 from "@/assets/4.mp4";

/* ═══════════════════════════════════════════════════════════════
   ROUTE
═══════════════════════════════════════════════════════════════ */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkinBeauty — Reveal your true skin glow" },
      { name: "description", content: "AI-powered skincare companion." },
    ],
  }),
  component: Landing,
});

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS  (no Math.random — all deterministic)
═══════════════════════════════════════════════════════════════ */
const ease = [0.32, 0.72, 0, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease },
};

const VIDEOS = [
  { src: video1, label: "Morning Ritual",     tag: "AM ☀️",    accent: "#f9a8d4" },
  { src: video2, label: "The Luminous Serum", tag: "N°02 ✦",   accent: "#c4b5fd" },
  { src: video3, label: "Glow Treatment",     tag: "Boost 🌸",  accent: "#93c5fd" },
  { src: video4, label: "Evening Care",       tag: "PM 🌙",    accent: "#fcd34d" },
];

const BENEFITS = [
  {
    icon: Sparkles, title: "Glow",
    front: "Luminous radiance from within.",
    back: "Our AI analyzes your melanin levels and hydration to craft a serum routine that makes you glow from the inside out.",
    grad: "from-rose/20 to-rose/5", ring: "border-rose/30", ic: "bg-rose/15 text-rose",
  },
  {
    icon: Droplet, title: "Hydration",
    front: "Deep moisture, precisely calibrated.",
    back: "Real-time skin barrier analysis ensures your moisturizer is perfectly matched to your TEWL score and climate.",
    grad: "from-skyaura/20 to-skyaura/5", ring: "border-skyaura/30", ic: "bg-skyaura/15 text-skyaura",
  },
  {
    icon: Sun, title: "Routine",
    front: "AM & PM in one elegant place.",
    back: "Morning brightness, evening repair. Two rituals, one dashboard, infinitely personalized to your skin's daily rhythm.",
    grad: "from-peach/20 to-peach/5", ring: "border-peach/30", ic: "bg-peach/15 text-peach",
  },
  {
    icon: Heart, title: "Confidence",
    front: "Feel wholly at home in your skin.",
    back: "Track your glow journey with weekly skin scores. Watch your confidence grow as your skin transforms, week by week.",
    grad: "from-lavender/20 to-lavender/5", ring: "border-lavender/30", ic: "bg-lavender/15 text-lavender",
  },
];

const STEPS = [
  { n: "01", emoji: "📸", t: "Scan your skin",      d: "A soft selfie. Our AI reads hydration, texture, and tone in seconds." },
  { n: "02", emoji: "💌", t: "Receive your ritual",  d: "A curated AM & PM routine, crafted like a love letter from your skin." },
  { n: "03", emoji: "✨", t: "Glow, daily",           d: "Track your journey and feel the luminous difference within weeks." },
];

const STATS = [
  { w: "Day 7",  h: "Hydration restored", v: 18, grad: "from-rose/25 to-peach/15"       },
  { w: "Day 21", h: "Even skin tone",     v: 24, grad: "from-lavender/25 to-skyaura/15" },
  { w: "Day 60", h: "Radiance bloomed",   v: 41, grad: "from-peach/25 to-rose/15"       },
];

const TESTIMONIALS = [
  { n: "Elena", age: "28", t: "Combination skin",  q: "Like having a private esthetician. My skin has never looked this luminous and calm." },
  { n: "Mira",  age: "34", t: "Sensitive skin",    q: "The AM/PM ritual changed everything. A quiet luxury I didn't know I needed." },
  { n: "Yara",  age: "22", t: "Oily, acne-prone",  q: "I finally understand my skin. The glow ring is genuinely addictive." },
];

const SELF_LOVE_QUOTES = [
  { quote: "Your skin is a love letter you write to yourself every morning.", author: "SkinBeauty ✦", color: "from-rose/20 to-peach/10" },
  { quote: "Glowing isn't a skin type — it's a state of mind.", author: "Wellness Wisdom", color: "from-lavender/20 to-rose/10" },
  { quote: "You are allowed to take up space and radiate light.", author: "Self Love Club", color: "from-peach/20 to-lavender/10" },
  { quote: "Nourishing your skin is one of the kindest things you can do for your future self.", author: "SkinBeauty ✦", color: "from-skyaura/20 to-peach/10" },
  { quote: "Your glow-up starts the moment you decide you're worth caring for.", author: "Daily Ritual", color: "from-rose/20 to-lavender/10" },
  { quote: "Soft skin, strong heart, unstoppable woman.", author: "Self Love Club", color: "from-peach/20 to-skyaura/10" },
];

/* Deterministic petal config — no Math.random() */
const PETAL_SYMBOLS = ["🌸", "✿", "❀", "✦", "⋆", "🌷"] as const;
const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left:     `${(i * 8.7 + 3) % 100}%`,
  fontSize: 12 + (i % 4) * 7,
  opacity:  0.22 + (i % 3) * 0.13,
  duration: `${14 + (i % 5) * 3.5}s`,
  delay:    `${(i * 1.9) % 10}s`,
  symbol:   PETAL_SYMBOLS[i % 6],
}));

/* Deterministic glitter per burst index — no Math.random() */
const GLITTER_SYMBOLS = ["✦", "✿", "★", "◆", "•", "🌸"] as const;
const BURST_COUNT = 10;
const BURST_OFFSETS = Array.from({ length: BURST_COUNT }, (_, i) => {
  const angle = (i / BURST_COUNT) * 2 * Math.PI;
  const dist  = 40 + (i % 3) * 15;  // 40 / 55 / 70 — deterministic
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    symbol: GLITTER_SYMBOLS[i % 6],
  };
});

/* ═══════════════════════════════════════════════════════════════
   CURSOR TRAIL
═══════════════════════════════════════════════════════════════ */
function CursorTrail() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const sx1 = useSpring(mx, { stiffness: 500, damping: 28 });
  const sy1 = useSpring(my, { stiffness: 500, damping: 28 });
  const sx2 = useSpring(mx, { stiffness: 150, damping: 18 });
  const sy2 = useSpring(my, { stiffness: 150, damping: 18 });

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      mx.set(e.clientX - 10);
      my.set(e.clientY - 10);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <>
      {/* large lazy follower */}
      <motion.div
        className="pointer-events-none fixed z-[997] rounded-full bg-rose/10 blur-md"
        style={{ width: 40, height: 40, x: sx2, y: sy2, translateX: "-50%", translateY: "-50%" }}
      />
      {/* tight glowing dot */}
      <motion.div
        className="pointer-events-none fixed z-[998] rounded-full bg-rose/30 blur-sm"
        style={{ width: 20, height: 20, x: sx1, y: sy1, translateX: "-50%", translateY: "-50%" }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING PETALS
═══════════════════════════════════════════════════════════════ */
function FloatingPetals() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]" aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="absolute select-none animate-petal"
          style={{
            left: p.left, bottom: "-4%",
            fontSize: p.fontSize,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            filter: "blur(0.3px)",
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLITTER BURST
═══════════════════════════════════════════════════════════════ */
function GlitterBurst({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <>
      {BURST_OFFSETS.map(({ dx, dy, symbol }, i) => (
        <motion.span
          key={`${id}-${i}`}
          className="pointer-events-none fixed z-[999] text-rose text-sm select-none"
          style={{ left: x, top: y }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: dx, y: dy, scale: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          {symbol}
        </motion.span>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SVG PROGRESS RING
═══════════════════════════════════════════════════════════════ */
function ProgressRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const r    = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: circ - (progress / 100) * circ }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
═══════════════════════════════════════════════════════════════ */
function MagneticBtn({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x   = useMotionValue(0);
  const y   = useMotionValue(0);
  const sx  = useSpring(x, { stiffness: 200, damping: 18 });
  const sy  = useSpring(y, { stiffness: 200, damping: 18 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left - r.width  / 2) * 0.3);
    y.set((e.clientY - r.top  - r.height / 2) * 0.3);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TILT CARD (3-D hover effect)
═══════════════════════════════════════════════════════════════ */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx   = useMotionValue(0);
  const ry   = useMotionValue(0);
  const srx  = useSpring(rx, { stiffness: 300, damping: 30 });
  const sry  = useSpring(ry, { stiffness: 300, damping: 30 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width  - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    rx.set(py * -10);
    ry.set(px *  10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BENEFIT CARD — 3D FLIP
═══════════════════════════════════════════════════════════════ */
type BenefitData = (typeof BENEFITS)[number];

function BenefitCard({ b }: { b: BenefitData }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = b.icon;
  return (
    <div
      className="relative h-60 cursor-pointer"
      style={{ perspective: "600px" }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease }}
        style={{ transformStyle: "preserve-3d" }}
        onHoverStart={() => setFlipped(true)}
        onHoverEnd={() => setFlipped(false)}
      >
        {/* FRONT */}
        <div
          className={`absolute inset-0 rounded-3xl p-7 glass bg-gradient-to-br ${b.grad} border ${b.ring} flex flex-col justify-between overflow-hidden`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className={`size-12 rounded-2xl ${b.ic} flex items-center justify-center mb-5`}>
              <Icon className="size-5" />
            </div>
            <h3 className="text-xl font-serif mb-2">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.front}</p>
          </div>
          <div className="h-px bg-gradient-to-r from-current to-transparent opacity-20" />
        </div>

        {/* BACK */}
        <div
          className={`absolute inset-0 rounded-3xl p-7 glass bg-gradient-to-br ${b.grad} border ${b.ring} flex flex-col justify-between overflow-hidden`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm text-foreground leading-relaxed">{b.back}</p>
          <a
            href="#ritual"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose hover:gap-3 transition-all duration-200"
          >
            Learn More <ArrowRight className="size-3" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO CAROUSEL
═══════════════════════════════════════════════════════════════ */
function VideoCarousel() {
  const [current, setCurrent]   = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress]  = useState(0);
  const [direction, setDirection] = useState(1);
  const [dragging, setDragging]  = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const dragStart = useRef(0);

  /* 3D tilt */
  const phoneRX = useMotionValue(0);
  const phoneRY = useMotionValue(0);
  const sPhoneRX = useSpring(phoneRX, { stiffness: 180, damping: 22 });
  const sPhoneRY = useSpring(phoneRY, { stiffness: 180, damping: 22 });

  const onPhoneMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width  - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    phoneRX.set(py * -10);
    phoneRY.set(px * 16);
  };
  const onPhoneLeave = () => { phoneRX.set(0); phoneRY.set(0); };

  const goTo = useCallback((idx: number, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
    setProgress(0);
  }, []);
  const next = useCallback(() => goTo((current + 1) % VIDEOS.length, 1), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + VIDEOS.length) % VIDEOS.length, -1), [current, goTo]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [current, isPlaying]);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v?.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  /* swipe */
  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    dragStart.current = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setDragging(true);
  };
  const onDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    const end = "changedTouches" in e
      ? e.changedTouches[0].clientX
      : (e as React.MouseEvent).clientX;
    const diff = dragStart.current - end;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  };

  const slideV = {
    enter: (d: number) => ({
      x: d > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.88,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (d: number) => ({
      x: d > 0 ? "-30%" : "30%",
      opacity: 0,
      scale: 0.94,
      filter: "blur(2px)",
    }),
  };

  /* orbiting sparkle positions (deterministic) */
  const orbitAngles = useMemo(() => [0, 2.094, 4.189], []);

  return (
    /* outer wrapper: thumbnail LEFT, phone RIGHT — flex row, no overflow */
    <div className="relative flex items-center gap-4 select-none w-full max-w-[420px] lg:max-w-none">

      {/* ── thumbnail strip (left side, only on xl+) ── */}
      <div className="hidden xl:flex flex-col gap-2.5 flex-shrink-0">
        {VIDEOS.map((v, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            whileHover={{ scale: 1.08, x: 3 }}
            whileTap={{ scale: 0.93 }}
            className="relative w-[48px] h-[70px] rounded-xl overflow-hidden flex-shrink-0"
            style={{ opacity: i === current ? 1 : 0.38 }}
            aria-label={v.label}
          >
            <video src={v.src} muted playsInline className="w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 bg-black/25" />
            {i === current && (
              <motion.div
                layoutId="strip-border"
                className="absolute inset-0 rounded-xl border-2"
                style={{ borderColor: VIDEOS[current].accent }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* ── phone wrapper (perspective) ── */}
      <div style={{ perspective: "1200px" }} className="flex-shrink-0">
        <motion.div
          className="relative"
          style={{ rotateX: sPhoneRX, rotateY: sPhoneRY, transformStyle: "preserve-3d" }}
          onMouseMove={onPhoneMove}
          onMouseLeave={onPhoneLeave}
        >
          {/* Animated halo — tight around phone, pulses per video */}
          <motion.div
            className="absolute -inset-6 rounded-[48px] -z-10 pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 40px 10px ${VIDEOS[current].accent}44`,
                `0 0 70px 20px ${VIDEOS[current].accent}77`,
                `0 0 40px 10px ${VIDEOS[current].accent}44`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* subtle blur glow behind */}
          <motion.div
            className="absolute -inset-10 rounded-[60px] blur-[50px] -z-10 pointer-events-none"
            animate={{ opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: `radial-gradient(ellipse, ${VIDEOS[current].accent}66 0%, transparent 70%)` }}
          />

          {/* Orbiting sparkles */}
          {orbitAngles.map((baseAngle, i) => (
            <motion.div
              key={i}
              className="absolute size-2.5 rounded-full pointer-events-none"
              style={{
                background: VIDEOS[current].accent,
                filter: "blur(0.5px)",
                top: "50%", left: "50%",
                boxShadow: `0 0 8px 2px ${VIDEOS[current].accent}88`,
              }}
              animate={{
                x: [
                  Math.cos(baseAngle) * 130,
                  Math.cos(baseAngle + Math.PI) * 130,
                  Math.cos(baseAngle + 2 * Math.PI) * 130,
                ],
                y: [
                  Math.sin(baseAngle) * 200,
                  Math.sin(baseAngle + Math.PI) * 200,
                  Math.sin(baseAngle + 2 * Math.PI) * 200,
                ],
                opacity: [0.4, 1, 0.4],
                scale: [0.7, 1.4, 0.7],
              }}
              transition={{
                duration: 5 + i * 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.0,
              }}
            />
          ))}

          {/* Phone shell */}
          <div
            className="relative w-[260px] h-[500px] md:w-[290px] md:h-[560px] rounded-[40px] overflow-hidden border border-white/25"
            style={{ boxShadow: "0 40px 80px -16px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset" }}
            onMouseDown={onDragStart}
            onMouseUp={onDragEnd}
            onTouchStart={onDragStart}
            onTouchEnd={onDragEnd}
          >
            {/* Dynamic island */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 w-24 h-6 rounded-full bg-black/85 backdrop-blur-xl flex items-center justify-center gap-2">
              <div className="size-2.5 rounded-full bg-black border border-white/10" />
              <div className="size-1.5 rounded-full bg-black/50 border border-white/10" />
            </div>

            {/* Video */}
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.video
                key={current}
                ref={videoRef}
                src={VIDEOS[current].src}
                autoPlay muted playsInline loop={false}
                custom={direction}
                variants={slideV}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease, filter: { duration: 0.4 } }}
                onTimeUpdate={onTimeUpdate}
                onEnded={next}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ cursor: dragging ? "grabbing" : "grab" }}
              />
            </AnimatePresence>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent z-10 pointer-events-none" />
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              animate={{ background: `linear-gradient(135deg, ${VIDEOS[current].accent}22 0%, transparent 60%)` }}
              transition={{ duration: 0.8 }}
            />

            {/* Story bars */}
            <div className="absolute top-12 left-4 right-4 z-20 flex gap-1">
              {VIDEOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/20"
                  aria-label={`Go to video ${i + 1}`}
                >
                  <motion.div
                    className="h-full rounded-full bg-white"
                    animate={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
                    transition={{ duration: 0.1 }}
                  />
                </button>
              ))}
            </div>

            {/* Tag */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${current}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35 }}
                className="absolute top-[70px] left-4 z-20"
              >
                <span
                  className="px-3 py-1 rounded-full backdrop-blur-md border border-white/25 text-[10px] font-mono text-white tracking-widest"
                  style={{ background: `${VIDEOS[current].accent}33` }}
                >
                  {VIDEOS[current].tag}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`info-${current}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                >
                  <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.28em] mb-0.5">
                    {String(current + 1).padStart(2, "0")} of {VIDEOS.length}
                  </p>
                  <h3 className="text-white font-serif italic text-[22px] leading-tight mb-3">
                    {VIDEOS[current].label}
                  </h3>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {([{ fn: prev, icon: ChevronLeft, label: "Prev" }, { fn: next, icon: ChevronRight, label: "Next" }] as const).map(({ fn, icon: Icon, label }) => (
                    <motion.button
                      key={label}
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={fn}
                      className="size-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center"
                      aria-label={label}
                    >
                      <Icon className="size-4 text-white" />
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => setIsPlaying(p => !p)}
                  className="relative flex items-center justify-center"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  <ProgressRing progress={progress} size={46} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    {isPlaying
                      ? <Pause className="size-4 text-white" />
                      : <Play  className="size-4 text-white ml-0.5" />}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Glow Score badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7, ease }}
            whileHover={{ scale: 1.06 }}
            className="absolute -bottom-5 -right-6 glass rounded-2xl px-4 py-3 shadow-glow flex items-center gap-3 z-30 cursor-default"
          >
            <div className="size-9 rounded-full gradient-aura flex items-center justify-center animate-heartbeat shadow-glow">
              <Heart className="size-4 text-white fill-white" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Glow Score</p>
              <p className="text-xl font-serif font-bold text-rose leading-none">
                84<span className="text-xs font-sans font-normal text-muted-foreground"> /100</span>
              </p>
            </div>
          </motion.div>

          {/* AI badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.7, ease }}
            whileHover={{ scale: 1.06 }}
            className="absolute -top-3 -left-8 glass rounded-2xl px-3 py-2.5 shadow-soft flex items-center gap-2 z-30 cursor-default"
          >
            <span className="text-lg leading-none">✨</span>
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none mb-0.5">AI Analysis</p>
              <p className="text-xs font-semibold text-foreground">Glowing skin detected</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARQUEE (dual row)
═══════════════════════════════════════════════════════════════ */
const MARQUEE_ITEMS = [
  "✦ Luminous Skin", "✦ AI Beauty Ritual", "✦ Personalized Care",
  "✦ Glow From Within", "✦ Dermatologist Backed",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <motion.div
      className="flex whitespace-nowrap"
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
    >
      {row.map((t, i) => (
        <span
          key={i}
          className="text-[10px] font-mono tracking-[0.32em] text-rose/50 uppercase mx-6 flex-shrink-0"
        >
          {t}
        </span>
      ))}
    </motion.div>
  );
}

function Marquee() {
  return (
    <div className="py-4 border-y border-rose/15 bg-gradient-to-r from-rose/5 via-peach/8 to-lavender/5 overflow-hidden space-y-2">
      <MarqueeRow />
      <MarqueeRow reverse />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SELF-LOVE QUOTES SECTION
═══════════════════════════════════════════════════════════════ */
function SelfLoveQuotes() {
  const [active, setActive] = useState(0);
  const total = SELF_LOVE_QUOTES.length;

  // Auto-rotate every 4s
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % total), 4000);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose/8 via-lavender/6 to-peach/8 -z-10" />
      <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-2xl -z-10" />
      {/* decorative large text */}
      <div className="absolute top-8 left-8 text-[120px] font-serif text-rose/5 leading-none select-none pointer-events-none">"</div>
      <div className="absolute bottom-8 right-8 text-[120px] font-serif text-lavender/5 leading-none select-none pointer-events-none rotate-180">"</div>

      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-[0.35em] text-rose uppercase mb-3">✦ Daily Affirmations ✦</p>
          <h2 className="text-3xl md:text-4xl font-serif italic leading-tight">Words for your glow-up journey.</h2>
        </motion.div>

        {/* Big featured quote */}
        <div className="relative h-52 mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.97 }}
              transition={{ duration: 0.6, ease }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-foreground leading-snug max-w-3xl">
                "{SELF_LOVE_QUOTES[active].quote}"
              </p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-5 text-xs font-mono tracking-[0.25em] text-rose uppercase"
              >
                — {SELF_LOVE_QUOTES[active].author}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="flex justify-center gap-2 mb-12">
          {SELF_LOVE_QUOTES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                background: i === active ? "oklch(0.83 0.14 5)" : "oklch(0.83 0.14 5 / 0.25)",
              }}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>

        {/* Quote grid cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SELF_LOVE_QUOTES.map((q, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.25 } }}
              onClick={() => setActive(i)}
              className={`relative p-6 rounded-2xl glass bg-gradient-to-br ${q.color} border border-white/30 dark:border-white/10 cursor-pointer overflow-hidden group`}
            >
              <div className="absolute top-3 right-4 text-3xl font-serif text-rose/15 leading-none select-none">"</div>
              <p className="text-sm font-serif italic text-foreground/80 leading-relaxed mb-4">
                "{q.quote}"
              </p>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-rose/60" />
                <span className="text-[10px] font-mono tracking-widest text-rose/70 uppercase">{q.author}</span>
              </div>
              {/* hover glow line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 origin-left rounded-b-2xl"
                style={{ background: "linear-gradient(90deg, oklch(0.83 0.14 5 / 0.5), oklch(0.85 0.09 300 / 0.4), transparent)" }}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.35 }}
              />
              {/* active indicator */}
              {i === active && (
                <motion.div
                  layoutId="quote-active"
                  className="absolute inset-0 rounded-2xl border-2 border-rose/40 pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  return (
    <motion.span
      onViewportEnter={() => {
        let start = 0;
        const step = () => {
          start += 1;
          setDisplayed(start);
          if (start < value) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }}
    >
      +{displayed}%
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING
═══════════════════════════════════════════════════════════════ */
function Landing() {
  const [bursts, setBursts] = useState<{ x: number; y: number; id: number }[]>([]);
  const burstId  = useRef(0);
  const heroRef  = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const spawnBurst = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const id = burstId.current++;
    setBursts(b => [...b, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => setBursts(b => b.filter(p => p.id !== id)), 850);
  }, []);

  return (
    <div
      className="min-h-screen text-foreground overflow-x-hidden"
      onClick={spawnBurst}
    >
      <AmbientBackground />
      <CursorTrail />
      <FloatingPetals />

      {/* glitter bursts */}
      {bursts.map(b => <GlitterBurst key={b.id} {...b} />)}

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative px-6 pt-16 pb-28 max-w-7xl mx-auto overflow-hidden">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center"
        >
          {/* copy */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="space-y-8 z-10 order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.65, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose/10 border border-rose/25 text-[10px] font-bold tracking-[0.22em] text-rose uppercase"
            >
              <Sparkles className="size-3 animate-pulse" />
              Your Digital Esthetician
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-serif leading-[0.97] tracking-tight text-balance">
              Reveal your{" "}
              <span className="relative inline-block italic text-rose">
                true
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.8, ease }}
                  className="absolute -bottom-1 left-0 right-0 h-[2.5px] origin-left rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--color-rose), var(--color-peach), transparent)" }}
                />
              </span>
              {" "}skin glow.
            </h1>

            <p className="max-w-md text-base text-muted-foreground leading-relaxed text-pretty">
              Experience the future of personalized beauty. Our AI understands
              your skin's unique language to curate a ritual that evolves with you.
            </p>

            <div className="flex flex-wrap gap-2">
              {["10k+ glowing women 🌸", "AI-powered ✦", "Dermatologist-backed 💎"].map((t, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 rounded-full bg-white/55 dark:bg-white/8 border border-border text-xs text-muted-foreground backdrop-blur-sm cursor-default"
                >
                  {t}
                </motion.span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <MagneticBtn>
                <Link
                  to="/auth"
                  className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-medium shadow-glow overflow-hidden"
                >
                  <span className="relative z-10">Start Your Glow Journey</span>
                  <Heart className="relative z-10 size-4 fill-current animate-heartbeat" />
                  <motion.span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(135deg,oklch(0.76 0.17 5),oklch(0.88 0.1 60))" }}
                  />
                </Link>
              </MagneticBtn>

              <MagneticBtn>
                <a
                  href="#ritual"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-border rounded-full font-medium hover:border-rose/45 hover:bg-rose/5 hover:text-rose transition-all duration-300 group"
                >
                  Discover Your Routine
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </MagneticBtn>
            </div>
          </motion.div>

          {/* video */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.12, ease }}
            className="flex justify-center lg:justify-end order-1 lg:order-2 overflow-visible"
          >
            <VideoCarousel />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════ */}
      <Marquee />

      {/* ══ BENEFITS ══════════════════════════════════════════ */}
      <section id="science" className="px-6 py-28 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-xl mx-auto mb-20">
          <p className="text-[10px] font-mono tracking-[0.35em] text-rose uppercase mb-4">The Promise</p>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-tight text-balance">
            A ritual that loves<br />your skin back.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">Four pillars of luminous, effortless skincare.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
              <BenefitCard b={b} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section id="ritual" className="relative px-6 py-28 overflow-hidden">
        <div className="absolute inset-0 bg-white/40 dark:bg-black/22 backdrop-blur-3xl border-y border-border -z-10" />
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-rose/5 blur-[80px] -z-10" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full bg-lavender/7 blur-[60px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-xl mx-auto mb-20">
            <p className="text-[10px] font-mono tracking-[0.35em] text-rose uppercase mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight text-balance">
              Three quiet steps<br />to your glow.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connector line */}
            <div
              className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, oklch(0.83 0.14 5 / 0.25), transparent)" }}
            />
            {STEPS.map((s, i) => (
              <TiltCard key={s.n}>
                <motion.div
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.14 }}
                  whileHover={{ y: -8, transition: { duration: 0.3, ease } }}
                  className="group relative p-8 rounded-[32px] glass overflow-hidden cursor-default"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="size-10 rounded-full bg-rose/12 border border-rose/28 flex items-center justify-center mb-6">
                    <span className="text-xs font-mono font-bold text-rose">{s.n}</span>
                  </div>
                  <motion.div
                    className="text-3xl mb-4 origin-center inline-block"
                    whileHover={{ rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.2, 1.2, 1.1, 1], transition: { duration: 0.55 } }}
                  >
                    {s.emoji}
                  </motion.div>
                  <h3 className="text-xl font-serif mb-3">{s.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <section className="relative px-6 py-28 max-w-7xl mx-auto">
        {/* decorative blur circle */}
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-peach/20 blur-[80px] -z-10" />

        <motion.div {...fadeUp} className="text-center max-w-xl mx-auto mb-20">
          <p className="text-[10px] font-mono tracking-[0.35em] text-rose uppercase mb-4">Results</p>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-tight text-balance">
            Numbers that glow.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {STATS.map((s, i) => (
            <TiltCard key={s.w}>
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.12 }}
                className={`relative p-8 rounded-[32px] glass bg-gradient-to-br ${s.grad} border border-border overflow-hidden cursor-default`}
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <p className="text-[9px] font-mono tracking-[0.3em] text-muted-foreground uppercase mb-3">{s.w}</p>
                <p className="text-5xl font-serif font-bold text-foreground mb-1">
                  <AnimatedNumber value={s.v} />
                </p>
                <p className="text-sm text-muted-foreground mb-5">{s.h}</p>
                {/* spring progress bar */}
                <div className="h-1.5 rounded-full bg-foreground/8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose to-peach"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.v * 2}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.15 }}
                  />
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ══ SELF-LOVE QUOTES ══════════════════════════════════ */}
      <SelfLoveQuotes />

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section id="testimonials" className="relative px-6 py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose/4 via-transparent to-lavender/4 -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-xl mx-auto mb-20">
            <p className="text-[10px] font-mono tracking-[0.35em] text-rose uppercase mb-4">Community</p>
            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight text-balance">
              Skin that speaks<br />for itself.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.13 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-[32px] glass border border-border overflow-hidden cursor-default"
              >
                {/* quote mark */}
                <div className="absolute -top-2 -left-1 text-[96px] font-serif leading-none text-rose/8 select-none pointer-events-none">
                  "
                </div>

                {/* stars pop-in */}
                <div className="flex gap-1 mb-5">
                  {[0, 1, 2, 3, 4].map(j => (
                    <motion.div
                      key={j}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + j * 0.07, type: "spring", stiffness: 400, damping: 14 }}
                    >
                      <Star className="size-3.5 text-rose fill-rose" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-6 italic">"{t.q}"</p>

                {/* avatar */}
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full gradient-aura flex items-center justify-center text-sm font-serif font-bold text-white shadow-glow">
                    {t.n[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.n}, {t.age}</p>
                    <p className="text-xs text-muted-foreground">{t.t}</p>
                  </div>
                </div>

                {/* bottom accent sweep */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose to-lavender origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════════ */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[40px] p-14 md:p-20 text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.83 0.14 5) 0%, oklch(0.85 0.09 300) 33%, oklch(0.88 0.08 230) 66%, oklch(0.9 0.08 60) 100%)",
            backgroundSize: "300% 300%",
            animation: "shimmer-bg 10s ease infinite",
          }}
        >
          {/* animated blobs */}
          <motion.div
            className="absolute top-[-40px] left-[-40px] w-64 h-64 rounded-full bg-white/20 blur-[60px]"
            animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-40px] right-[-40px] w-72 h-72 rounded-full bg-white/15 blur-[70px]"
            animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/10 blur-[50px]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/25 backdrop-blur-sm border border-white/35 text-[10px] font-bold tracking-widest text-white uppercase"
            >
              <Zap className="size-3" /> Limited Time
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight mb-5 text-balance">
              Your skin's best chapter<br />starts now.
            </h2>
            <p className="text-white/80 text-base max-w-md mx-auto mb-10 text-pretty">
              Join thousands of women who've unlocked their most luminous skin.
              Your personalized ritual is waiting.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <MagneticBtn>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-semibold shadow-glow hover:shadow-none transition-all duration-300"
                >
                  Begin My Ritual <Heart className="size-4 fill-current animate-heartbeat" />
                </Link>
              </MagneticBtn>
              <MagneticBtn>
                <a
                  href="#science"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/50 text-white font-semibold hover:bg-white/15 transition-all duration-300"
                >
                  Explore the Science <ArrowRight className="size-4" />
                </a>
              </MagneticBtn>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="px-6 py-12 max-w-7xl mx-auto border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif italic font-semibold tracking-tight">
              Skin<span className="text-rose">Aura</span>
            </span>
            <span className="size-1.5 rounded-full bg-rose animate-pulse" />
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            {["#science", "#ritual", "#testimonials"].map((href, i) => (
              <a
                key={i}
                href={href}
                className="hover:text-foreground transition-colors capitalize"
              >
                {["The Science", "Rituals", "Community"][i]}
              </a>
            ))}
            <Link to="/auth" className="hover:text-foreground transition-colors">Enter</Link>
          </nav>

          <div className="flex gap-3">
            {(["✦", "🌸", "◆"] as const).map((icon, i) => (
              <motion.button
                key={i}
                whileHover={{ rotate: 15, scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="size-9 rounded-full glass border border-border flex items-center justify-center text-sm text-muted-foreground hover:text-rose transition-colors"
                aria-label={`Social ${i + 1}`}
              >
                {icon}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground/60">
          <p>© {new Date().getFullYear()} SkinBeauty. All rights reserved.</p>
          <p>Made with <span className="text-rose animate-heartbeat inline-block">♥</span> for luminous skin.</p>
        </div>
      </footer>
    </div>
  );
}
