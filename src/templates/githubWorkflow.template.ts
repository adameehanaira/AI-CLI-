import type { AiraConfig } from "../types/config.js";

/** CI/CD workflow for the generated CLI: test on 3 OSes, publish to npm on tag push. */
export function renderGithubWorkflow(config: AiraConfig): string {
  return `name: Release ${config.name}

on:
  push:
    tags:
      - "v*"

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: \${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node bin/index.js --help

  publish:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`;
}
