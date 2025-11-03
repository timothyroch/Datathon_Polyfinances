
# Regulatory Impact Analyzer for S&P 500 — AWS + GenAI + Geomatics

> End-to-end architecture and implementation guide for an AI-powered tool that ingests regulatory/policy texts, assesses financial impact on S&P 500 companies, maps geographic exposure, and produces portfolio recommendations. Built on AWS with Amazon Bedrock, serverless data processing, and geospatial analytics.

---

## 1) Problem framing & objectives

**Goal:** Given a regulatory or policy document (e.g., sanctions, tariffs, ESG norms, export restrictions, subsidies), extract key measures, identify affected sectors/companies, quantify geographic exposure, and return action-oriented portfolio suggestions (overweight/underweight/replace) with transparent reasoning and source citations.

**Objectives**
- Automate **document understanding** (extraction, classification, entitization, normalization).
- Link policy **measures → sectors → companies → geographies** (sales by region, production sites, supply chains).
- Produce **impact scores** (risk/opportunity) at company, sector, and portfolio levels.
- Provide **interactive visuals**: heatmaps of exposure and a geographic map of affected regions/sites.
- Ensure **auditability** with traceable evidence and minimal hallucinations.
- Ship a **simple web UI** + **reproducible pipeline** + **demo video**.

---

## 2) Minimal financial methodology (analyst view)

**Key dimensions**
1. **Regulatory mechanism** — nature, scope, start date, jurisdiction(s), targeted entities/products.
2. **Economic channel** — cost shock, demand shift, supply chain friction, subsidy/credit effect, compliance burden.
3. **Geographic exposure** — where rules apply vs. where companies operate/sell/produce.

**Inputs per company (S&P 500)**
- Sector/industry (GICS), market cap, index weight.
- Revenue by geography (Americas/EMEA/APAC if granular not available), product lines.
- Known locations: HQ, major plants/fabs, distribution hubs (approximate when needed).
- Supplier/partner hints from 10-K text (co-occurrences, sections “Supply Chain”, “Risk Factors”).

**Outputs**
- **Company Exposure Score (CES)**: f(policy scope, region overlap, business dependence, substitutability).
- **Sector Impact Score (SIS)**: weighted aggregation of CES across constituents.
- **Portfolio Adjustments**: overweight/underweight/replace candidates + short list of **peer alternatives** with lower exposure / higher tailwinds.
- **Rationale**: short, cited explanation + uncertainty flag.

---

## 3) Geomatics integration (differentiator)

**Data model (simplified)**
- `regions` (GeoJSON polygons): countries, blocs (EU/US/CN), special zones (sanctions list, tariff zones).
- `company_sites` (points/polygons): HQ, plants, distribution centers (curated + approximations).
- `company_sales_regions` (table): %-of-revenue by region (linked to region polygons).
- `policy_regions` (polygons): jurisdictions referenced in the policy (extracted + normalized).

**Spatial analytics**
- **Intersection**: `policy_regions ∩ (company_sites ⊕ company_sales_regions)` → exposure geometries.
- **Scoring**: proximity weighting (when exact sites unknown), region share weighting for revenues.
- **Mapping**: choropleth of exposure by region, markers for critical facilities, selection drilldowns.

**Visualization options**
- **Mapbox GL / Leaflet** front-end (Amplify hosting) for interactive layers.
- **Amazon QuickSight** for integrated BI visuals (heatmap + KPI tiles).

---

## 4) AWS reference architecture (high level)

