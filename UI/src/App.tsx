import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import DashboardHome from "@/pages/DashboardHome";
import Ingestion from "@/pages/Ingestion";
import Explorer from "@/pages/RegulatoryExplorer";
import Company from "@/pages/CompanyViewer";
import Impact from "@/pages/ImpactScoring";
import Scenario from "@/pages/ScenarioStudio";
import Portfolio from "@/pages/PortfolioView";
import Geo from "@/pages/GeoRisk";
import Recos from "@/pages/Recommendations";
import Audit from "@/pages/Audit";
import Catalog from "@/pages/DataCatalog";

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/ingestion" element={<Ingestion />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/company/:ticker" element={<Company />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/scenario" element={<Scenario />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/geo" element={<Geo />} />
          <Route path="/recommendations" element={<Recos />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/catalog" element={<Catalog />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
