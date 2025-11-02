type Pt = { x: number; y: number };

export default function RiskTrendLine({ points }: { points: Pt[] }) {
  if (!points.length) return null;
  const w = 520, h = 160, pad = 16;
  const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
  const xMin=Math.min(...xs), xMax=Math.max(...xs), yMin=Math.min(...ys), yMax=Math.max(...ys);
  const X = (x:number)=> pad + ((x-xMin)/(xMax-xMin||1))*(w-2*pad);
  const Y = (y:number)=> h-pad - ((y-yMin)/(yMax-yMin||1))*(h-2*pad);
  const d = points.map((p,i)=> (i? "L":"M") + `${X(p.x)},${Y(p.y)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      <rect x={0} y={0} width={w} height={h} className="fill-zinc-50 dark:fill-zinc-900/50"/>
      <path d={d} className="stroke-indigo-600 fill-none" strokeWidth={2}/>
      {points.map((p,i)=>(
        <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={3} className="fill-indigo-600" />
      ))}
    </svg>
  );
}
