export default function SectorExposureChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a,b)=>a+b.value,0) || 1;
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.map((d)=>(
        <div key={d.label} className="rounded-xl border border-zinc-200/70 p-3 text-sm dark:border-zinc-800">
          <p className="mb-1 text-xs text-zinc-500">{d.label}</p>
          <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${(d.value/total)*100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
