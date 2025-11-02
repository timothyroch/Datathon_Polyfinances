// src/pages/Audit/index.tsx
import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  Filter,
  Clock3,
  ShieldCheck,
  FileDown,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  ClipboardList,
  Settings2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*                          Helpers UI inline                          */
/* ------------------------------------------------------------------ */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 " +
        className
      }
    >
      {children}
    </section>
  );
}

function Badge({
  children,
  tone = "zinc",
}: {
  children: React.ReactNode;
  tone?: "zinc" | "green" | "red" | "amber" | "indigo";
}) {
  const map = {
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
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

/* ------------------------------------------------------------------ */
/*                              Mock data                              */
/* ------------------------------------------------------------------ */
type Run = {
  id: string;
  date: string; // ISO
  scenario: "base" | "sanctions" | "energy";
  documents: number;
  changes: number;
  status: "passed" | "warnings" | "failed";
  durationSec: number;
};

const RUNS: Run[] = [
  {
    id: "run_2025-11-01_10-05",
    date: "2025-11-01T10:05:00Z",
    scenario: "base",
    documents: 18,
    changes: 4,
    status: "warnings",
    durationSec: 46,
  },
  {
    id: "run_2025-10-31_22-14",
    date: "2025-10-31T22:14:00Z",
    scenario: "sanctions",
    documents: 12,
    changes: 2,
    status: "passed",
    durationSec: 39,
  },
  {
    id: "run_2025-10-31_18-02",
    date: "2025-10-31T18:02:00Z",
    scenario: "energy",
    documents: 9,
    changes: 5,
    status: "failed",
    durationSec: 57,
  },
];

type RuleResult = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  passed: boolean;
  details: string;
};

const RULES: RuleResult[] = [
  {
    id: "R-SEC-10K-LINK",
    title: "Références EDGAR valides dans le graphe (10-K / 10-Q liés)",
    severity: "medium",
    passed: true,
    details: "Tous les IDs CIK parsés mappent correctement vers les URL EDGAR.",
  },
  {
    id: "R-TRACE-PROMPT",
    title: "Traçabilité prompt → sortie (hash + horodatage)",
    severity: "high",
    passed: true,
    details: "Chaîne de hashage SHA-256 valide, non réutilisée entre runs.",
  },
  {
    id: "R-PII-SCRUB",
    title: "Nettoyage PII dans extraits de textes réglementaires",
    severity: "critical",
    passed: false,
    details:
      "Des numéros de téléphone non masqués trouvés dans 2 extraits (UE 2024/1689, China Energy Law).",
  },
  {
    id: "R-MODEL-CITATION",
    title: "Présence de citations/justifications pour chaque recommandation",
    severity: "medium",
    passed: false,
    details: "4 recommandations sans citation complète (manque ancre de paragraphe).",
  },
];

/* ------------------------------------------------------------------ */
/*                              Page Audit                             */
/* ------------------------------------------------------------------ */
export default function Audit() {
  const [q, setQ] = React.useState("");
  const [range, setRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const [selRun, setSelRun] = React.useState<Run>(RUNS[0]);
  const [compareRun, setCompareRun] = React.useState<Run | null>(RUNS[1] ?? null);
  const [tab, setTab] = React.useState<"rules" | "evidence" | "ingestion" | "changes">("rules");

  const filteredRuns = RUNS.filter(
    (r) => r.id.toLowerCase().includes(q.toLowerCase()) || r.scenario.includes(q as any)
  );

  const statusBadge = (s: Run["status"]) =>
    s === "passed" ? (
      <Badge tone="green" >Passed</Badge>
    ) : s === "warnings" ? (
      <Badge tone="amber">Warnings</Badge>
    ) : (
      <Badge tone="red">Failed</Badge>
    );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Audit & Conformité</h1>

          <div className="ml-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un run / scénario…"
              className="w-64 bg-transparent outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Pill active={range === "7d"} onClick={() => setRange("7d")}>
              7 jours
            </Pill>
            <Pill active={range === "30d"} onClick={() => setRange("30d")}>
              30 jours
            </Pill>
            <Pill active={range === "90d"} onClick={() => setRange("90d")}>
              90 jours
            </Pill>
            <button className="ml-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <Filter className="h-4 w-4" /> Filtres
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <FileDown className="h-4 w-4" /> Export JSON
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        {/* Timeline / Runs */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Timeline des exécutions</h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Clock3 className="h-4 w-4" />
                Fenêtre: {range}
              </div>
            </div>

            <ol className="space-y-3">
              {filteredRuns.map((r) => (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${
                    selRun.id === r.id
                      ? "border-indigo-600 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <button onClick={() => setSelRun(r)} className="flex flex-1 items-center gap-3 text-left">
                    {r.status === "passed" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : r.status === "warnings" ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{r.id}</p>
                        {statusBadge(r.status)}
                        <Badge tone="indigo">{r.scenario}</Badge>
                      </div>
                      <p className="truncate text-xs text-zinc-500">
                        {new Date(r.date).toLocaleString()} • {r.documents} documents • {r.durationSec}s
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setCompareRun(r)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition ${
                      compareRun?.id === r.id
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    }`}
                    title="Comparer"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    Diff
                  </button>
                </li>
              ))}
            </ol>
          </Card>

          {/* Onglets */}
          <div className="flex flex-wrap gap-2">
            <Pill active={tab === "rules"} onClick={() => setTab("rules")}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Règles & Conformité
            </Pill>
            <Pill active={tab === "evidence"} onClick={() => setTab("evidence")}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Evidence & Traces
            </Pill>
            <Pill active={tab === "ingestion"} onClick={() => setTab("ingestion")}>
              <Settings2 className="mr-2 h-4 w-4" />
              Journal d’ingestion
            </Pill>
            <Pill active={tab === "changes"} onClick={() => setTab("changes")}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Changements
            </Pill>
          </div>

          {/* Contenu onglets */}
          {tab === "rules" && <RulesPanel />}
          {tab === "evidence" && <EvidencePanel run={selRun} />}
          {tab === "ingestion" && <IngestionPanel />}
          {tab === "changes" && <ChangesPanel base={selRun} other={compareRun} />}
        </div>

        {/* Panneau latéral : Détails du run */}
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Détails du run</h2>
              {statusBadge(selRun.status)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ID" value={<span className="font-mono text-xs">{selRun.id}</span>} />
              <Field label="Date" value={new Date(selRun.date).toLocaleString()} />
              <Field label="Scénario" value={<Badge tone="indigo">{selRun.scenario}</Badge>} />
              <Field label="Durée" value={`${selRun.durationSec}s`} />
              <Field label="Documents analysés" value={selRun.documents} />
              <Field label="Changements détectés" value={selRun.changes} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <FileText className="h-4 w-4" />
                Rapport PDF
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold">Résumé conformité</h3>
            <ul className="space-y-2 text-sm">
              {RULES.map((r) => (
                <li key={r.id} className="flex items-start gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.title}</span>
                      <Severity s={r.severity} />
                    </div>
                    {!r.passed && (
                      <p className="text-xs text-zinc-500">
                        {r.details}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                         Panels (tab content)                        */
/* ------------------------------------------------------------------ */
function Severity({ s }: { s: "critical" | "high" | "medium" | "low" }) {
  const tone = s === "critical" ? "red" : s === "high" ? "amber" : s === "medium" ? "indigo" : "zinc";
  return <Badge tone={tone as any}>{s}</Badge>;
}

function RulesPanel() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Règles & Conformité</h2>
        <span className="text-sm text-zinc-500">{RULES.length} contrôles</span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {RULES.map((r) => (
          <details key={r.id} className="group py-3">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                {r.passed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.title}</span>
                    <Severity s={r.severity} />
                    <Badge tone="zinc">{r.id}</Badge>
                  </div>
                  {!r.passed && <p className="text-xs text-zinc-500">{r.details}</p>}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 rounded-xl border border-dashed border-zinc-300 p-3 text-sm dark:border-zinc-700">
              <p className="text-zinc-500">
                Logs & preuves techniques (fixtures, traces, payloads, snapshots…) – à brancher sur vos artefacts.
              </p>
              <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
{`{
  "rule": "${r.id}",
  "evidence": "s3://bucket/audit/${r.id}/...",
  "sample": { "ok": ${r.passed} }
}`}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </Card>
  );
}

function EvidencePanel({ run }: { run: { id: string } }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Evidence & Traces</h2>
        <Badge tone="zinc">{run.id}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Prompt (hashé)</h3>
          <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
            <p className="font-mono text-xs text-zinc-500">
              hash: 4a91c3…9b2f, ts: 2025-11-01T10:05:12Z, model: bedrock/anthropic.claude-3.7
            </p>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
{`"Analyse le document UE 2024/1689 et retourne: {entities, measures, dates, scope, sanctions, energy} ..."`}
            </pre>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Sortie modèle (extrait)</h3>
          <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
            <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
{`{
  "entities": ["TSMC", "Apple", "Foxconn"],
  "measures": ["tarif import 10%", "reporting GES"],
  "impact": { "AAPL": 0.12, "TSM": 0.08 },
  "explanations": "Chaîne d'approvisionnement semi-conducteurs exposée…"
}`}
            </pre>
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <h3 className="text-sm font-semibold">Fonctionnalités activées</h3>
          <div className="flex flex-wrap gap-2">
            <Badge tone="indigo">RAG</Badge>
            <Badge tone="indigo">Citation obligatoire</Badge>
            <Badge tone="indigo">JSON schema</Badge>
            <Badge tone="indigo">PII scrub</Badge>
            <Badge tone="indigo">Rate-limit</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function IngestionPanel() {
  const rows = [
    { id: "UE_2024_1689.html", status: "ok", bytes: 128_345, parser: "html→markdown" },
    { id: "H.R.5376.xml", status: "ok", bytes: 346_902, parser: "xml→markdown" },
    { id: "CN_energy.html", status: "warn", bytes: 92_114, parser: "html→markdown" },
    { id: "JP_ai.html", status: "fail", bytes: 0, parser: "html→markdown" },
  ] as const;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Journal d’ingestion</h2>
        <span className="text-sm text-zinc-500">{rows.length} éléments</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-200 dark:border-zinc-800">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-3 py-2 text-left text-xs font-medium">Fichier</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Parser</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Taille</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Statut</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="px-3 py-2 text-zinc-500">{r.parser}</td>
                <td className="px-3 py-2">{r.bytes ? (r.bytes / 1024).toFixed(1) + " KB" : "-"}</td>
                <td className="px-3 py-2">
                  {r.status === "ok" ? (
                    <Badge tone="green">OK</Badge>
                  ) : r.status === "warn" ? (
                    <Badge tone="amber">Avert.</Badge>
                  ) : (
                    <Badge tone="red">Échec</Badge>
                  )}
                </td>
                <td className="px-3 py-2">
                  <button className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
                    <Info className="h-4 w-4" />
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ChangesPanel({ base, other }: { base: { id: string }; other: { id: string } | null }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Changements (Diff)</h2>
        <div className="flex items-center gap-2 text-sm">
          <Badge tone="zinc">Base: {base.id}</Badge>
          {other ? <Badge tone="indigo">Comparé: {other.id}</Badge> : <span className="text-zinc-500">Sélectionne un run pour comparer</span>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
          <h3 className="mb-2 text-xs font-semibold text-zinc-500">Recommandations (avant)</h3>
          <ul className="space-y-2">
            <li className="rounded-lg bg-zinc-100 p-2 text-xs dark:bg-zinc-800">
              - Sous-pondérer semi-conducteurs US (sensibilité sanctions)
            </li>
            <li className="rounded-lg bg-zinc-100 p-2 text-xs dark:bg-zinc-800">
              - Surpondérer utilities EU (subventions CAPEX)
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
          <h3 className="mb-2 text-xs font-semibold text-zinc-500">Recommandations (après)</h3>
          <ul className="space-y-2">
            <li className="rounded-lg bg-emerald-100/60 p-2 text-xs dark:bg-emerald-900/20">
              + Inclure OEM Auto JP (déplacement supply-chain)
            </li>
            <li className="rounded-lg bg-red-100/60 p-2 text-xs dark:bg-red-900/20">
              × Retirer part pétrole CA (risque fiscalité carbone)
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border border-dashed border-zinc-300 p-3 text-sm dark:border-zinc-700">
            <p className="text-zinc-500">
              Place pour un vrai diff JSON/CSV des agrégats (scores, pondérations, seuils…)
            </p>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
{`{
  "risk_score_delta": { "CN": +3, "EU": -1, "US": 0 },
  "weights_delta": { "Energy": -0.7, "Utilities": +0.4, "Auto": +0.3 }
}`}
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
}
