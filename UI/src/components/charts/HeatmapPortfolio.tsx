export default function HeatmapPortfolio({
  sectors, regions, data
}: { sectors: string[]; regions: string[]; data: Record<string, number>; }) {
  const val = (s:string,r:string)=> data[`${s}_${r}`] ?? 0;
  const color = (v:number)=> v>=75?"bg-red-500":v>=55?"bg-orange-400":v>=35?"bg-amber-300":v>=20?"bg-emerald-300":"bg-emerald-200";
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Secteur \\ Région</th>
            {regions.map(r=><th key={r} className="px-2 py-2 text-center text-xs font-medium text-zinc-500">{r}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sectors.map(s=>(
            <tr key={s}>
              <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{s}</td>
              {regions.map(r=>{
                const v = val(s,r);
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
