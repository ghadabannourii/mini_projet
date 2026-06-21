import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Sparkles, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/skin-beauty/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { utilisateurApi, routineApi } from "@/lib/api";
import type { RoutineStep, Conflict } from "@/lib/api";

export const Route = createFileRoute("/routine")({
  head: () => ({
    meta: [
      { title: "Rituels AM/PM — SkinBeauty" },
      { name: "description", content: "Votre routine de soin personnalisée, générée par l'IA SkinBeauty." },
    ],
  }),
  component: Routine,
});

function Routine() {
  const [time, setTime] = useState<"AM" | "PM">("AM");
  const [open, setOpen] = useState<number | null>(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const queryClient = useQueryClient();

  // ── Données backend ──────────────────────────────────────────────────────
  const { data: utilisateurs = [] } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: utilisateurApi.getAll,
    retry: 1,
  });

  const {
    data: routine,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["routine", selectedUserId],
    queryFn: () => routineApi.getByUserId(selectedUserId),
    retry: 1,
  });

  const regenererMutation = useMutation({
    mutationFn: () => utilisateurApi.regenererRoutine(selectedUserId),
    onSuccess: (data) => {
      queryClient.setQueryData(["routine", selectedUserId], data);
      toast.success("Routine régénérée avec succès ✨");
    },
    onError: (err: Error) => {
      toast.error(`Erreur : ${err.message}`);
    },
  });

  const steps: RoutineStep[] = routine
    ? time === "AM"
      ? routine.amSteps
      : routine.pmSteps
    : [];

  const conflicts: Conflict[] = routine?.conflicts ?? [];

  const allDone = steps.length > 0 && steps.every((_, i) => done[i]);

  const toggleDone = (idx: number) => {
    const next = { ...done, [idx]: !done[idx] };
    setDone(next);
    if (steps.every((_, i) => next[i])) {
      setCelebrating(true);
      toast.success("Rituel complété ✨");
      setTimeout(() => setCelebrating(false), 3000);
    }
  };

  const categoryColor: Record<string, string> = {
    cleanser: "bg-skyaura/40",
    serum: "bg-rose/25",
    moisturizer: "bg-lavender/40",
    sunscreen: "bg-peach/40",
    treatment: "bg-mint/40",
    toner: "bg-accent/40",
  };

  const categoryEmoji: Record<string, string> = {
    cleanser: "💧",
    serum: "✨",
    moisturizer: "🌸",
    sunscreen: "☀️",
    treatment: "🔬",
    toner: "💦",
  };

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <p className="text-[10px] font-mono tracking-[0.3em] text-rose uppercase">Rituel SkinBeauty</p>
          <h1 className="text-4xl md:text-5xl font-serif italic mt-2">
            Routine {time === "AM" ? "du matin" : "du soir"}
          </h1>
          <p className="text-muted-foreground mt-2">Générée par le moteur IA à base de règles.</p>
        </div>

        <div className="flex flex-col gap-3 items-end">
          {/* Sélecteur AM/PM */}
          <div className="flex bg-white/70 dark:bg-white/5 p-1 rounded-full border border-border">
            {(["AM", "PM"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTime(t); setDone({}); setOpen(0); }}
                className={`relative px-6 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-colors ${
                  time === t ? "text-background" : "text-muted-foreground"
                }`}
              >
                {time === t && (
                  <motion.div
                    layoutId="time-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>

          {/* Bouton régénérer */}
          <button
            onClick={() => regenererMutation.mutate()}
            disabled={regenererMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            {regenererMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            Régénérer la routine
          </button>
        </div>
      </header>

      {/* Sélecteur utilisateur */}
      {utilisateurs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {utilisateurs.map((u) => (
            <button
              key={u.id}
              onClick={() => { setSelectedUserId(u.id); setDone({}); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedUserId === u.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {u.prenom} (Type {u.typePeau})
            </button>
          ))}
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="flex items-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Chargement de la routine depuis routine-ms...
        </div>
      )}

      {/* Erreur */}
      {isError && (
        <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-400/30 mb-6">
          <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
            <AlertTriangle className="size-4" />
            routine-ms indisponible
          </div>
          <p className="text-sm text-muted-foreground">{(error as Error)?.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Vérifiez que routine-ms est démarré sur localhost:3001. Créez une analyse pour déclencher la génération automatique.
          </p>
        </div>
      )}

      {/* Conflits détectés */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl border border-red-400/30 bg-red-50/30 dark:bg-red-950/20"
        >
          <div className="flex items-center gap-2 text-red-500 font-medium mb-3">
            <AlertTriangle className="size-4" />
            {conflicts.length} conflit(s) d'ingrédients détecté(s)
          </div>
          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 size-2 rounded-full flex-shrink-0 ${
                  c.severity === "high" ? "bg-red-500" : c.severity === "medium" ? "bg-amber-500" : "bg-yellow-400"
                }`} />
                <div>
                  <span className="font-medium">{c.ingredientA} + {c.ingredientB}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    c.severity === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                  }`}>{c.severity}</span>
                  <p className="text-muted-foreground">{c.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Étapes de la routine */}
      {steps.length > 0 && (
        <div className="space-y-4">
          {steps.map((step, i) => {
            const isOpen = open === i;
            const isDone = !!done[i];
            const emoji = categoryEmoji[step.category] ?? "🌿";
            const color = categoryColor[step.category] ?? "bg-accent/40";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-[28px] glass shadow-soft overflow-hidden hover:shadow-glow transition-all ${isDone ? "opacity-70" : ""}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className={`size-14 rounded-2xl ${color} flex items-center justify-center text-2xl shadow-soft`}>
                      {emoji}
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose">
                        Étape {step.order} · {step.category}
                      </p>
                      <h3 className="font-serif text-2xl">{step.productName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Actif : {step.activeIngredient}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleDone(i); }}
                    className={`size-10 rounded-full flex items-center justify-center transition-all ${
                      isDone ? "bg-primary text-primary-foreground shadow-glow" : "border border-primary/40 hover:bg-primary/10"
                    }`}
                    aria-label={isDone ? "Marquer incomplet" : "Marquer fait"}
                  >
                    {isDone && <Check className="size-4" />}
                  </button>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <div className="px-6 pb-6 pt-0 ml-[76px] text-sm text-muted-foreground leading-relaxed border-l border-border pl-6">
                        {step.notes || "Appliquer selon la routine habituelle."}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Célébration */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="relative p-12 rounded-[40px] gradient-aura shadow-glow text-center"
            >
              <Sparkles className="size-10 mx-auto text-foreground" />
              <h3 className="text-4xl font-serif italic mt-4">Rituel complété !</h3>
              <p className="text-sm text-foreground/70 mt-2">Votre peau vous remercie. ✨</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {allDone && !celebrating && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Bravo ! Revenez ce soir pour votre rituel PM. 🌙
        </p>
      )}
    </AppShell>
  );
}
