export default function Loading({ label="Chargement…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-16">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span className="size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
        {label}
      </div>
    </div>
  );
}
