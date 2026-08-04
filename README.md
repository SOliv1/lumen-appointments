# serene-care-sync

Care coordination workspace for managing patients, clinicians, availability and appointments.

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run the backend/static production server:

```bash
npm run backend
```

## Render

Current frontend static site settings:

- Build command: `npm ci && npm run build`
- Publish directory: `build`
- Rewrite rule: `/*` to `/index.html`

The included `render.yaml` records the same static site setup for future Render blueprints.

When the backend is deployed as a Render Web Service, use:

- Build command: `npm ci && npm run build`
- Start command: `npm run backend`
