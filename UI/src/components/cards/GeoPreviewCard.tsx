export default function GeoPreviewCard({ label="World coverage", value="26 pays couverts" }: { label?: string; value?: string; }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <div className="mt-3 h-24 rounded-xl bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-zinc-800 dark:to-zinc-700" />
    </div>
  );
}
