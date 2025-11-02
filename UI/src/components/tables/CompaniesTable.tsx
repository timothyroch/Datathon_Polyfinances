export type CompanyRow = { ticker:string; name:string; sector:string; risk:number; exposure:number };

export default function CompaniesTable({ rows }: { rows: CompanyRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full text-sm">
        <thead className="border-b border-zinc-200 dark:border-zinc-800">
          <tr className="text-zinc-600 dark:text-zinc-300">
            <th className="px-3 py-2 text-left text-xs font-medium">Ticker</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Entreprise</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Secteur</th>
            <th className="px-3 py-2 text-left text-xs font-medium">% Expo</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Score risque</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((r)=>(
            <tr key={r.ticker} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
              <td className="px-3 py-2">{r.ticker}</td>
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2">{r.sector}</td>
              <td className="px-3 py-2">{r.exposure}%</td>
              <td className="px-3 py-2">{r.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
