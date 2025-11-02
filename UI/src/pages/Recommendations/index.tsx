// src/pages/Recommendations/index.tsx
import * as React from "react";
import {
  Lightbulb,
  Download,
  FileText,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*                               UI Mini                              */
/* ------------------------------------------------------------------ */
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
    <button onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm transition ${
        active ? "border-indigo-600 bg-indigo-600 text-white"
               : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"}`}>
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
function MiniBar({ value, max = 100, tone = "indigo" }: { value: number; max?: number; tone?: "indigo"|"emerald"|"red" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const col = tone === "indigo" ? "bg-indigo-500" : tone === "emerald" ? "bg-emerald-500" : "bg-red-500";
  return (
    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div className={`h-2 rounded-full ${col}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                               Mock data                             */
/* ------------------------------------------------------------------ */
type Action = {
  id: string;
  type: "realloc" | "rotation" | "replace";
  title: string;
  details: string;
  expectedAlphaBps: number; // bps
  riskDelta: number;        // %
  confidence: number;       // 0..100
  cites: string[];          // ids/urls
};
type Candidate = { ticker: string; name: string; sector: string; region: string; score: number; rationale: string };
const ACTIONS_BASE: Action[] = [
  {
    id: "A1",
    type: "realloc",
    title: "Sous-pondérer Semiconductors US de −0.7%",
    details: "Sensibilité accrue aux sanctions export · pression sur chaîne d’approvisionnement.",
    expectedAlphaBps: 24,
    riskDelta: -0.3,
    confidence: 78,
    cites: ["UE_2024_1689", "H.R.5376", "10K:NVDA:Supply"],
  },
  {
    id: "A2",
    type: "rotation",
    title: "Sur-pondérer Utilities EU de +0.4%",
    details: "Capex subventionné, visibilité cash-flows, pricing régulé.",
    expectedAlphaBps: 15,
    riskDelta: -0.2,
    confidence: 71,
    cites: ["UE_Green_Deal", "EU_Taxonomy"],
  },
  {
    id: "A3",
    type: "replace",
    title: "Remplacer XOM par ORA (US Utilities Renewables) à poids neutre",
    details: "Réduction risque fiscalité carbone · exposition transition énergétique.",
    expectedAlphaBps: 9,
    riskDelta: -0.1,
    confidence: 66,
    cites: ["EPA_CarbonPlan", "10K:ORA:RiskFactors"],
  },
];
const SHORTLIST: Candidate[] = [
  { ticker: "ORA", name: "Ormat Technologies", sector: "Utilities", region: "US", score: 82, rationale: "Flux régulés, faible intensité carbone." },
  { ticker: "VIV", name: "Vivendi (alt.)", sector: "Communication", region: "EU", score: 73, rationale: "Moins exposé sanctions tech." },
  { ticker: "FAN", name: "First Trust Global Wind", sector: "Utilities", region: "EU", score: 68, rationale: "Panier éolien, bêta limité." },
  { ticker: "TM",  name: "Toyota", sector: "Auto", region: "JP", score: 64, rationale: "Diversification supply chain Asie." },
];

/* heatmap mock : lignes = secteurs, colonnes = régions */
const SECTORS = ["Tech","Health","Financials","Energy","Consumer","Industrial","Utilities"] as const;
const REGIONS  = ["US","EU","CN","JP","IN","CA","BR"] as const;
const HEAT: Record<string, number> = {};
for (const s of SECTORS) for (const r of REGIONS) {
  const base = Math.random()*100;
  // pénaliser Tech/CN, favoriser Utilities/EU pour illustrer
  const adj = (s==="Tech" && r==="CN") ? -20 : (s==="Utilities" && r==="EU") ? +15 : 0;
  HEAT[`${s}_${r}`] = Math.max(0, Math.min(100, Math.round(base + adj)));
}

/* ------------------------------------------------------------------ */
/*                                Page                                 */
/* ------------------------------------------------------------------ */
export default function Recommendations() {
  const [profile, setProfile] = React.useState<"balanced"|"defensive"|"aggressive">("balanced");
  const [whatIf, setWhatIf] = React.useState({ sanctionShock: true, energySubsidy: true, aiExportControls: false });
  const [actions, setActions] = React.useState<Action[]>(ACTIONS_BASE);

  // recompute demo (sans backend) : on ajuste confident/alpha avec les toggles
  React.useEffect(() => {
    const kSanction = whatIf.sanctionShock ? 1.0 : 0.85;
    const kSubsidy  = whatIf.energySubsidy ? 1.1 : 0.95;
    const kAI       = whatIf.aiExportControls ? 1.05 : 1.0;
    const kProfile  = profile === "defensive" ? 0.9 : profile === "aggressive" ? 1.1 : 1.0;

    setActions(ACTIONS_BASE.map(a => ({
      ...a,
      expectedAlphaBps: Math.round(a.expectedAlphaBps * kSanction * kSubsidy * kAI),
      confidence: Math.max(40, Math.min(95, Math.round(a.confidence * kProfile))),
      riskDelta: Number((a.riskDelta * (profile==="defensive" ? 1.2 : 1.0)).toFixed(2)),
    })));
  }, [whatIf, profile]);

  const expAlphaBps = actions.reduce((acc, a) => acc + a.expectedAlphaBps, 0);
  const riskDelta   = actions.reduce((acc, a) => acc + a.riskDelta, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Topbar */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Recommendations</h1>
          <div className="ml-auto flex items-center gap-2">
            <Pill active={profile==="defensive"} onClick={()=>setProfile("defensive")}>Defensive</Pill>
            <Pill active={profile==="balanced"} onClick={()=>setProfile("balanced")}>Balanced</Pill>
            <Pill active={profile==="aggressive"} onClick={()=>setProfile("aggressive")}>Aggressive</Pill>
            <button className="ml-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <FileText className="h-4 w-4" /> PDF memo
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        {/* Colonne gauche */}
        <div className="space-y-6 lg:col-span-2">
          {/* Synthèse stratégique */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Synthèse stratégique</h2>
              </div>
              <Badge tone="indigo">{profile}</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Alpha attendu (bps)" value={<span className="text-emerald-600">{expAlphaBps}</span>} />
              <Field label="Δ Risque (volatilité, %)" value={<span className={riskDelta<0 ? "text-emerald-600":"text-red-600"}>{riskDelta.toFixed(2)}%</span>} />
              <Field label="Contraintes" value={<span>Tracking error ≤ 4%, Turnover ≤ 15%</span>} />
            </div>
          </Card>

          {/* Actions recommandées */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Actions recommandées</h2>
              <span className="text-sm text-zinc-500">{actions.length} propositions</span>
            </div>
            <ul className="space-y-3">
              {actions.map(a => (
                <li key={a.id} className="rounded-xl border border-zinc-200/70 p-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {a.type==="realloc" && <ArrowRightLeft className="h-5 w-5 text-indigo-500" />}
                      {a.type==="rotation" && <ArrowUpRight className="h-5 w-5 text-emerald-500" />}
                      {a.type==="replace" && <ArrowDownRight className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{a.title}</p>
                        <Badge tone="indigo">{a.type}</Badge>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{a.details}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-zinc-500">Alpha (bps)</p>
                          <MiniBar value={a.expectedAlphaBps} max={40} tone="emerald" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Δ Risque (%)</p>
                          <MiniBar value={Math.abs(a.riskDelta)} max={1} tone={a.riskDelta<0 ? "emerald":"red"} />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Confiance</p>
                          <MiniBar value={a.confidence} max={100} />
                        </div>
                      </div>
                      {/* Citations / sources */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <Shield className="h-4 w-4" />
                        Sources:
                        {a.cites.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-0.5 dark:border-zinc-800">
                            {c}
                            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Heatmap Secteur × Région */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Exposition cible — Secteur × Région</h2>
              <span className="text-sm text-zinc-500">Score de priorité (0–100)</span>
            </div>
            <Heatmap sectors={SECTORS as unknown as string[]} regions={REGIONS as unknown as string[]} data={HEAT} />
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* What-if */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">What-if / Hypothèses</h2>
              <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                onClick={()=>window.location.reload()}>
                <RefreshCw className="h-4 w-4" /> Reset
              </button>
            </div>
            <Toggle
              label="Choc sanctions (export high-tech)"
              checked={whatIf.sanctionShock}
              onChange={(v)=>setWhatIf(s=>({...s, sanctionShock:v}))}
            />
            <Toggle
              label="Subventions CAPEX énergie (UE)"
              checked={whatIf.energySubsidy}
              onChange={(v)=>setWhatIf(s=>({...s, energySubsidy:v}))}
            />
            <Toggle
              label="Contrôles export IA (modèles & GPU)"
              checked={whatIf.aiExportControls}
              onChange={(v)=>setWhatIf(s=>({...s, aiExportControls:v}))}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Alpha total (bps)" value={<span className="text-emerald-600">{expAlphaBps}</span>} />
              <Field label="Δ Risque (%)" value={<span className={riskDelta<0 ? "text-emerald-600":"text-red-600"}>{riskDelta.toFixed(2)}%</span>} />
            </div>
          </Card>

          {/* Shortlist de remplacements */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shortlist de remplacements</h2>
              <Badge tone="zinc">{SHORTLIST.length} candidats</Badge>
            </div>
            <ul className="space-y-3">
              {SHORTLIST.map(c => (
                <li key={c.ticker} className="rounded-xl border border-zinc-200/70 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{c.ticker} — {c.name}</p>
                      <p className="text-xs text-zinc-500">{c.sector} • {c.region}</p>
                    </div>
                    <div className="ml-auto w-28">
                      <p className="text-xs text-zinc-500 text-right">Score</p>
                      <MiniBar value={c.score} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{c.rationale}</p>
                </li>
              ))}
            </ul>
          </Card>

          {/* Conformité / validation rapide */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold">Validation & conformité</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Citations fournies pour chaque action
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Tracking error ≤ 4% estimé
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Vérifier la liquidité pour FAN (ETF international)
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                               Widgets                               */
/* ------------------------------------------------------------------ */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v:boolean)=>void }) {
  return (
    <label className="mb-2 flex items-center justify-between rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
      <span>{label}</span>
      <button
        onClick={()=>onChange(!checked)}
        className={`h-6 w-11 rounded-full border transition ${checked ? "bg-indigo-600 border-indigo-600": "bg-zinc-200 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700"}`}
        aria-pressed={checked}
      >
        <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition ${checked ? "translate-x-5": ""}`} />
      </button>
    </label>
  );
}

function Heatmap({ sectors, regions, data }: { sectors: string[]; regions: string[]; data: Record<string, number> }) {
  const cell = (s: string, r: string) => data[`${s}_${r}`] ?? 0;
  const color = (v: number) => {
    if (v >= 75) return "bg-red-500";
    if (v >= 55) return "bg-orange-400";
    if (v >= 35) return "bg-amber-300";
    if (v >= 20) return "bg-emerald-300";
    return "bg-emerald-200";
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Secteur \ Région</th>
            {regions.map(r => (
              <th key={r} className="px-2 py-2 text-center text-xs font-medium text-zinc-500">{r}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sectors.map(s => (
            <tr key={s}>
              <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{s}</td>
              {regions.map(r => {
                const v = cell(s, r);
                return (
                  <td key={r} className="px-1 py-1">
                    <div className={`h-8 w-full rounded ${color(v)} grid place-items-center`}>
                      <span className="text-xs font-medium text-zinc-900">{v}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
