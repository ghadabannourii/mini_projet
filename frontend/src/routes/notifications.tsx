import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Droplet, Heart, Sparkles, Bell, Sun, AlertTriangle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/skin-beauty/AppShell";
import { useQuery } from "@tanstack/react-query";
import { alerteApi, utilisateurApi } from "@/lib/api";
import { useState } from "react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Alertes & Notifications — SkinBeauty" },
      { name: "description", content: "Alertes de conflits d'ingrédients reçues via RabbitMQ." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all");

  const { data: utilisateurs = [] } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: utilisateurApi.getAll,
    retry: 1,
  });

  const { data: toutes = [], isLoading: loadingAll } = useQuery({
    queryKey: ["alertes-all"],
    queryFn: alerteApi.getAll,
    enabled: selectedUserId === "all",
    retry: 1,
  });

  const { data: alertesUser = [], isLoading: loadingUser } = useQuery({
    queryKey: ["alertes", selectedUserId],
    queryFn: () => alerteApi.getByUtilisateur(selectedUserId as number),
    enabled: typeof selectedUserId === "number",
    retry: 1,
  });

  const alertes = selectedUserId === "all" ? toutes : alertesUser;
  const isLoading = loadingAll || loadingUser;

  // Notifications statiques (rappels beauté)
  const staticNotes = [
    { icon: Heart, c: "bg-rose/30", title: "Rituel AM complété", time: "Il y a 2h", body: "Vous avez terminé votre rituel du matin. Votre peau vous remercie." },
    { icon: Sparkles, c: "bg-lavender/40", title: "Suggestion de routine", time: "Hier", body: "Basé sur votre progression, ajoutez un exfoliant doux deux fois par semaine." },
    { icon: Sun, c: "bg-peach/40", title: "Rappel matin", time: "Hier", body: "N'oubliez pas votre SPF — c'est le plus beau cadeau pour votre peau future." },
    { icon: Bell, c: "bg-mint/40", title: "Rapport hebdomadaire disponible", time: "Il y a 2 jours", body: "Votre score de peau a progressé cette semaine. Un beau progrès silencieux." },
    { icon: Droplet, c: "bg-skyaura/40", title: "Hydratation en hausse", time: "Il y a 3 jours", body: "Votre peau semble plus hydratée. Continuez votre routine actuelle." },
  ];

  return (
    <AppShell>
      <header className="mb-12">
        <p className="text-[10px] font-mono tracking-[0.3em] text-rose uppercase">Alertes & Notifications</p>
        <h1 className="text-4xl md:text-5xl font-serif italic mt-2">Messages de votre peau</h1>
        <p className="text-muted-foreground mt-2">Alertes RabbitMQ + rappels beauté.</p>
      </header>

      {/* Sélecteur utilisateur */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedUserId("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedUserId === "all"
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:border-foreground/40"
          }`}
        >
          Tous les utilisateurs
        </button>
        {utilisateurs.map((u) => (
          <button
            key={u.id}
            onClick={() => setSelectedUserId(u.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedUserId === u.id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40"
            }`}
          >
            {u.prenom}
          </button>
        ))}
      </div>

      {/* Alertes conflits (RabbitMQ) */}
      {(alertes.length > 0 || isLoading) && (
        <>
          <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose" />
            Alertes de conflits d'ingrédients
            <span className="text-xs text-muted-foreground font-sans font-normal">(RabbitMQ → profil-ms)</span>
          </h2>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="size-4 animate-spin" />
              Chargement depuis profil-ms...
            </div>
          )}

          <div className="space-y-3 mb-10">
            {alertes.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: [0.32, 0.72, 0, 1], duration: 0.6 }}
                className={`p-5 rounded-3xl glass shadow-soft border ${
                  a.severite === "high"
                    ? "border-red-400/30 bg-red-50/20 dark:bg-red-950/20"
                    : "border-amber-400/30 bg-amber-50/20 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                    a.severite === "high" ? "bg-red-500/20" : "bg-amber-500/20"
                  }`}>
                    <AlertTriangle className={`size-4 ${a.severite === "high" ? "text-red-500" : "text-amber-500"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${a.severite === "high" ? "text-red-500" : "text-amber-600"}`}>
                        Conflit {a.severite.toUpperCase()} — Utilisateur #{a.utilisateurId}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {new Date(a.dateAlerte).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-13">
                  {a.detailsConflits.map((d, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-rose inline-block shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {!isLoading && alertes.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">Aucune alerte de conflit pour le moment. ✨</p>
            )}
          </div>
        </>
      )}

      {/* Notifications statiques beauté */}
      <h2 className="text-lg font-serif mb-4">Rappels beauté</h2>
      <div className="space-y-4 max-w-3xl">
        {staticNotes.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, ease: [0.32, 0.72, 0, 1], duration: 0.6 }}
            whileHover={{ x: 4 }}
            className="p-5 rounded-3xl glass shadow-soft hover:shadow-glow transition-all flex gap-5"
          >
            <div className={`size-12 rounded-2xl ${n.c} flex items-center justify-center shrink-0 shadow-soft`}>
              <n.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-lg">{n.title}</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
