# zzz-data monorepo

Workspace for structured Zenless Zone Zero data and the public API that serves it. The repo is managed with pnpm workspaces and currently ships two packages, a data toolkit and a Cloudflare Worker.

## Packages

- `packages/zzz-data` – TypeScript-first data module that exports curated JSON, constants, and types for agents, Bangboos, W-Engines, Drive Discs, anomalies, and Deadly Assaults.
- `packages/server` – Cloudflare Worker built with Hono and `@hono/zod-openapi`, exposing REST + OpenAPI access to the data package.

## Usage

Install the package in your application workspace:

```bash
pnpm add zzz-data
```

Load the curated data and accompanying types as needed:

```ts
import type { Agent } from "zzz-data"
import { agents } from "zzz-data"

agents.forEach((agent: Agent) => {
  console.log(agent.enName, agent.energyLimit)
})
```

## Getting Started

1. Install [pnpm](https://pnpm.io) 10 and Node.js 20 or later.
2. Install dependencies from the workspace root:
   ```bash
   pnpm install
   ```
3. (Optional) Rebuild the data bundle after making changes:
   ```bash
   pnpm run data:build
   ```
4. Launch the API locally:
   ```bash
   pnpm run server:dev
   ```

## Workspace Scripts

| Command                  | Description                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `pnpm run data:build`    | Compile the TypeScript sources in `packages/zzz-data` with tsdown.                             |
| `pnpm run data:scrape`   | Run the Puppeteer-based scraper against Hakush to refresh raw assets in `data-hakush`.         |
| `pnpm run data:generate` | Transform the workbook and scraped assets into normalized JSON under `packages/zzz-data/data`. |
| `pnpm run server:dev`    | Start the Cloudflare Worker locally through Wrangler.                                          |
| `pnpm run server:deploy` | Deploy the worker using the settings in `packages/server/wrangler.jsonc`.                      |
| `pnpm run release`       | Bump versions with `bumpp`, publish the data package, and orchestrate the release pipeline.    |

## Data Workflow

- `packages/zzz-data/scripts/scraper` pulls authoritative data from https://zzz3.hakush.in (locale `zh`) and stores intermediate results under `packages/zzz-data/data-hakush`.
- `packages/zzz-data/scripts/generate.ts` ingests `data.xlsx` and the scraped assets to regenerate the JSON payloads consumed by both the package and API.
- Running `pnpm run data:build` compiles the TypeScript layer (constants, types, and aggregated exports) into `dist`, which is what the `zzz-data` package exposes.
- The server package consumes the workspace version of `zzz-data`, so rebuilding the data and restarting the worker is enough to test new content locally.

## Repository Layout

```
packages/
├── zzz-data        # Data library and tooling
└── server          # Cloudflare Worker API (`zzz-data-server`)
```

## Contributing

1. Run `pnpm run data:scrape` and/or edit `packages/zzz-data/data.xlsx` to introduce new data.
2. Execute `pnpm run data:generate` to update the derived JSON files.
3. Build (`pnpm run data:build`) and run the local server (`pnpm run server:dev`) to verify changes.
4. Open a pull request with a short summary of the update and any relevant testing notes.
