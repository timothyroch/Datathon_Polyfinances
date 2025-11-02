import { Separator} from "../ui/separator";

export default function DocsRecentCard({ docs }: { docs: { id:string; title:string; date:string }[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 font-semibold">Documents récents</h3>
      <ul className="text-sm">
        {docs.map((d,i)=>(
          <li key={d.id} className="py-2">
            <div className="flex items-center justify-between">
              <span className="truncate">{d.title}</span>
              <span className="text-xs text-zinc-500">{d.date}</span>
            </div>
            {i<docs.length-1 && <Separator className="mt-2" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
