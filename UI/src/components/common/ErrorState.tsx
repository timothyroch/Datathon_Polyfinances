export default function ErrorState({ message="Une erreur est survenue." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
      {message}
    </div>
  );
}
