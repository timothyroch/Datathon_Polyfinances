export default function HedgesTable({ rows }: { rows:{ idea:string; instr:string; te:number; comment:string }[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full text-sm">
        <thead className="border-b border-zinc-200 dark:border-zinc-800">
          <tr className="text-zinc-600 dark:text-zinc-300">
            <th className="px-3 py-2 text-left text-xs font-medium">Hedge</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Instrument</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Δ TE</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Commentaire</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((r,i)=>(
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
              <td className="px-3 py-2">{r.idea}</td>
              <td className="px-3 py-2">{r.instr}</td>
              <td className="px-3 py-2">{r.te}</td>
              <td className="px-3 py-2">{r.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
