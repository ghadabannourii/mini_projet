import { motion } from "framer-motion";

export function GlowRing({ score = 84, label = "GLOWING" }: { score?: number; label?: string }) {
  const radius = 88;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative size-48">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <defs>
          <linearGradient id="glow-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.83 0.14 5)" />
            <stop offset="50%" stopColor="oklch(0.85 0.09 300)" />
            <stop offset="100%" stopColor="oklch(0.88 0.08 230)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-primary/15" />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#glow-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: [0.32, 0.72, 0, 1] }}
          style={{ filter: "drop-shadow(0 0 14px oklch(0.83 0.14 5 / 0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-6xl font-serif"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold tracking-[0.25em] text-rose mt-1">{label}</span>
      </div>
    </div>
  );
}
