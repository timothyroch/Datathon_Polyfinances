import { Bell, TrendingUp, TrendingDown, Search, Filter, ChevronRight, ShieldCheck, AlertTriangle, Globe2, FileSearch } from "lucide-react";

type Kpi = {
  label: string;
  value: string;
  delta: string;
  up?: boolean;
  spark: number[]; // petite série pour le mini sparkline
};

const KPIS: Kpi[] = [
  { label: "Risque global (S&P500)", value: "0.42", delta: "-0.04", up: true, spark: [38,42,41,40,39,37,42] },
  { label: "Titres à surveiller", value: "27", delta: "+5", up: false, spark: [12,13,15,18,20,22,27] },
  { label: "Docs analysés (7j)", value: "184", delta: "+32", up: true, spark: [88,96,110,120,136,158,184] },
  { label: "Alertes critiques", value: "7", delta: "+1", up: false, spark: [3,4,4,5,6,6,7] },
];

function Sparkline({ points }: { points: number[] }) {
  // normalise simple pour 100x26
  const max = Math.max(...points), min = Math.min(...points);
  const norm = (v: number) => 26 - ((v - min) / Math.max(1, max - min)) * 24;
  const path = points.map((p, i) => `${(i * (100 / (points.length - 1))).toFixed(2)},${norm(p).toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 26" className="w-full h-6">
      <polyline points={path} fill="none" className="stroke-indigo-500" strokeWidth="2" />
    </svg>
  );
}

function KpiCard({ k }: { k: Kpi }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{k.label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">{k.value}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${k.up ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
              {k.up ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {k.delta}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-800/50">
          <Sparkline points={k.spark} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10" />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Topbar local page (si ton Shell n’en a pas) */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-2 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Tableau de bord</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                placeholder="Rechercher un ticker, une directive…"
                className="w-72 bg-transparent outline-none placeholder:text-zinc-400"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <Filter className="h-4 w-4" /> Filtres
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700">
              <FileSearch className="h-4 w-4" /> Nouvelle analyse
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-screen space-y-8 px-6 py-6">
        {/* KPIs */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => (
            <KpiCard key={k.label} k={k} />
          ))}
        </section>

        {/* 2 colonnes principales */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Colonne gauche */}
          <div className="space-y-6 lg:col-span-2">
            {/* Heatmap / Impact placeholder */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Concentration du risque (secteur × juridiction)</h2>
                <button className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Ouvrir Scenario Studio</button>
              </div>
              <div className="grid h-64 place-items-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-850">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Heatmap interactive (brancher plus tard)</span>
              </div>
            </div>

            {/* Regulatory feed */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Veille réglementaire (nouveaux textes)</h2>
                <button className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Voir tout</button>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: Globe2, title: "REGULATION (EU) 2024/1689", desc: "Marchés numériques — obligations de conformité renforcée.", tag: "EU" },
                  { icon: ShieldCheck, title: "H.R.5376 - Inflation Reduction Act", desc: "Crédits énergie propre — effet marges CAPEX/opex.", tag: "US" },
                  { icon: Globe2, title: "中华人民共和国能源法", desc: "Loi énergie Chine — quotas & licensing.", tag: "CN" },
                ].map((i) => (
                  <li key={i.title} className="flex items-start gap-3 rounded-xl border border-zinc-200/70 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
                    <i.icon className="mt-0.5 h-5 w-5 text-zinc-500" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{i.title}</p>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{i.tag}</span>
                      </div>
                      <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{i.desc}</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Alertes récentes</h2>
                <button className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Centre d’alertes</button>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: AlertTriangle, title: "AAPL — Exposition tarifs US smartphones", sev: "Élevée" },
                  { icon: AlertTriangle, title: "NVDA — Restrictions export semi-conducteurs", sev: "Élevée" },
                  { icon: Bell, title: "AMZN — Audit conformité marketplaces UE", sev: "Modérée" },
                ].map((a) => (
                  <li key={a.title} className="flex items-center gap-3 rounded-xl border border-zinc-200/70 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
                    <a.icon className="h-5 w-5 text-amber-500" />
                    <span className="truncate">{a.title}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${a.sev === "Élevée" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>
                      {a.sev}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next steps */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold">Prochaines actions</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-lg border border-zinc-200/70 p-3 dark:border-zinc-800">
                  Lancer extraction 10-K 📄 (AAPL, NVDA, TSLA)
                  <button className="rounded-md bg-zinc-100 px-2 py-1 text-xs hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Exécuter</button>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-zinc-200/70 p-3 dark:border-zinc-800">
                  Simuler scénario “Tarifs US +10% semi”
                  <button className="rounded-md bg-zinc-100 px-2 py-1 text-xs hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Ouvrir</button>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-zinc-200/70 p-3 dark:border-zinc-800">
                  Exporter recommandations  PM
                  <button className="rounded-md bg-zinc-100 px-2 py-1 text-xs hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Exporter</button>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
