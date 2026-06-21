import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/routine", label: "Ritual" },
  { to: "/analysis", label: "Analysis" },
  { to: "/notifications", label: "Notes" },
  { to: "/settings", label: "Settings" },
] as const;

export function Navbar({ variant = "marketing" }: { variant?: "marketing" | "app" }) {
  return (
    <nav className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl bg-background/60 border-b border-border">
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-xl font-serif italic font-semibold tracking-tight">
          Skin<span className="text-rose">Beauty</span>
        </span>
        <span className="size-1.5 rounded-full bg-rose animate-pulse" />
      </Link>
      <div className="flex items-center gap-6">
        {variant === "app" ? (
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#science" className="hover:text-foreground transition-colors">The Science</a>
            <a href="#ritual" className="hover:text-foreground transition-colors">Rituals</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Community</a>
          </div>
        )}
        <ThemeToggle />
        <Link
          to={variant === "app" ? "/dashboard" : "/auth"}
          className="px-5 py-2 bg-foreground text-background rounded-full text-xs font-medium tracking-wider hover:scale-105 transition-transform shadow-sm"
        >
          {variant === "app" ? "MY GLOW" : "ENTER"}
        </Link>
      </div>
    </nav>
  );
}
