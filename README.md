# Indorex AI — Datathon Polyfinances

AI assistant that ingests new **regulatory/fiscal** texts, analyzes their impact on an equity **portfolio (S&P-500 reference)**, and returns **portfolio-aware recommendations**.
Stack: **React (Vite)** + **API Gateway (REST)** + **AWS Lambda (Python)** + **Bedrock (Claude Sonnet)**, optional **Amazon Kendra** for retrieval.

---

## 1) Features

* 🔼 Upload regulatory docs (CSV/JSON/PDF UI; file metadata currently used, full ingest next)
* 🧠 Prompt includes **user context + holdings** (from `src/data/portfolio.json`)
* 🔎 (Planned) Retrieve supporting evidence via **Amazon Kendra**
* 🌐 Fully **CORS**-enabled API (browser friendly)
* ☁️ Serverless backend (Lambda) with **Bedrock** model call

---

## 2) High-level Architecture

```
React UI (Vite) ── POST /prod/ ──► API Gateway (REST)
                                   │
                                   └─► Lambda (Python)
                                         │
                                         └─► Bedrock Runtime (Claude 3.5 Sonnet)
                                              (Optional) Kendra for retrieval
S3 ──(Kendra data source)──► Kendra Index
```

---

## 3) Repos & Key Paths

```
UI/
  src/pages/ingestion/index.tsx   # Ingestion page (frontend)
  src/data/portfolio.json         # Sample holdings used in prompts
lambda/
  lambda_function.py              # Backend handler (Bedrock + CORS)
```

---

## 4) AWS Resources (current)

* **API Gateway (REST)**: `1pixxoj603` → Stage: `prod`

  * Methods on root `/`: `OPTIONS (Mock)`, `POST (Lambda)`
  * **Important**: Frontend must call **`https://1pixxoj603.execute-api.us-east-1.amazonaws.com/prod/`** (note trailing `/`)
* **Lambda**: `indorex-ai-backend` (role: `indorex-ai-backend-role-v9qcn1bg`)
* **Bedrock Model**: `anthropic.claude-3-5-sonnet-20240620-v1:0` (us-east-1)
* **Kendra Index**: `datathon-polyfinances-index-b9b3e5fc`
  Data source (S3): `datathon-polyfinances-s3-source`
* **S3 examples**:
  `2025-09-26_stocks-performance.csv`, `2025-08-15_composition_sp500.csv`

---

## 5) Prerequisites

* Node 18+
* AWS account with access to:

  * **Bedrock** in `us-east-1` (Model Access enabled for *Claude 3.5 Sonnet*)
  * Lambda, API Gateway, S3, Kendra (optional)

---

## 6) Local Development

### UI

```bash
cd UI
npm i
npm run dev
# Open http://localhost:5173/dashboard
```

> Keep the **trailing slash** to avoid `MissingAuthenticationToken`.

### Lambda (Python)

* Package `lambda/lambda_function.py` as a ZIP and upload, or use your pipeline.
* Runtime: Python 3.10+ (compatible with `boto3`/`botocore` in AWS runtime)

---

## 7) Bedrock Permissions (must do)

### A) Enable model access in console

**Bedrock → Model access** → enable `Claude 3.5 Sonnet` in **us-east-1**.

### B) Lambda execution role policy

Attach an inline policy to **`indorex-ai-backend-role-v9qcn1bg`**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowClaudeInvoke",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"
    },
    {
      "Sid": "AllowMarketplaceSubsView",
      "Effect": "Allow",
      "Action": "aws-marketplace:ViewSubscriptions",
      "Resource": "*"
    }
  ]
}
```

> If you just added this, give IAM/STS a few minutes, then **redeploy** the Lambda once.

---

## 8) API Contract

### Request

`POST https://1pixxoj603.execute-api.us-east-1.amazonaws.com/prod/`

```json
{
  "message": "You are a financial analysis assistant...\nInput JSON: { context, portfolio, files }"
}
```

> Frontend composes `message` including:
>
> * `context` (textarea)
> * `portfolio` (from `src/data/portfolio.json`)
> * `files` (array of file metadata; full upload pipeline pending)

### Response (success)

```json
{
  "answer": "Model-generated analysis..."
}
```

### CORS (preflight)

`OPTIONS /prod/` returns:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
```

---

## 9) Quick Tests

Preflight:

```bash
curl -i -X OPTIONS https://1pixxoj603.execute-api.us-east-1.amazonaws.com/prod/ \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

Invoke:

```bash
curl -i -X POST https://1pixxoj603.execute-api.us-east-1.amazonaws.com/prod/ \
  -H "Content-Type: application/json" \
  -d '{"message":"AI portfolio analysis"}'
```

---

## 10) Kendra (optional, next)

* Index: `datathon-polyfinances-index-b9b3e5fc` (Active)
* Data Source: `datathon-polyfinances-s3-source` (S3 sync working)
* **Next**: Add a Lambda step to query Kendra and inject top passages into the Bedrock prompt.

---

## 11) Troubleshooting

**`Failed to fetch` (browser) / CORS**

* Verify preflight returns 200 with the headers above.
* Ensure API URL has **trailing slash** (`/prod/`).

**`MissingAuthenticationToken`**

* Usually hitting `/prod` (no trailing slash). Use `/prod/`.

**`AccessDeniedException bedrock:InvokeModel` or `aws-marketplace:ViewSubscriptions`**

* Attach the IAM policy above and ensure **Bedrock Model Access** is enabled for the account.
* Wait ~5–15 minutes for STS cache; redeploy Lambda.

**`NoneType has no attribute get` in Lambda**

* Ensure you parse `event["body"]` safely before using.

---

## 12) Security & Cost Notes

* Lock down IAM to least privilege once stabilized (narrow resources where possible).
* Bedrock/Kendra incur usage costs—monitor in Cost Explorer.

---

## 13) Roadmap

* ✅ CORS stable, UI ↔ API ↔ Lambda OK
* 🚧 Bedrock invocation: finish permissions + model access, return real AI analysis
* 🔜 Wire Kendra retrieval (RAG)
* 🔜 Real file uploads to S3 + parsing pipeline
* 🔜 Better output formatting (risk metrics, sector exposure, recs)

---

## 14) Maintainers

* **Indorex AI / Datathon Polyfinances** team
* AWS stack: `us-east-1`
* Primary Lambda: `indorex-ai-backend`
* API: `1pixxoj603` (stage `prod`)
