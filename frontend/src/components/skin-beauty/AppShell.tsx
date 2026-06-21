import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AmbientBackground } from "./AmbientBackground";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/30">
      <AmbientBackground />
      <Navbar variant="app" />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {children}
      </motion.main>
    </div>
  );
}
