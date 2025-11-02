export default function EmptyState({ title="Aucun résultat", hint }: { title?: string; hint?: string; }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold">{title}</h3>
      {hint && <p className="mt-1 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}