```mermaid
graph TD

%% User & Frontend
A[User / Web UI] -->|Upload PDF/URL or prompt| B[S3 Ingest Bucket]

%% Ingestion & Text Extraction
B --> C[Textract (PDF OCR) ⟂ Bedrock Claude 3 for HTML/TXT]
C --> D[Bedrock PromptFlow - Extract Entities & Measures]

%% Knowledge & Indexing
D --> E[Embedding via Bedrock Titan/MiniLM]
E --> F[OpenSearch Serverless (Vector Index)]
F --> G[Aurora PostgreSQL + pgvector (metadata/tickers)]

%% Geospatial
G --> H[PostGIS (Aurora PostgreSQL)]
H --> I[Lambda Geo (GeoPandas/Shapely) Intersections]

%% Scoring & Reasoning
I --> J[Lambda Scoring Engine (rules + regression)]
J --> K[Bedrock (Claude/Mistral) - Recommendation Writer]
K --> L[S3 Results + CloudFront/Amplify Dashboard]

%% Analytics & Viz
L --> M[QuickSight Dashboards (KPI, Heatmaps, Tables)]
L --> N[Mapbox/Leaflet Map (regions, sites, impacts)]

%% Observability & Security
K --> O[CloudWatch Logs & Metrics]
A --> P[IAM Identity Center / Cognito (AuthN/AuthZ)]
```

---

## 5) Components & responsibilities

| Layer | Service | Responsibility |
|---|---|---|
| Storage | **S3** | Source documents, intermediate JSON, final reports and datasets. Versioning on. |
| Text extraction | **Textract** | OCR for PDFs/images; fall back to Bedrock for HTML/structured text parsing. |
| NLP extraction | **Bedrock** (Claude 3 / Llama 3) | Summarize policy, extract entities (regulated products, dates, jurisdictions, thresholds), normalize to schema. |
| Embeddings | **Bedrock** (Titan/MiniLM) | Dense vectors for semantic retrieval (RAG) and duplicate detection. |
| Search | **OpenSearch Serverless** | Vector + keyword index of policy snippets, 10-K excerpts, company facts. |
| Metadata DB | **Aurora PostgreSQL + pgvector** | Tickers, GICS, revenue-by-region, curated sites, normalized entities, prompt caches. |
| Geospatial | **PostGIS** (+ **Lambda Geo** with GeoPandas) | Region polygons, company sites; run intersections, buffers, spatial joins. |
| Business logic | **AWS Lambda** | Orchestrate steps, rule-based and learned scoring, confidence estimation. |
| Orchestration | **Step Functions** | Robust pipeline: ingest → extract → enrich → spatial → score → recommend → publish. |
| API | **API Gateway** | REST endpoints for UI; integrates Lambda/Step Functions. |
| Frontend | **Amplify + CloudFront** | Single-page app (React/Next.js) with Mapbox/Leaflet + QuickSight embeds. |
| Analytics | **QuickSight** | KPI tiles, heatmaps by sector/region/company; export CSV/PDF. |
| Auth | **Cognito** or **IAM Identity Center** | User sign-in; signed URL for S3/CloudFront if needed. |
| Observability | **CloudWatch / X-Ray** | Logs, metrics, tracing; alarms (quota, cost). |

---

## 6) Data flow (detailed, step-by-step)

1) **User uploads** a PDF/URL → stored in **S3**.  
2) **Textract** extracts raw text; fallback to Bedrock parsing for HTML/structured docs.  
3) **Bedrock (extraction prompt)** produces a normalized JSON: policy type, measures, thresholds, dates, jurisdictions, named entities (companies/sectors if mentioned).  
4) **Embeddings** computed (policy chunks + 10-K curated snippets) → **OpenSearch** vector index.  
5) **Linking & enrichment** (Lambda): map jurisdictions to polygons, products to GICS, match company mentions to tickers (disambiguation with RAG evidence).  
6) **Geomatics**: in **PostGIS**, intersect `policy_regions` with `company_sites` and `company_sales_regions` to estimate **geographic exposure**.  
7) **Scoring**: compute **CES** and **SIS**, with uncertainty; store in **Aurora**.  
8) **Recommendation writer** (Bedrock) drafts portfolio actions + **citations** (OpenSearch doc IDs).  
9) **Publishing**: results JSON + CSV to **S3**; dashboards refresh (QuickSight) and map layers update (Mapbox/Leaflet).  
10) **UI** displays: summary, evidence, heatmaps, map, and a downloadable PDF/CSV report.

---

## 7) Security, governance & cost controls

