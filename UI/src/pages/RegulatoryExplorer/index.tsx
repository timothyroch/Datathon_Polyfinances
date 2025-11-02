// src/pages/RegulatoryExplorer/index.tsx
import * as React from "react";
import {
  Search,
  Filter,
  Globe2,
  Files,
  Link2,
  CalendarDays,
  ChevronRight,
  BadgeCheck,
  Braces,
  BookOpen,
  Send,
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
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

/* ------------------------------ mocks --------------------------------- */
type Doc = {
  id: string;
  title: string;
  jurisdiction: "EU" | "US" | "CN" | "JP" | "CA";
  type: "regulation" | "law" | "bill" | "directive";
  published: string; // ISO
  effective?: string; // ISO
  url?: string;
  entities: string[];
  measures: string[];
  sectors: string[];
  summary: string;
};
const DOCS: Doc[] = [
  {
    id: "EU_2024_1689",
    title: "REGULATION (EU) 2024/1689 — Sustainable Industry Measures",
    jurisdiction: "EU",
    type: "regulation",
    published: "2024-06-12",
    effective: "2025-01-01",
    url: "#",
    entities: ["Siemens", "ASML", "Airbus"],
    measures: ["Reporting GES", "Subventions CAPEX vert"],
    sectors: ["Industrial", "Tech", "Utilities"],
    summary: "Cadre EU visant à accélérer l'industrie bas-carbone avec reporting renforcé.",
  },
  {
    id: "H.R.5376",
    title: "H.R.5376 — Inflation Reduction Act of 2022",
    jurisdiction: "US",
    type: "law",
    published: "2022-08-16",
    effective: "2023-01-01",
    url: "#",
    entities: ["Tesla", "NextEra", "Ormat"],
    measures: ["Tax credits", "Supply chain incentives"],
    sectors: ["Utilities", "Auto", "Energy"],
    summary: "Crédits d'impôts massifs et incitations à la fabrication locale.",
  },
  {
    id: "CN_ENERGY",
    title: "中华人民共和国能源法 — Energy Law (CN)",
    jurisdiction: "CN",
    type: "law",
    published: "2024-11-30",
    url: "#",
    entities: ["Sinopec", "CATL", "Foxconn"],
    measures: ["Quota export", "Contrôles transfert tech"],
    sectors: ["Energy", "Industrial", "Tech"],
    summary: "Révision du cadre énergétique, avec contrôle export et priorité sécurité d'approvisionnement.",
  },
  {
    id: "JP_AI",
    title: "人工知能関連技術の… — AI Promotion Law (JP)",
    jurisdiction: "JP",
    type: "law",
    published: "2023-05-24",
    url: "#",
    entities: ["Toyota", "Sony", "NTT"],
    measures: ["Normes IA", "Interopérabilité données"],
    sectors: ["Auto", "Tech", "Health"],
    summary: "Promotion de l'innovation IA et standards d’interopérabilité.",
  },
];

/* ------------------------------- page ---------------------------------- */
export default function RegulatoryExplorer() {
  const [q, setQ] = React.useState("");
  const [jur, setJur] = React.useState<Doc["jurisdiction"] | "ALL">("ALL");
  const [sel, setSel] = React.useState<Doc | null>(DOCS[0]);

  const filtered = DOCS.filter(d =>
    (jur === "ALL" || d.jurisdiction === jur) &&
    (
      d.title.toLowerCase().includes(q.toLowerCase()) ||
      d.entities.join(" ").toLowerCase().includes(q.toLowerCase()) ||
      d.measures.join(" ").toLowerCase().includes(q.toLowerCase())
    )
  );

  React.useEffect(()=>{ if (filtered.length && (!sel || !filtered.includes(sel))) setSel(filtered[0]); }, [q, jur]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Topbar */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Regulatory Explorer</h1>

          <div className="ml-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par titre, entité, mesure…"
              className="w-80 bg-transparent outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className={`rounded-xl border px-3 py-2 text-sm ${jur==="ALL" ? "border-indigo-600 bg-indigo-600 text-white":"border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"}`} onClick={()=>setJur("ALL")}>All</button>
            {(["EU","US","CN","JP","CA"] as const).map(j => (
              <button key={j}
                className={`rounded-xl border px-3 py-2 text-sm ${jur===j ? "border-indigo-600 bg-indigo-600 text-white":"border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"}`}
                onClick={()=>setJur(j)}
              >
                {j}
              </button>
            ))}
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <Filter className="h-4 w-4" /> Filtres
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        {/* Liste documents */}
        <div className="space-y-3">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Files className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Documents</h2>
              </div>
              <span className="text-sm text-zinc-500">{filtered.length} items</span>
            </div>

            <ul className="space-y-2">
              {filtered.map(d => {
                const active = sel?.id === d.id;
                return (
                  <li key={d.id}>
                    <button
                      onClick={()=>setSel(d)}
                      className={`w-full rounded-xl border p-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                        active ? "border-indigo-600 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Globe2 className="mt-0.5 h-4 w-4 text-zinc-400" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{d.title}</p>
                            <Badge tone="indigo">{d.jurisdiction}</Badge>
                            <Badge tone="zinc">{d.type}</Badge>
                          </div>
                          <p className="truncate text-xs text-zinc-500 flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Pub: {d.published} {d.effective ? `• Eff: ${d.effective}` : ""}
                          </p>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Détails & extrait */}
        <div className="space-y-6 lg:col-span-2">
          {sel && (
            <>
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{sel.title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge tone="indigo">{sel.jurisdiction}</Badge>
                    <Badge tone="zinc">{sel.type}</Badge>
                    <a href={sel.url || "#"} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                      <Link2 className="h-3.5 w-3.5" /> Source
                    </a>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Publié" value={sel.published} />
                  <Field label="Effectif" value={sel.effective ?? "-"} />
                  <Field label="Résumé" value={<span className="text-sm">{sel.summary}</span>} />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
                    <p className="mb-2 text-xs font-semibold text-zinc-500">Entités</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {sel.entities.map(e => <Badge key={e} tone="zinc">{e}</Badge>)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
                    <p className="mb-2 text-xs font-semibold text-zinc-500">Mesures</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {sel.measures.map(e => <Badge key={e} tone="amber">{e}</Badge>)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
                    <p className="mb-2 text-xs font-semibold text-zinc-500">Secteurs</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {sel.sectors.map(e => <Badge key={e} tone="green">{e}</Badge>)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold">Extrait analysé</h3>
                  </div>
                  <Badge tone="zinc"><BadgeCheck className="mr-1 inline h-3.5 w-3.5" />Citée</Badge>
                </div>
                <blockquote className="rounded-xl border border-zinc-200/70 bg-zinc-50 p-4 text-sm italic dark:border-zinc-800 dark:bg-zinc-900/60">
                  « … reporting des émissions GES pour les sites de production au-delà de 50 ktCO₂e/an, avec contrôle et publication annuelle… »
                </blockquote>
                <p className="mt-3 text-xs text-zinc-500">Ancrage: Art. 12, §3 — page 47</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                    <Send className="h-4 w-4" /> Envoyer vers Scenario
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                    <Braces className="h-4 w-4" /> JSON d’extraction
                  </button>
                </div>
              </Card>

              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Mapping portefeuille (démo)</h3>
                  <span className="text-sm text-zinc-500">Exposés: 12 tickers</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-zinc-200 dark:border-zinc-800">
                      <tr className="text-zinc-600 dark:text-zinc-300">
                        <th className="px-3 py-2 text-left text-xs font-medium">Ticker</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Entreprise</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Secteur</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Type d’impact</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Score (0-100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {[
                        { t:"ASML", n:"ASML Holding", s:"Tech", i:"Reporting / Capex", c:78 },
                        { t:"ORA", n:"Ormat", s:"Utilities", i:"Subventions CAPEX", c:66 },
                        { t:"AIR", n:"Airbus", s:"Industrial", i:"Scope 1/2 GES", c:59 },
                      ].map(r => (
                        <tr key={r.t} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                          <td className="px-3 py-2">{r.t}</td>
                          <td className="px-3 py-2">{r.n}</td>
                          <td className="px-3 py-2">{r.s}</td>
                          <td className="px-3 py-2">{r.i}</td>
                          <td className="px-3 py-2">{r.c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
