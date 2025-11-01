// src/pages/GeoRisk/index.tsx
import React from "react";
import * as topojson from "topojson-client";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { Filter, Clock3, ChevronRight, ChevronLeft, MapPin } from "lucide-react";

/* ------------------------------------------------------------------ */
/*                          MOCK DATA (démo)                           */
/* Remplace par tes services dès que prêt                              */
/* ------------------------------------------------------------------ */
type RegionRisk = {
  iso: string;
  name: string;
  risk: number;        // 0..100
  exposure: number;    // %
  companies: number;   // nb tickers
  sectorTop: string;
  trend: "up" | "down" | "flat";
};

const MOCK_REGIONS: RegionRisk[] = [
  { iso: "US", name: "United States", risk: 38, exposure: 26.4, companies: 203, sectorTop: "Tech", trend: "flat" },
  { iso: "EU", name: "European Union", risk: 44, exposure: 21.1, companies: 166, sectorTop: "Consumer", trend: "up" },
  { iso: "CN", name: "China", risk: 69, exposure: 10.2, companies: 87, sectorTop: "Semiconductors", trend: "up" },
  { iso: "JP", name: "Japan", risk: 28, exposure: 6.1, companies: 54, sectorTop: "Auto", trend: "down" },
  { iso: "IN", name: "India", risk: 31, exposure: 4.8, companies: 35, sectorTop: "Manufacturing", trend: "up" },
  { iso: "CA", name: "Canada", risk: 24, exposure: 3.6, companies: 22, sectorTop: "Energy", trend: "flat" },
  { iso: "BR", name: "Brazil", risk: 41, exposure: 2.9, companies: 19, sectorTop: "Materials", trend: "up" },
];

const MOCK_SECTOR_MIX: { region: string; sector: string; weight: number }[] = [
  { region: "US", sector: "Tech", weight: 34 },
  { region: "US", sector: "Health", weight: 16 },
  { region: "US", sector: "Consumer", weight: 18 },
  { region: "US", sector: "Energy", weight: 7 },
  { region: "US", sector: "Financials", weight: 25 },
  { region: "CN", sector: "Semiconductors", weight: 38 },
  { region: "CN", sector: "Consumer", weight: 20 },
  { region: "CN", sector: "Industrial", weight: 22 },
  { region: "CN", sector: "Energy", weight: 20 },
  { region: "EU", sector: "Consumer", weight: 28 },
  { region: "EU", sector: "Industrial", weight: 24 },
  { region: "EU", sector: "Health", weight: 18 },
  { region: "EU", sector: "Tech", weight: 15 },
  { region: "EU", sector: "Financials", weight: 15 },
];

