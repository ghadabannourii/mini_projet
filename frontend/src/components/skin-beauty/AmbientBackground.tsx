export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute -top-[10%] -right-[5%] size-[500px] rounded-full blur-[120px] animate-glow bg-rose/40" />
      <div
        className="absolute -bottom-[10%] -left-[5%] size-[400px] rounded-full blur-[100px] animate-glow bg-lavender/50"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/3 left-1/2 size-[300px] rounded-full blur-[100px] animate-glow bg-peach/30"
        style={{ animationDelay: "4s" }}
      />
      {/* sparkles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white/80 dark:bg-white/40 animate-sparkle"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            animationDelay: `${(i % 5) * 0.7}s`,
            boxShadow: "0 0 12px rgba(255,255,255,0.9)",
          }}
        />
      ))}
    </div>
  );
}
