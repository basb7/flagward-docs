# Flagward Docs

The Flagward documentation site: a standalone [Fumadocs](https://fumadocs.dev)
(Next.js) app that documents the Flagward backend and the `@flagward/*` SDKs.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000/docs with your browser to see the result.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Build for production. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Check formatting and lint rules with Biome. |
| `npm run lint:fix` | Apply Biome's safe fixes. |
| `npm run format` | Format files with Biome. |

## Run with Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Open http://localhost:3001 with your browser to see the result. Change the
host port by setting `DOCS_PORT` in `.env` (the container always listens on
3000).

## Project layout

- `content/docs`: MDX content, ordered by `meta.json` in each folder.
- `lib/source.ts`: content source adapter ([`loader()`](https://fumadocs.dev/docs/headless/source-api)).
- `lib/layout.shared.tsx`: shared layout options (nav title, logo, GitHub link).
- `app/(home)`: the `/` route, which redirects to `/docs`.
- `app/docs`: the documentation layout and pages.

## Out of scope (for now)

Versioning, an OpenAPI reference, a TypeDoc reference, i18n, and deployment
are intentionally not set up yet.
