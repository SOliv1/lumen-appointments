# Serene Care Sync

Care coordination workspace for managing patients, clinicians, availability and appointments.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Serve the production build:

```bash
npm start
```

## Render

Recommended static site settings:

- Build command: `npm ci && npm run build`
- Publish directory: `build`
- Rewrite rule: `/*` to `/index.html`

The included `render.yaml` records the same static site setup for future Render blueprints.
