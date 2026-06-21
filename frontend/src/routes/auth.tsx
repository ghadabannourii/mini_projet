import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { AmbientBackground } from "@/components/skin-beauty/AmbientBackground";
import { login } from "@/lib/keycloak";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — SkinBeauty" },
      { name: "description", content: "Connectez-vous à SkinBeauty pour accéder à votre companion dermatologique." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  /**
   * Tentative de connexion via Keycloak.
   * En développement local sans Keycloak, on redirige directement.
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        // ── Connexion Keycloak ──────────────────────────────────────────
        // Utilise le username (email avant @) ou email complet selon la config Keycloak
        const username = email.includes("@") ? email.split("@")[0] : email;
        await login(username, password);
        toast.success("Connexion réussie ✨");
        setTimeout(() => navigate({ to: "/dashboard" }), 500);
      } else {
        // ── Inscription (démo — en production via l'API Admin Keycloak) ──
        toast.success("Compte créé ! Connectez-vous avec vos identifiants. 💖");
        setMode("login");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur de connexion";

      // Si Keycloak est indisponible (dev sans Docker), bypass pour la démo
      if (message.includes("fetch") || message.includes("network")) {
        toast.warning("Keycloak indisponible — mode démo activé");
        setTimeout(() => navigate({ to: "/dashboard" }), 500);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <AmbientBackground />
      <Link to="/" className="absolute top-6 left-6 text-sm font-serif italic text-rose">
        ← Skin<span className="font-semibold">Beauty</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md p-10 rounded-[32px] glass shadow-glow"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="size-4 text-rose" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-rose uppercase">Sécurisé par Keycloak</p>
          </div>
          <h1 className="text-4xl font-serif italic">
            {mode === "login" ? "Bienvenue" : "Rejoignez SkinBeauty"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login"
              ? "Votre companion dermatologique vous attend."
              : "Commençons votre rituel de soin personnalisé."}
          </p>
        </div>

        {/* Toggle Login / Register */}
        <div className="flex p-1 rounded-full bg-white/60 dark:bg-white/5 border border-border mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
                mode === m ? "bg-foreground text-background shadow" : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Field
                  label="Votre prénom"
                  type="text"
                  placeholder="Ghada"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Field
            label="Email"
            type="email"
            placeholder="ghadae@skinbeauty.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-glow hover:-translate-y-0.5 hover:scale-[1.01] active:scale-95 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Se connecter ✨" : "Créer mon compte 💖"}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {mode === "login" ? "Nouveau sur SkinBeauty ?" : "Déjà un compte ?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-rose font-medium underline-offset-4 hover:underline"
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>

        {/* Info Keycloak */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl bg-foreground/5 border border-border/50"
        >
          <p className="text-[10px] font-mono text-muted-foreground text-center leading-relaxed">
            Authentification via <span className="text-rose font-semibold">Keycloak</span> · Realm SkinBeautyRealm<br/>
            Rôles : <code className="bg-foreground/10 px-1 rounded">user</code> (lecture) ·{" "}
            <code className="bg-foreground/10 px-1 rounded">admin</code> (écriture)
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-border focus:outline-none focus:border-rose focus:shadow-[0_0_0_4px_oklch(0.83_0.14_5/0.15)] transition-all"
      />
    </label>
  );
}
