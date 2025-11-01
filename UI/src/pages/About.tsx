export default function About() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">About Indorex AI</h1>
      <p className="text-gray-300 leading-relaxed">
        Indorex AI is a portfolio assistant that transforms complex financial regulations
        into actionable investment insights. It combines AI-powered analysis with your personal
        portfolio data to help you make informed decisions — faster and with greater confidence.
      </p>

      <p className="text-gray-400 mt-4">
        Upload your own financial documents, track portfolio evolution, and receive contextual
        recommendations powered by advanced language models — all directly in one simple interface.
      </p>

      <div className="mt-6 p-4 rounded-lg border border-white/10 bg-surface">
        <h2 className="text-xl font-semibold mb-2">Hackathon Project Goals</h2>
        <ul className="list-disc list-inside text-gray-400 space-y-1">
          <li>Provide AI-driven portfolio recommendations.</li>
          <li>Analyze user-provided documents for regulation context.</li>
          <li>Store reasoning history and AI suggestions in a simple JSON backend.</li>
          <li>Demonstrate explainable financial decision-making.</li>
        </ul>
      </div>
    </div>
  )
}
