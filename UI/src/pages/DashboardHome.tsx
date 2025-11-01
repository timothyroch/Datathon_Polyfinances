export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <button className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">
            Nouvelle analyse
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats rapides */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Entreprises suivies
            </h3>
            <p className="text-3xl font-bold mt-1">128</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Rapports générés
            </h3>
            <p className="text-3xl font-bold mt-1">42</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Score moyen ESG
            </h3>
            <p className="text-3xl font-bold mt-1 text-emerald-500">82%</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Alertes à examiner
            </h3>
            <p className="text-3xl font-bold mt-1 text-red-500">7</p>
          </div>
        </section>

        {/* Graph placeholder */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">Aperçu des tendances</h2>
          <div className="h-64 bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-zinc-800 dark:to-zinc-700 rounded-lg flex items-center justify-center">
            <span className="text-zinc-500 dark:text-zinc-400">
              Graphique interactif (prochainement 📈)
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
