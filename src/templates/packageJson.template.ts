import type { AiraConfig } from "../types/config.js";

/** Renders package.json for the generated CLI project. */
export function renderPackageJson(config: AiraConfig): string {
  const pkg = {
    name: config.name,
    version: config.version ?? "0.1.0",
    description: config.description ?? `${config.displayName ?? config.name} CLI`,
    license: "MIT",
    type: "module",
    bin: {
      [config.name]: "./bin/index.js",
    },
    files: ["bin", "README.md"],
    engines: { node: ">=18.0.0" },
    dependencies: {
      "@aira/runtime": "^0.1.0",
      commander: "^12.1.0",
    },
    keywords: ["cli", "ai", config.provider, "aira-cli-kit"],
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}
