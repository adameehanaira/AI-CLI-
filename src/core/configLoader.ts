import { existsSync, readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";
import type { AiraConfig } from "../types/config.js";
import { AiraError } from "./errors.js";

const authSchema = z.object({
  type: z.enum(["bearer", "api-key", "basic", "none"]),
  header: z.string().optional(),
  envVar: z.string().optional(),
  prefix: z.string().optional(),
});

const paramSchema = z.object({
  name: z.string(),
  flag: z.string(),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const commandSchema = z.object({
  name: z.string(),
  description: z.string(),
  endpoint: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
  streaming: z.boolean().optional(),
  requestTemplate: z.record(z.unknown()).optional(),
  responsePath: z.string().optional(),
  params: z.array(paramSchema).optional(),
  interactive: z.boolean().optional(),
  renderMarkdown: z.boolean().optional(),
  history: z.boolean().optional(),
  tools: z.array(z.enum(["read_file", "write_file", "edit_file", "list_files"])).optional(),
});

const pluginSchema = z.object({
  name: z.string(),
  options: z.record(z.unknown()).optional(),
});

const themeSchema = z.object({
  name: z.string().optional(),
  primaryColor: z.string().optional(),
  gradient: z.tuple([z.string(), z.string()]).optional(),
  logo: z.enum(["figlet", "gradient", "none"]).optional(),
});

export const configSchema = z.object({
  $schema: z.string().optional(),
  name: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, "name must be lowercase, alphanumeric, hyphen-separated"),
  displayName: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  provider: z.enum(["openai", "anthropic", "custom", "ollama", "huggingface"]),
  api: z.string().url(),
  auth: authSchema.optional(),
  commands: z.array(commandSchema).optional(),
  plugins: z.array(pluginSchema).optional(),
  theme: themeSchema.optional(),
  outDir: z.string().optional(),
  telemetry: z.literal(false).optional(),
});

const CONFIG_FILENAMES = ["aira.config.json", "aira.config.yaml", "aira.config.yml"];

/** Locate a config file starting from cwd (does not walk up directories on purpose — explicit is better). */
export function resolveConfigPath(explicitPath?: string): string {
  if (explicitPath) {
    const p = resolve(process.cwd(), explicitPath);
    if (!existsSync(p)) {
      throw new AiraError(`Config file not found at ${p}`);
    }
    return p;
  }

  for (const filename of CONFIG_FILENAMES) {
    const p = resolve(process.cwd(), filename);
    if (existsSync(p)) return p;
  }

  throw new AiraError(
    "No aira.config.json/yaml found in this directory. Run `aira init` to create one.",
  );
}

export function loadConfig(explicitPath?: string): AiraConfig {
  const path = resolveConfigPath(explicitPath);
  const raw = readFileSync(path, "utf-8");
  const ext = extname(path);

  let parsed: unknown;
  try {
    parsed = ext === ".json" ? JSON.parse(raw) : yaml.load(raw);
  } catch (err) {
    throw new AiraError(`Failed to parse config at ${path}: ${(err as Error).message}`);
  }

  const result = configSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new AiraError(`Invalid aira.config file:\n${issues}`);
  }

  return result.data as AiraConfig;
}
