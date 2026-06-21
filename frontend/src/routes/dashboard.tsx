import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Droplet, Sparkles, Sun, Moon, RefreshCw, AlertTriangle, Users } from "lucide-react";
import { AppShell } from "@/components/skin-beauty/AppShell";
import { GlowRing } from "@/components/skin-beauty/GlowRing";
import { useQuery } from "@tanstack/react-query";
import { utilisateurApi, analyseApi, alerteApi } from "@/lib/api";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your glow space — SkinBeauty" },
      { name: "description", content: "Tableau de bord SkinBeauty : score de peau, rituels AM/PM, alertes." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [selectedUserId, setSelectedUserId] = useState<number>(1);

  // ── Données backend ──────────────────────────────────────────────────────
  const { data: utilisateurs = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: utilisateurApi.getAll,
    retry: 1,
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ["analyses", selectedUserId],
    queryFn: () => analyseApi.getByUtilisateur(selectedUserId),
    enabled: !!selectedUserId,
    retry: 1,
  });

  const { data: alertes = [] } = useQuery({
    queryKey: ["alertes", selectedUserId],
    queryFn: () => alerteApi.getByUtilisateur(selectedUserId),
    enabled: !!selectedUserId,
    retry: 1,
  });

  const selectedUser = utilisateurs.find((u) => u.id === selectedUserId);
  const latestAnalyse = analyses[0];

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-mono tracking-[0.3em] text-rose uppercase">SkinBeauty Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-serif italic">
            Bonjour, {selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : "..."}
          </h1>
          <p className="text-muted-foreground">Type de peau Fitzpatrick : {selectedUser?.typePeau ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-mint animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Live sync</span>
        </div>
      </header>

      {/* Sélecteur d'utilisateur */}
      {utilisateurs.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          {utilisateurs.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                selectedUserId === u.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              <Users className="inline size-3 mr-1.5" />
              {u.prenom} ({u.typePeau})
            </button>
          ))}
        </div>
      )}

      {loadingUsers && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <RefreshCw className="size-4 animate-spin" />
          Connexion à profil-ms...
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profil card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-8 rounded-[32px] glass shadow-soft flex items-center gap-5"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full gradient-aura blur-md animate-glow" />
            <div className="relative size-16 rounded-full gradient-aura flex items-center justify-center font-serif text-2xl text-foreground">
              {selectedUser?.prenom?.[0] ?? "?"}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground">Profil utilisateur</p>
            <h3 className="font-serif text-2xl">{selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : "—"}</h3>
            <p className="text-xs text-muted-foreground">{selectedUser?.email ?? "—"}</p>
          </div>
        </motion.div>

        {/* Type de peau */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-[32px] bg-gradient-to-br from-lavender/40 to-rose/20 border border-border shadow-soft"
        >
          <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground">Type Fitzpatrick</p>
          <h3 className="font-serif text-5xl mt-2">{selectedUser?.typePeau ?? "—"}</h3>
          {latestAnalyse && (
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>Âge réel : {latestAnalyse.ageReel} ans</p>
              <p>Âge de la peau : {latestAnalyse.agePeau} ans</p>
              <p>Analyse : {latestAnalyse.dateAnalyse}</p>
            </div>
          )}
        </motion.div>

        {/* Score de peau */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-8 rounded-[32px] glass shadow-soft flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Score peau</div>
          <GlowRing score={latestAnalyse?.score ?? 0} />
          {latestAnalyse && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Dernière analyse le {latestAnalyse.dateAnalyse}
            </p>
          )}
          {!latestAnalyse && (
            <p className="text-center text-xs text-muted-foreground mt-4">Aucune analyse disponible</p>
          )}
        </motion.div>
      </div>

      {/* Alertes conflits (RabbitMQ → profil-ms) */}
      {alertes.length > 0 && (
        <>
          <h2 className="text-2xl font-serif italic mt-16 mb-6 flex items-center gap-3">
            <AlertTriangle className="size-5 text-rose" />
            Alertes de conflits d'ingrédients
          </h2>
          <div className="space-y-3">
            {alertes.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-5 rounded-2xl border glass ${a.severite === "high" ? "border-red-400/40 bg-red-50/30 dark:bg-red-950/20" : "border-amber-400/40 bg-amber-50/30 dark:bg-amber-950/20"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono uppercase tracking-wider font-bold ${a.severite === "high" ? "text-red-500" : "text-amber-500"}`}>
                    Sévérité : {a.severite}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(a.dateAlerte).toLocaleString("fr-FR")}</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {a.detailsConflits.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-rose inline-block" />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Statut du jour */}
      <h2 className="text-2xl font-serif italic mt-16 mb-6">Statut du jour</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Droplet, label: "Hydration", v: latestAnalyse ? `Score ${latestAnalyse.score}` : "—", c: "bg-skyaura/30" },
          { icon: Sparkles, label: "Type Fitzpatrick", v: selectedUser?.typePeau ?? "—", c: "bg-rose/20" },
          { icon: Sun, label: "Rituel AM", v: "Voir routine", c: "bg-peach/30" },
          { icon: Moon, label: "Rituel PM", v: "Ce soir", c: "bg-lavender/30" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="p-6 rounded-3xl glass hover:shadow-glow hover:-translate-y-0.5 transition-all"
          >
            <div className={`size-10 rounded-2xl ${s.c} flex items-center justify-center mb-4`}>
              <s.icon className="size-4" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            <p className="font-serif text-2xl mt-1">{s.v}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 p-12 rounded-[40px] gradient-aura animate-shimmer text-center"
      >
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-foreground/70 mb-3">Votre rituel</p>
        <p className="text-2xl md:text-3xl font-serif italic text-foreground/90 max-w-2xl mx-auto text-balance">
          "Votre peau est une lettre d'amour, écrite un rituel à la fois."
        </p>
        <Link
          to="/routine"
          className="inline-block mt-6 px-8 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:scale-105 transition-transform"
        >
          Voir ma routine →
        </Link>
      </motion.div>
    </AppShell>
  );
}
