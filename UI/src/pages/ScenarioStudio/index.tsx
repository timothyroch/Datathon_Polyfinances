// src/pages/ScenarioStudio/index.tsx
import * as React from "react";
import {
  Sparkles,
  Rocket,
  RefreshCcw,
  SlidersHorizontal,
  Gauge,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Braces,
} from "lucide-react";

/* ----------------------------- UI helpers ----------------------------- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {children}
    </section>
  );
}
function Badge({ children, tone = "zinc" }: { children: React.ReactNode; tone?: "zinc"|"green"|"red"|"amber"|"indigo" }) {
  const m = {
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${m[tone]}`}>{children}</span>;
}
function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm transition ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

/* ------------------------------- mocks -------------------------------- */
type Knob = { key: string; label: string; value: number; min: number; max: number; step?: number; help?: string };
const DEFAULT_KNOBS: Knob[] = [
  { key: "sanction_semi", label: "Sanctions semi-conducteurs (US→CN) %", value: 10, min: 0, max: 100, step: 5, help: "Tarif moyen appliqué à l’export" },
  { key: "cbam_eu", label: "CBAM EU (€/tCO₂, équiv.)", value: 45, min: 0, max: 150, step: 5, help: "Signal carbone sur import matières" },
  { key: "subsidy_energy_eu", label: "Subventions CAPEX énergie (EU) %", value: 20, min: 0, max: 60, step: 5 },
  { key: "ai_export_controls", label: "Contrôles export IA/GPU (US) niv.", value: 2, min: 0, max: 3, step: 1, help: "0=aucun, 3=très strict" },
];

type Result = { alpha_bps: number; risk_delta: number; te: number; winners: string[]; losers: string[]; note: string };
function simulate(knobs: Knob[], seed: number): Result {
  // Démo : calcule un résultat pseudo en fonction des knobs
  const k = Object.fromEntries(knobs.map(k => [k.key, k.value])) as any;
  const alpha = Math.round((k.subsidy_energy_eu*0.8 - k.sanction_semi*0.6 + (k.cbam_eu*0.3)) / 2);
  const risk = Number(((k.sanction_semi*0.01) - (k.subsidy_energy_eu*0.006)).toFixed(2));
  const te   = Number((1.8 + (k.ai_export_controls*0.4) + k.cbam_eu*0.005).toFixed(2));
  const winners = ["Utilities EU", "Auto JP", "Industrial EU"].slice(0, 2 + (seed % 2));
  const losers  = ["Semiconductors US", "Energy CA", "Consumer CN"].slice(0, 2 + ((seed+1) % 2));
  return { alpha_bps: alpha, risk_delta: risk, te, winners, losers, note: "Démo – brancher au backend scoring." };
}