/* ------------------------------------------------------------------ */
/*                       UI helpers (small pieces)                     */
/* ------------------------------------------------------------------ */
function Badge({ children, tone = "zinc" }: { children: React.ReactNode; tone?: "zinc" | "red" | "emerald" }) {
  const map = {
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MiniBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded-sm bg-emerald-300" /> Faible</span>
      <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded-sm bg-amber-300" /> Modéré</span>
      <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded-sm bg-orange-400" /> Élevé</span>
      <span className="inline-flex items-center gap-1"><span className="h-3 w-4 rounded-sm bg-red-500" /> Critique</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                            MAP COMPONENT                            */
/* ------------------------------------------------------------------ */

// URL TopoJSON monde
const WORLD_TOPO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// palette 0..100 -> couleur
const colorScale = scaleSequential<string>().domain([0, 100]).interpolator(interpolateYlOrRd);

// Convertit la liste de régions en index ISO2 -> risque
function buildRiskIndex(regions: { iso: string; risk: number }[]) {
  const idx = new Map<string, number>();
  for (const r of regions) idx.set(r.iso.toUpperCase(), r.risk);
  // l'UE n'est pas un pays -> on propage sur les membres
  const EU = [
    "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
    "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
  ];
  const euRisk = regions.find(r => r.iso === "EU")?.risk;
  if (euRisk != null) EU.forEach(c => idx.set(c, euRisk));
  return idx;
}

type GeoMapProps = {
  selectedISO?: string;
  onSelect: (iso: string) => void;
  layers: { exposure: boolean; sanctions: boolean; energy: boolean };
  loading?: boolean;
  regions?: { iso: string; risk: number }[];
};

function GeoMap({ selectedISO, onSelect, layers, loading = false, regions = [] }: GeoMapProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(800);
  const height = 520;

  React.useEffect(() => {
    const resize = () => ref.current && setWidth(ref.current.clientWidth);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const [features, setFeatures] = React.useState<any[]>([]);
  React.useEffect(() => {
    let alive = true;
    fetch(WORLD_TOPO)
      .then((r) => r.json())
      .then((topo) => {
        if (!alive) return;
        const fc = topojson.feature(topo, topo.objects.countries) as any;
        setFeatures(fc.features ?? []);
      });
    return () => { alive = false; };
  }, []);

  const proj: GeoProjection = React.useMemo(
    () => geoNaturalEarth1().fitSize([width, height], { type: "Sphere" } as any),
    [width]
  );
  const path = React.useMemo(() => geoPath(proj), [proj]);
  const riskIndex = React.useMemo(() => buildRiskIndex(regions), [regions]);

  const iso2 = (f: any): string =>
    (f.properties?.ISO_A2_EH ?? f.properties?.ISO_A2 ?? f.properties?.wb_a2 ?? "").toUpperCase();

  return (
    <div ref={ref} className="relative h-[520px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70">
        <span className="h-2 w-2 rounded-full bg-indigo-500" />
        <span>World risk map</span>
      </div>

      <div className="absolute right-3 top-3 z-10 flex gap-2">
        {(["exposure","sanctions","energy"] as const).map(k => {
          const active = layers[k];
          return (
            <button key={k}
              className={`rounded-lg px-3 py-1.5 text-xs border capitalize
                ${active ? "bg-indigo-600 text-white border-indigo-600" :
                "bg-white/90 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700"}`}>
              {k}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
          <div className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
        </div>
      )}

      <svg width={width} height={height} className="block">
        <defs>
          <clipPath id="sphere">
            <path d={path({ type: "Sphere" } as any) ?? ""} />
          </clipPath>
        </defs>

        {/* Océan */}
        <path d={path({ type: "Sphere" } as any) ?? ""} className="fill-zinc-100 dark:fill-zinc-950" />

        {/* Pays */}
        <g clipPath="url(#sphere)">
          {features.map((f) => {
            const code = iso2(f);
            const risk = riskIndex.get(code);
            const selected = selectedISO?.toUpperCase() === code;
            const fill = risk != null ? colorScale(risk) : "#e5e7eb";
            return (
              <path
                key={code || f.id}
                d={path(f) ?? ""}
                onClick={() => code && onSelect(code)}
                className={`transition-colors ${selected ? "stroke-indigo-600" : "stroke-black/20 dark:stroke-white/10"} stroke-[0.6]`}
                style={{ fill, cursor: code ? "pointer" : "default" }}
              />
            );
          })}
        </g>
      </svg>

      {/* Légende */}
      <div className="absolute bottom-3 left-3">
        <div className="rounded-xl border border-zinc-200 bg-white/80 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
          <Legend />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                             PAGE GEORISK                            */
/* ------------------------------------------------------------------ */
function GeoRisk() {
  const [scenario, setScenario] = React.useState<"base" | "sanctions" | "energy">("base");
  const [layers, setLayers] = React.useState({ exposure: true, sanctions: false, energy: false });
  const [selected, setSelected] = React.useState<string>("US");
  const [range, setRange] = React.useState<number>(6);
  const [q, setQ] = React.useState("");

  const rows = React.useMemo(() => {
    const base = MOCK_REGIONS.filter(r =>
      r.name.toLowerCase().includes(q.toLowerCase()) || r.iso.toLowerCase().includes(q.toLowerCase())
    );
    return base.sort((a, b) => b.risk - a.risk);
  }, [q]);

  const sel = rows.find(r => r.iso === selected) ?? rows[0];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Topbar */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <h1 className="text-xl font-semibold tracking-tight">GeoRisk</h1>
          <div className="ml-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Filter className="h-4 w-4 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrer par pays / code ISO…"
              className="w-64 bg-transparent outline-none placeholder:text-zinc-400"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setScenario("base")}
              className={`rounded-xl px-3 py-2 text-sm border ${scenario==="base"?"bg-indigo-600 text-white border-indigo-600":"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>Base</button>
            <button onClick={() => {setScenario("sanctions"); setLayers(s=>({...s, sanctions:true}));}}
              className={`rounded-xl px-3 py-2 text-sm border ${scenario==="sanctions"?"bg-indigo-600 text-white border-indigo-600":"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>Sanctions</button>
            <button onClick={() => {setScenario("energy"); setLayers(s=>({...s, energy:true}));}}
              className={`rounded-xl px-3 py-2 text-sm border ${scenario==="energy"?"bg-indigo-600 text-white border-indigo-600":"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>Énergie</button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        {/* Colonne carte */}
        <div className="space-y-6 lg:col-span-2">
          <GeoMap
            selectedISO={selected}
            onSelect={setSelected}
            layers={layers}
            regions={MOCK_REGIONS.map(r => ({ iso: r.iso, risk: r.risk }))}
          />

          {/* Hotspots */}
          <SectionCard title="Hotspots à surveiller" action={<span className="text-sm text-zinc-500">Fenêtre: {range} mois</span>}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.slice(0, 6).map((r) => (
                <button key={r.iso} onClick={() => setSelected(r.iso)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-white p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{r.name}</p>
                      <Badge tone={r.risk >= 60 ? "red" : r.risk >= 35 ? "zinc" : "emerald"}>{r.risk}</Badge>
                    </div>
                    <p className="truncate text-xs text-zinc-500">{r.sectorTop} • {r.exposure.toFixed(1)}% exp.</p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Colonne droite: détails */}
        <div className="space-y-6">
          <SectionCard title={`Détails — ${sel.name}`} action={<Badge tone="zinc">{sel.iso}</Badge>}>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">Score de risque</p>
                <p className="mt-1 text-2xl font-semibold">{sel.risk}</p>
              </div>
              <div className="rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">% exposition</p>
                <p className="mt-1 text-2xl font-semibold">{sel.exposure.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">Titres exposés</p>
                <p className="mt-1 text-2xl font-semibold">{sel.companies}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Risque relatif</p>
              <MiniBar value={sel.risk} />
            </div>
            <div className="mt-4 rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800">
              <p className="mb-2 text-sm font-medium">Mix sectoriel</p>
              <div className="space-y-2">
                {MOCK_SECTOR_MIX.filter(s => s.region === sel.iso).map(s => (
                  <div key={s.sector} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-zinc-500">{s.sector}</div>
                    <MiniBar value={s.weight} max={40} />
                    <div className="w-10 text-right text-xs text-zinc-500">{s.weight}%</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Historique du score (glissant)" action={<div className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4" /> {range} mois</div>}>
            <div className="flex items-center gap-3">
              <button className="rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" onClick={() => setRange(r => Math.max(3, r - 3))}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="h-24 flex-1 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 grid place-items-center text-sm text-zinc-500">
                (sparklines / line chart ici)
              </div>
              <button className="rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" onClick={() => setRange(r => Math.min(24, r + 3))}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Tableau simple */}
        <div className="lg:col-span-3">
          <SectionCard title="Tableau des pays / régions" action={<Legend />}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr className="text-zinc-600 dark:text-zinc-300">
                    <th className="px-3 py-2 text-left text-xs font-medium">Région</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Code</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Risque</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">% Exposition</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Titres</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Secteur clé</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {rows.map((r) => (
                    <tr key={r.iso} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${selected===r.iso ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 text-zinc-500">{r.iso}</td>
                      <td className="px-3 py-2">{r.risk}</td>
                      <td className="px-3 py-2">{r.exposure.toFixed(1)}%</td>
                      <td className="px-3 py-2">{r.companies}</td>
                      <td className="px-3 py-2 text-zinc-500">{r.sectorTop}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => setSelected(r.iso)}
                          className="rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">Détails</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}

export default GeoRisk;
