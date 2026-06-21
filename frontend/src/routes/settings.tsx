import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/skin-beauty/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { utilisateurApi } from "@/lib/api";
import { Save, Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — SkinBeauty" },
      { name: "description", content: "Gérez vos utilisateurs et préférences SkinBeauty." },
    ],
  }),
  component: Settings,
});

const fitzpatrickTypes = ["I", "II", "III", "IV", "V", "VI"] as const;
const skinTypes = ["Dry", "Combination", "Oily", "Sensitive", "Normal"] as const;
const goals = ["Hydration", "Brightening", "Anti-aging", "Acne care", "Even tone", "Glow"] as const;

function Settings() {
  const [name, setName] = useState("Elena Rose");
  const [skin, setSkin] = useState<(typeof skinTypes)[number]>("Combination");
  const [picked, setPicked] = useState<string[]>(["Hydration", "Glow"]);
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [selectedFitzpatrick, setSelectedFitzpatrick] = useState<string>("I");
  const queryClient = useQueryClient();

  const togglePick = (g: string) =>
    setPicked((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

  // ── Données backend ────────────────────────────────────────────────────────
  const { data: utilisateurs = [] } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: utilisateurApi.getAll,
    retry: 1,
  });

  // Initialiser la sélection avec le premier utilisateur
  const firstUser = utilisateurs[0];
  const effectiveFitzpatrick = selectedFitzpatrick || firstUser?.typePeau || "I";

  const updateTypePeauMutation = useMutation({
    mutationFn: () => utilisateurApi.updateTypePeau(selectedUserId || firstUser?.id || 1, effectiveFitzpatrick),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      toast.success(`Type de peau mis à jour → ${effectiveFitzpatrick} ✨ (message envoyé sur profil_maj_queue)`);
    },
    onError: (err: Error) => toast.error(`Erreur : ${err.message}`),
  });

  const save = () => toast.success("Vos préférences ont été sauvegardées 💖");

  const selectedUser = utilisateurs.find((u) => u.id === selectedUserId);

  return (
    <AppShell>
      <header className="mb-12">
        <p className="text-[10px] font-mono tracking-[0.3em] text-rose uppercase">Your aura</p>
        <h1 className="text-4xl md:text-5xl font-serif italic mt-2">Settings & preferences</h1>
        <p className="text-muted-foreground mt-2">Gently tune your ritual.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 p-8 rounded-[32px] glass shadow-soft space-y-6">
          <h2 className="font-serif text-2xl">Profil</h2>
          <Field label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">Skin type (interface)</p>
            <div className="flex flex-wrap gap-2">
              {skinTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSkin(t)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                    skin === t ? "bg-primary text-primary-foreground shadow-glow" : "bg-white/60 dark:bg-white/5 hover:bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">Objectifs beauté</p>
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => {
                const on = picked.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => togglePick(g)}
                    className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                      on ? "bg-foreground text-background" : "bg-white/60 dark:bg-white/5 hover:bg-white"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={save} className="mt-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-95 transition-all">
            Sauvegarder ✨
          </button>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-[32px] glass shadow-soft space-y-6">
          <h2 className="font-serif text-2xl">Thème</h2>
          <p className="text-sm text-muted-foreground">Basculez entre lumière douce et aura du soir. Utilisez la lune dans la navbar.</p>
          <div className="p-5 rounded-2xl gradient-aura animate-shimmer text-center">
            <p className="font-serif italic text-lg">"La beauté est une pratique quotidienne et silencieuse."</p>
          </div>
        </motion.section>
      </div>

      {/* Section backend : mise à jour du type Fitzpatrick */}
      {utilisateurs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-8 rounded-[32px] glass shadow-soft"
        >
          <h2 className="font-serif text-2xl mb-2">Mise à jour du type Fitzpatrick</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Met à jour le type de peau en base MySQL et publie automatiquement sur{" "}
            <code className="bg-foreground/10 px-1 rounded">profil_maj_queue</code> →
            routine-ms réajuste l'écran solaire (SPF50 vs SPF30).
          </p>

          {/* Sélecteur utilisateur */}
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">Utilisateur</p>
            <div className="flex flex-wrap gap-2">
              {utilisateurs.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setSelectedFitzpatrick(u.typePeau);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                    selectedUserId === u.id
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {u.prenom} {u.nom} — Type actuel : {u.typePeau}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur Fitzpatrick */}
          <div className="mb-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Nouveau type Fitzpatrick
            </p>
            <div className="flex gap-2 flex-wrap">
              {fitzpatrickTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedFitzpatrick(t)}
                  className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider border transition-all ${
                    selectedFitzpatrick === t
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  Type {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => updateTypePeauMutation.mutate()}
            disabled={updateTypePeauMutation.isPending || !selectedUser || selectedUser.typePeau === selectedFitzpatrick}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updateTypePeauMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Mettre à jour le type de peau
          </button>
        </motion.section>
      )}
    </AppShell>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-border focus:outline-none focus:border-rose focus:shadow-[0_0_0_4px_oklch(0.83_0.14_5/0.15)] transition-all"
      />
    </label>
  );
}
