import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { AppShell } from "@/components/skin-beauty/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyseApi, utilisateurApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Analyse cutanée — SkinBeauty" },
      { name: "description", content: "Historique des analyses de peau et évolution du score." },
    ],
  }),
  component: Analysis,
});

function Analysis() {
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [newAnalyse, setNewAnalyse] = useState({
    score: 70,
    ageReel: 30,
    agePeau: 32,
  });
  const queryClient = useQueryClient();

  const { data: utilisateurs = [] } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: utilisateurApi.getAll,
    retry: 1,
  });

  const { data: analyses = [], isLoading, isError, error } = useQuery({
    queryKey: ["analyses", selectedUserId],
    queryFn: () => analyseApi.getByUtilisateur(selectedUserId),
    enabled: !!selectedUserId,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      analyseApi.create({
        utilisateur: { id: selectedUserId },
        score: newAnalyse.score,
        ageReel: newAnalyse.ageReel,
        agePeau: newAnalyse.agePeau,
        dateAnalyse: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses", selectedUserId] });
      toast.success("Analyse créée ✨ — La routine sera générée automatiquement !");
    },
    onError: (err: Error) => toast.error(`Erreur : ${err.message}`),
  });

  // Données pour le graphique
  const chartData = [...analyses]
    .reverse()
    .slice(-7)
    .map((a, i) => ({
      day: `J${i + 1}`,
      score: a.score,
      agePeau: a.agePeau,
      ageReel: a.ageReel,
    }));

  const latestScore = analyses[0]?.score ?? 0;

  return (
    <AppShell>
      <header className="mb-12">
        <p className="text-[10px] font-mono tracking-[0.3em] text-rose uppercase">Analyses cutanées</p>
        <h1 className="text-4xl md:text-5xl font-serif italic mt-2">Évolution de votre peau</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Chaque analyse déclenche automatiquement la génération de votre routine personnalisée.
        </p>
      </header>

      {/* Sélecteur utilisateur */}
      {utilisateurs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
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
              {u.prenom} (Type {u.typePeau})
            </button>
          ))}
        </div>
      )}

      {/* Formulaire nouvelle analyse */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl glass border border-border mb-8"
      >
        <h2 className="text-lg font-serif mb-4">Nouvelle analyse</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Score de peau (0-100)", key: "score", min: 0, max: 100 },
            { label: "Âge réel", key: "ageReel", min: 1, max: 120 },
            { label: "Âge estimé de la peau", key: "agePeau", min: 1, max: 120 },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                {field.label}
              </label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={newAnalyse[field.key as keyof typeof newAnalyse]}
                onChange={(e) =>
                  setNewAnalyse((prev) => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <PlusCircle className="size-3" />
          )}
          Soumettre l'analyse
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          → Publie automatiquement sur <code className="bg-foreground/10 px-1 rounded">analyse_terminee_queue</code> pour générer la routine AM/PM.
        </p>
      </motion.div>

      {/* Erreur */}
      {isError && (
        <div className="p-5 rounded-2xl border border-amber-400/30 bg-amber-50/30 mb-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="size-4" />
            <span className="text-sm font-medium">profil-ms indisponible</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{(error as Error)?.message}</p>
        </div>
      )}

      {/* Graphique */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[32px] glass shadow-soft mb-8">
          <div className="flex flex-wrap gap-6 mb-6">
            {[
              { l: "Score de peau", c: "oklch(0.83 0.14 5)" },
              { l: "Âge de la peau", c: "oklch(0.85 0.09 300)" },
              { l: "Âge réel", c: "oklch(0.88 0.08 230)" },
            ].map((k) => (
              <div key={k.l} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: k.c }} />
                <span className="text-xs font-medium tracking-wide">{k.l}</span>
              </div>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.22 0.05 350 / 0.08)" />
                <XAxis dataKey="day" stroke="oklch(0.55 0.04 340)" fontSize={12} />
                <YAxis stroke="oklch(0.55 0.04 340)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid oklch(0.22 0.05 350 / 0.1)", background: "oklch(1 0 0 / 0.9)", backdropFilter: "blur(10px)" }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.83 0.14 5)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.83 0.14 5)" }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="agePeau" stroke="oklch(0.85 0.09 300)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.85 0.09 300)" }} />
                <Line type="monotone" dataKey="ageReel" stroke="oklch(0.88 0.08 230)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.88 0.08 230)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement des analyses...
        </div>
      )}

      {/* Stats */}
      <h2 className="text-2xl font-serif italic mt-8 mb-6">Résultats</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { t: "Score actuel", v: latestScore > 0 ? `${latestScore}/100` : "—", d: latestScore > 70 ? "Excellente santé cutanée." : latestScore > 40 ? "Des améliorations sont en cours." : "Routine de soin intensive recommandée.", c: "from-rose/30 to-peach/30" },
          { t: "Analyses enregistrées", v: analyses.length.toString(), d: "Historique complet en base MySQL.", c: "from-lavender/30 to-rose/20" },
          { t: "Dernière analyse", v: analyses[0]?.dateAnalyse ?? "—", d: "La prochaine analyse mettra à jour votre routine.", c: "from-skyaura/30 to-mint/30" },
        ].map((c, i) => (
          <motion.div
            key={c.t}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-8 rounded-3xl bg-gradient-to-br ${c.c} border border-border shadow-soft`}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/60">{c.t}</p>
            <p className="text-4xl font-serif italic text-foreground mt-2">{c.v}</p>
            <p className="text-sm text-foreground/70 mt-3">{c.d}</p>
          </motion.div>
        ))}
      </div>

      {/* Barres de progression */}
      {analyses.length > 0 && (
        <>
          <h2 className="text-2xl font-serif italic mt-16 mb-6">Objectifs</h2>
          <div className="space-y-5">
            {[
              { l: "Score de peau", v: latestScore },
              { l: "Cohérence de suivi", v: Math.min(analyses.length * 25, 100) },
              { l: "Âge biologique vs réel", v: Math.max(0, 100 - ((analyses[0]?.agePeau ?? 0) - (analyses[0]?.ageReel ?? 0)) * 10) },
            ].map((b, i) => (
              <motion.div
                key={b.l}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl glass"
              >
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-sm font-medium">{b.l}</span>
                  <span className="text-xs font-mono tracking-wider text-rose">{Math.round(b.v)}%</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.v}%` }}
                    transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1], delay: 0.2 + i * 0.08 }}
                    className="h-full gradient-aura rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
