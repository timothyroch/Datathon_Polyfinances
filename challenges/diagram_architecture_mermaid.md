
# Diagramme d’architecture – Pipeline IA Financière + Géomatique (AWS)

```mermaid
flowchart TD

%% ======================
%% Sources de données
%% ======================
subgraph Sources[Sources de données]
    A1[2025-08-15_composition_sp500.csv\n(Composition S&P 500)]
    A2[2025-09-26_stocks-performance.csv\n(Performances récentes)]
    A3[directives/* (HTML/XML)\n(Textes réglementaires UE/US/CN/JP)]
    A4[fillings/* (10-K HTML)\n(Rapports d'entreprises)]
end

%% ======================
%% Ingestion S3
%% ======================
A1 -->|Upload| S3[S3 - Ingest Bucket]
A2 -->|Upload| S3
A3 -->|Upload| S3
A4 -->|Upload| S3

%% ======================
%% Extraction & NLP
%% ======================
S3 --> T[Textract / Parser HTML\n(extraction texte brut)]
T --> B1[Bedrock (Claude/Llama)\nRésumé + Extraction d'entités\n{mesures, juridictions, dates, produits}]
A4 -->|10-K passages| B1

%% ======================
%% Indexation & RAG
%% ======================
B1 --> EMB[Bedrock Embeddings (Titan/MiniLM)]
EMB --> OS[OpenSearch Serverless\n(Vector + Keyword Index)]
A4 -->|10-K (chunks)| OS
A3 -->|Directives (chunks)| OS

%% ======================
%% Métadonnées & Référentiels
%% ======================
A1 --> METADATA[(Aurora PostgreSQL + pgvector)\ncompanies, sectors, tickers]
B1 --> METADATA
OS -->|IDs des passages| METADATA

%% ======================
%% Géomatique
%% ======================
subgraph GEO[Géospatial]
    REG[regions (GeoJSON / PostGIS)\n(EU, US, CN, blocs...)]
    SITES[company_sites (points/polygones)\n(sièges, usines, DC)]
    SALES[company_sales_regions (% revenus → régions)]
end

B1 -->|Juridictions normalisées| REG
A4 -->|Indices géo des 10-K| SITES
METADATA --> SALES

REG --> L1[Lambda Geo (GeoPandas/Shapely)\nIntersections]
SITES --> L1
SALES --> L1
L1 --> EXP[(exposures)\nSEE par entreprise & région]

%% ======================
%% Scoring & Recommandations
%% ======================
A2 --> SCORE[Lambda Scoring Engine\nSEE/SIS + sensibilité marché]
EXP --> SCORE
SCORE --> REC[Bedrock (Recommandation)\nRédaction + justification]
OS -->|Citations| REC

%% ======================
%% Publication & Visualisation
%% ======================
REC --> RPT[S3 - Résultats (JSON/CSV/PDF)]
SCORE --> RPT
EXP --> RPT
REG --> RPT
SITES --> RPT

RPT --> QS[QuickSight\n(KPIs / Heatmaps / Tables)]
RPT --> MAP[Front-end React (Amplify/CloudFront)\nMapbox/Leaflet + UI]
OS -->|Citations cliquables| MAP
REC --> MAP

%% ======================
%% Chatbot
%% ======================
subgraph CHAT[Chat financier (Bedrock Agent)]
    CHATUI[UI Chat]
    CHATABI[API Gateway / Lambda / Step Functions]
    CHATTBED[Bedrock Agent]
end

MAP -. ouvrir chat .-> CHATUI
CHATUI --> CHATABI
CHATABI --> CHATTBED
CHATTBED -->|RAG| OS
CHATTBED -->|SQL/Geo queries| METADATA
CHATTBED -->|Réponses| MAP

%% ======================
%% Observabilité & Sécurité
%% ======================
subgraph SEC[Observabilité & Sécurité]
    IAM[IAM (Least privilege)]
    CW[CloudWatch Logs & Metrics]
    GR[Bedrock Guardrails]
end

S3 --> IAM
B1 --> GR
REC --> CW
CHATABI --> CW
OS --> CW
```

## Légende rapide
- **Sources** : fichiers fournis dans `jeu_de_donnees.zip` (composition, performances, directives, 10-K).\n
- **S3** : stockage d’ingestion + résultats.\n
- **Textract/Bedrock** : extraction & normalisation.\n
- **OpenSearch** : index vectoriel pour RAG + citations.\n
- **Aurora + pgvector + PostGIS** : référentiels (tickers, secteurs), embeddings, et géométrie (régions/sites).\n
- **Lambda Geo** : intersections spatiales → **SEE** (Score d’Exposition Entreprise).\n
- **Scoring** : agrégation SEE → **SIS** (Sector Impact Score) + ajustement selon performances.\n
- **Bedrock Reco** : recommandations de portefeuille + justifications.\n
- **QuickSight & Mapbox** : visualisation (KPI, heatmaps, carte, preuves).\n
- **Chat** : agent Bedrock connecté à OpenSearch/Aurora pour réponses contextualisées.\n
```\n
