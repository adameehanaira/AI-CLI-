# Architecture

Aira CLI Kit is split into two things:

1. **The `aira` framework CLI** (`src/`) — the developer-facing tool. It reads
   `aira.config.json`, validates it, and generates a standalone CLI project.
2. **`@aira/runtime`** (`packages/runtime`) — a tiny shared package that
   generated CLIs depend on at runtime (API calls, auth, chat REPL, themed
   output). Generated CLIs never depend on `aira-cli-kit` itself, only on
   `@aira/runtime`, keeping installs small.

## Flow

```
aira.config.json
      │
      ▼
 configLoader.ts  ──validates with zod──▶  AiraConfig
      │
      ▼
 cliBuilder.ts  ──renders──▶  templates/*.template.ts
      │
      ▼
 dist-cli/<name>/
   ├── bin/index.js            (Commander-based entry, imports @aira/runtime)
   ├── bin/aira.runtime.json   (baked-in config, no need for aira.config.json at runtime)
   ├── package.json
   ├── README.md
   ├── Dockerfile
   └── .github/workflows/release.yml
```

## Why generated CLIs don't depend on Aira itself

Aira is a **build-time** tool. The output is a plain Node.js CLI whose only
runtime dependency is `@aira/runtime` (plus `commander`). This keeps
`npm install -g <your-cli>` fast and keeps the generated project simple
enough that a developer can eject and hand-edit it if they ever outgrow the
generator.

## Extension points

- **Plugins** (`src/plugins/`): implement `AiraPlugin` and hook into
  `onBuild` (adds files/commands at generation time) or `onCommand`
  (runs at CLI runtime). Plugins are ordinary npm packages named
  `aira-plugin-*`.
- **Themes** (`src/themes/`): control banner rendering, colors, and gradients.
- **Templates** (`src/templates/`): pure functions `(AiraConfig) => string`
  that render each generated file. Swap or extend these to change output
  without touching the builder logic.

## Design principles

- **Config in, CLI out.** No required manual scaffolding.
- **Plugin-first.** Core stays small; capabilities (vision, OCR, RAG, etc.)
  ship as separate installable packages.
- **No telemetry, ever**, unless a developer explicitly wires their own.
- **Cross-platform by construction** — generated CLIs are plain Node.js, so
  Windows/Linux/macOS behavior is identical without platform-specific code.
