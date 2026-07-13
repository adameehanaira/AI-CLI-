# Contributing to Aira CLI Kit

Thanks for considering a contribution — this project only becomes a real standard if the community shapes it.

## Getting set up

```bash
git clone https://github.com/aira-group/aira-cli-kit.git
cd aira-cli-kit
npm install
npm run build
npm link        # makes `aira` available globally, pointing at your local build
```

## Project layout

- `src/commands/` — one file per `aira <command>`
- `src/core/` — config loading, logging, API client, secure storage
- `src/builders/` — turns a validated `AiraConfig` into files on disk
- `src/templates/` — pure render functions, one per generated file
- `src/plugins/` — plugin contract + loader
- `packages/runtime/` — the runtime generated CLIs depend on

## Adding a plugin

Official plugins live in their own repos as `aira-plugin-<name>` packages that default-export an object implementing `AiraPlugin` (see `src/plugins/types.ts`). Open an issue first if you'd like it considered for the official list in `README.md`.

## Adding a generated-file template

Templates are plain functions `(config: AiraConfig) => string`. Add one under `src/templates/`, wire it into `src/builders/cliBuilder.ts`, and add a test under `tests/`.

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Add or update tests for anything in `src/core` or `src/builders`
- Run `npm run lint && npm test` before opening
- Describe the "why," not just the "what," in the PR description

## Reporting issues

Please include your `aira.config.json` (redact secrets), the command you ran, and the full error output.

## Code of conduct

Be respectful, assume good faith, and keep discussion focused on the project. Contact **support@airaai.work.gd** for anything that needs a maintainer's attention directly.