/* --------------------------------- page -------------------------------- */
export default function ScenarioStudio() {
  const [profile, setProfile] = React.useState<"defensive"|"balanced"|"aggressive">("balanced");
  const [name, setName] = React.useState("Sanctions + Subventions énergie (EU)");
  const [knobs, setKnobs] = React.useState<Knob[]>(DEFAULT_KNOBS);
  const [constraints, setConstraints] = React.useState({ maxTurnover: 15, maxTE: 4 });
  const [draftNote, setDraftNote] = React.useState("Assumer montée progressive CBAM sur 12-18 mois.");
  const [docFiles, setDocFiles] = React.useState<string[]>(["UE_2024_1689.html", "H.R.5376.xml"]);
  const [result, setResult] = React.useState<Result>(() => simulate(DEFAULT_KNOBS, 1));

  function setVal(key: string, v: number) {
    setKnobs(prev => prev.map(k => k.key === key ? { ...k, value: v } : k));
  }
  function run() {
    // Ici: appeler votre API /scenarios/run avec {name, profile, knobs, constraints, docs}
    setResult(simulate(knobs, Math.floor(Math.random()*1000)));
  }
  function reset() {
    setKnobs(DEFAULT_KNOBS);
    setConstraints({ maxTurnover: 15, maxTE: 4 });
    setDraftNote("Assumer montée progressive CBAM sur 12-18 mois.");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Topbar */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Scenario Studio</h1>
          <div className="ml-auto flex items-center gap-2">
            <Pill active={profile==="defensive"} onClick={()=>setProfile("defensive")}>Defensive</Pill>
            <Pill active={profile==="balanced"} onClick={()=>setProfile("balanced")}>Balanced</Pill>
            <Pill active={profile==="aggressive"} onClick={()=>setProfile("aggressive")}>Aggressive</Pill>
            <button onClick={reset} className="ml-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <RefreshCcw className="h-4 w-4" /> Reset
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <Save className="h-4 w-4" /> Save draft
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        {/* Colonne gauche: builder */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Paramètres</h2>
              </div>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-[360px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {knobs.map(k => (
                <div key={k.key} className="rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{k.label}</p>
                      {k.help && <p className="text-xs text-zinc-500">{k.help}</p>}
                    </div>
                    <Badge tone="indigo">{k.value}</Badge>
                  </div>
                  <input
                    type="range" min={k.min} max={k.max} step={k.step ?? 1} value={k.value}
                    onChange={(e)=>setVal(k.key, Number(e.target.value))}
                    className="mt-3 w-full"
                  />
                </div>
              ))}
            </div>

            {/* Contraintes */}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Field label="Max turnover (%)" value={
                <input type="number" value={constraints.maxTurnover} onChange={(e)=>setConstraints(s=>({...s, maxTurnover:Number(e.target.value)}))}
                       className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900" />
              }/>
              <Field label="Max Tracking Error" value={
                <input type="number" value={constraints.maxTE} onChange={(e)=>setConstraints(s=>({...s, maxTE:Number(e.target.value)}))}
                       className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900" />
              }/>
              <Field label="Note" value={
                <input value={draftNote} onChange={(e)=>setDraftNote(e.target.value)}
                       className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900" />
              }/>
            </div>

            {/* Docs liés au scénario */}
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Documents réglementaires (liés)</p>
              <div className="flex flex-wrap items-center gap-2">
                {docFiles.map(f => (
                  <span key={f} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <Braces className="h-3.5 w-3.5 opacity-60" /> {f}
                    <button onClick={()=>setDocFiles(ds=>ds.filter(x=>x!==f))} className="opacity-70 hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <button className="inline-flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  <Upload className="h-3.5 w-3.5" /> Ajouter…
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button onClick={run} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                <Rocket className="h-4 w-4" /> Run scenario
              </button>
              <span className="text-xs text-zinc-500">Les calculs utilisent vos caches (sp500.csv, stocks-performance.csv)</span>
            </div>
          </Card>

          {/* Résultats */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Résultats (simulés)</h2>
              </div>
              <Badge tone={result.alpha_bps >= 0 ? "green" : "red"}>
                Alpha: {result.alpha_bps} bps
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Δ Risque (vol., %)" value={<span className={result.risk_delta<0?"text-emerald-600":"text-red-600"}>{result.risk_delta}%</span>} />
              <Field label="Tracking error (est.)" value={result.te} />
              <Field label="Note" value={result.note} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
                <p className="mb-2 text-xs font-semibold text-zinc-500">Winners (priorités)</p>
                <ul className="space-y-2">
                  {result.winners.map(w => (
                    <li key={w} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
                <p className="mb-2 text-xs font-semibold text-zinc-500">Losers (à sous-pondérer)</p>
                <ul className="space-y-2">
                  {result.losers.map(l => (
                    <li key={l} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <ArrowRight className="h-4 w-4" /> Envoyer vers Recommendations
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <Sparkles className="h-4 w-4" /> Générer memo
              </button>
            </div>
          </Card>
        </div>

        {/* Colonne droite: prompt & assertions */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Assumptions / Assertions</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Les dates d’application sont respectées</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Citations obligatoires activées</li>
              <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Couverture partielle des fournisseurs CN</li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Prompt LLM (contrôlé)</h2>
            <textarea
              defaultValue={`Analyser l'impact conjoint des paramètres {sanction_semi, cbam_eu, subsidy_energy_eu, ai_export_controls} sur {S&P500}, renvoyer {alpha_bps, risk_delta, te, winners, losers} avec explications et citations.`}
              className="h-48 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-2 text-xs text-zinc-500">
              (Conseil concours) Gardez un prompt court, structuré, avec **schéma JSON** attendu et **citations**.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
