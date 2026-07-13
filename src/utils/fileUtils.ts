import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function writeFileEnsured(path: string, content: string) {
  ensureDir(dirname(path));
  writeFileSync(path, content, "utf-8");
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

/** Simple {{mustache}}-style interpolation used for requestTemplate rendering. */
export function interpolate(template: unknown, values: Record<string, string>): unknown {
  if (typeof template === "string") {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
  }
  if (Array.isArray(template)) {
    return template.map((item) => interpolate(item, values));
  }
  if (template && typeof template === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(template)) {
      out[k] = interpolate(v, values);
    }
    return out;
  }
  return template;
}
