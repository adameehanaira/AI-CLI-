import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

/**
 * Loads the config that was baked into the generated CLI at build time.
 * The builder writes aira.runtime.json next to bin/index.js so the generated
 * CLI never needs Aira itself (or the original aira.config.json) at runtime.
 */
export function loadRuntimeConfig(entryUrl: string): Record<string, unknown> {
  const dir = dirname(fileURLToPath(entryUrl));
  const raw = readFileSync(join(dir, "aira.runtime.json"), "utf-8");
  return JSON.parse(raw);
}