- **IAM** least privilege per microservice; CI/CD with parameterized env (dev/demo).  
- **PII-free** doc handling; S3 bucket policies + encryption (SSE-S3/KMS).  
- **Bedrock guardrails** for prompt filtering & allowed outputs.  
- **Budget alarms**; cache embeddings & LLM outputs; reuse indexes.  
- **Traceability**: store prompt + model + version + citations for each run.  

---

## 8) Implementation checklist (MVP in ~2–4 days of focused work)

- [ ] S3 buckets (ingest, curated, results) + IAM roles.  
- [ ] Aurora Serverless v2 with **PostGIS** and **pgvector**; initial schemas.  
- [ ] OpenSearch Serverless collection (vector + keyword).  
- [ ] Lambda layers: **GeoPandas/Shapely**, shared utils.  
- [ ] Step Functions state machine (JSON/YAML).  
- [ ] Bedrock prompts: **extraction**, **linking QA**, **recommendation writer**.  
- [ ] Minimal React front-end (Amplify) + Mapbox map + QuickSight embeddable.  
- [ ] CloudWatch metrics/alarms; cost guardrails.  
- [ ] Demo script + seed data (one EU, one US policy).  

---

## 9) Data schemas (abridged)

### `companies`
- `ticker` (PK), `name`, `gics_sector`, `gics_industry`, `index_weight`

### `company_sales_regions`
- `ticker` (FK), `region_id` (FK), `%revenue`

### `regions`
- `region_id` (PK), `name`, `type` (country/bloc/custom), `geom` (Polygon/MultiPolygon)

### `company_sites`
- `site_id` (PK), `ticker` (FK), `site_type` (hq/plant/dc), `geom` (Point/Polygon), `confidence`

### `policies`
- `policy_id` (PK), `title`, `date_effective`, `jurisdictions[]`, `measures[]`, `entities[]`, `source_uri`

### `exposures`
- `policy_id` (FK), `ticker` (FK), `region_id` (FK), `exposure_score`, `method`, `evidence_ids[]`

### `scores`
- `policy_id`, `ticker`, `CES`, `uncertainty`, `explain_text`
- `policy_id`, `gics_sector`, `SIS`, `explain_text`

---

## 10) Prompt design (Bedrock)

**Extraction (system)**  
“Identify policy measures, thresholds, jurisdictions, affected products, dates. Return normalized JSON matching the schema. Include passages with character offsets for each extracted field.”

**Linking QA (system)**  
“Given extracted entities and a knowledge base (GICS, ticker db, 10-K snippets), confirm ticker mapping; if ambiguous, ask a clarifying question or mark `uncertain: true` with top-3 candidates and citations.”

**Recommendation writer (system)**  
“Summarize impact by sector & geography, compute action items (OW/UW/Hedge/Replace) from scores; provide bulletproof rationale with citations to indexed passages. Use concise professional tone.”

---

## 11) Evaluation & guardrails

- **Accuracy**: top-3 exposure companies contain true-affected names in curated test.  
- **Faithfulness**: each claim links to an indexed snippet.  
- **Latency**: < 30–60s end-to-end for a 5–15 page document.  
- **Cost**: < a few dollars per run; embeddings & caching reused.  
- **UX**: one-page flow; map + heatmap + recommendation panel.  

---

## 12) Demo path (script)

1. Upload a recent EU/US policy PDF.  
2. Show extraction JSON (key measures + jurisdictions).  
3. Open the map: highlighted regions + company sites; click a site to see exposure details.  
4. Show heatmap by sector; drill into a company to view rationale & citations.  
5. Download the final CSV/PDF; conclude with portfolio suggestions.

---

## 13) Next steps

- Implement schemas and seed regions (Natural Earth/admin-0 as baseline).  
- Build Step Functions + Lambdas (text → extract → link → spatial → score).  
- Wire OpenSearch & pgvector; add caching.  
- Ship the React UI with Mapbox + QuickSight embedding.  
- Record a ≤5 min demo video following the script above.

---

**Author:** Solution draft prepared for a finance ML challenge on AWS, with emphasis on GenAI and Geomatics.
