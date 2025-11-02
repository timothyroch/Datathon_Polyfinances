import ToneBadge from "../ui/badge";
export default function ComplianceCard({
  title, score, items
}: { title: string; score: number; items: string[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <ToneBadge tone={score>=80?"green":score>=50?"amber":"red"}>{score}/100</ToneBadge>
      </div>
      <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300">
        {items.map((it)=> <li key={it}>{it}</li>)}
      </ul>
    </div>
  );
}
