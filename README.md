# 🌱 Eco Eats

**See the carbon footprint of your food before you buy it.**

Eco Eats is a mobile-first web app that scans a product's barcode or a photo of a meal and shows its estimated carbon footprint. It also breaks down where the emissions come from and suggests lower-impact alternatives. Built for the **Bloom Designathon**.

<!-- Add a screenshot: save it as docs/screenshot.png, then uncomment the line below.
<p align="center"><img src="docs/screenshot.png" alt="Eco Eats app screens" width="320"></p>
-->

## Features

- **Barcode scanning**: scan with the phone camera or type the number in. Product data comes from [Open Food Facts](https://world.openfoodfacts.org/).
- **Photo recognition**: photograph a meal or product with no barcode. Gemini identifies the food.
- **Impact score**: a 1–10 score plus kg CO₂e per kg, split into ingredients, transport and packaging.
- **Lower-impact alternatives**: swaps from the same category that cost less carbon.
- **Dietary preferences**: flags conflicts with your diet, allergies or religious requirements.
- **Ask the assistant**: a chat tool for questions about food and climate.
- **Personal dashboard**: track your scan history and weekly footprint.

## How the estimate works

```
barcode ──► Open Food Facts ─┐
                             ├─► category match ─► emission factor ─┐
photo ───► Gemini (vision) ──┘                                      ├─► total CO₂e ─► impact score (1–10)
                         origin ─► transport distance & mode ───────┤
                       packaging ─► packaging emissions ────────────┘
```

- **Ingredient emissions** come from the `emission_factors` table, seeded with values from **Agribalyse 3.1** and **Poore & Nemecek (2018)**. A built-in fallback table keeps the app working offline.
- **Transport** uses the country of origin to estimate distance and shipping mode (road, sea or air), measured from the UK.
- **Packaging** adds an estimate for each listed material.
- The **impact score** puts the total on a log scale, from 0.3 kg CO₂e/kg (score 1) to 50 kg CO₂e/kg (score 10).

Scanned products are saved to Supabase, so later lookups are instant.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Supabase (Postgres plus Edge Functions) |
| AI | Gemini, used for photo recognition and the chat assistant |
| Data | Open Food Facts, Agribalyse 3.1 |

## Getting started

Requirements: [Bun](https://bun.sh/) (or Node 18+) and a Supabase project.

```sh
git clone https://github.com/BarotDvij/eco-eats-advisor.git
cd eco-eats-advisor
bun install
```

Create a `.env` file:

```sh
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PROJECT_ID=<project-id>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

Set up the database and deploy the edge functions:

```sh
supabase db push
supabase secrets set LOVABLE_API_KEY=<key>   # used by both functions to reach Gemini
supabase functions deploy food-image-scan carbon-chat
```

Then start the dev server:

```sh
bun dev          # http://localhost:8080
```

| Command | What it does |
|---|---|
| `bun dev` | Start the dev server |
| `bun run build` | Build for production |
| `bun run test` | Run the tests |
| `bun run lint` | Run ESLint |

## Project structure

```
src/
  screens/       one file per app screen (Home, Scan, Results, Alternatives, …)
  components/    reusable UI pieces (ScoreGauge, BarcodeMode, PhotoMode, …)
  services/      data and estimation logic (carbonEstimator, openFoodFacts, …)
  hooks/         theme and dietary-preference state
supabase/
  functions/     edge functions: food-image-scan, carbon-chat
  migrations/    database schema and emission-factor seed data
docs/            designathon notes
```

## Limitations

- These are estimates for a category, not a lifecycle assessment of the specific product.
- Transport distances assume the shopper is in the UK.
- `src/services/demoProducts.ts` holds one hardcoded product used for the live designathon demo.
