import type { PluginRef } from "../types/config.js";
import type { AiraPlugin } from "./types.js";
import { logger } from "../core/logger.js";
import { AiraError } from "../core/errors.js";

/**
 * Resolves configured plugins to their implementations. Official plugins ship
 * under the `aira-plugin-*` naming convention on npm; this loader also
 * supports local file paths for plugin development (`./my-plugin.js`).
 */
export async function loadPlugins(refs: PluginRef[]): Promise<AiraPlugin[]> {
  const plugins: AiraPlugin[] = [];

  for (const ref of refs) {
    const moduleName = ref.name.startsWith(".") || ref.name.startsWith("/")
      ? ref.name
      : ref.name.startsWith("aira-plugin-")
        ? ref.name
        : `aira-plugin-${ref.name}`;

    try {
      const mod = await import(moduleName);
      const plugin: AiraPlugin = mod.default ?? mod;
      if (!plugin?.name) {
        throw new AiraError(`Plugin "${moduleName}" does not export a valid AiraPlugin`);
      }
      logger.step(`Loaded plugin: ${plugin.name}`);
      plugins.push(plugin);
    } catch (err) {
      throw new AiraError(
        `Failed to load plugin "${moduleName}": ${(err as Error).message}`,
        "AIRA_PLUGIN_LOAD_FAILED",
        `Make sure it's installed: npm install ${moduleName}`,
      );
    }
  }

  return plugins;
}

/** Known first-party plugins, kept as a registry for `aira plugin list`. */
export const OFFICIAL_PLUGINS = [
  { name: "aira-plugin-image", description: "Image generation commands" },
  { name: "aira-plugin-vision", description: "Vision / image understanding" },
  { name: "aira-plugin-ocr", description: "OCR text extraction" },
  { name: "aira-plugin-voice", description: "Voice input/output" },
  { name: "aira-plugin-translate", description: "Translation commands" },
  { name: "aira-plugin-rag", description: "Retrieval augmented generation helpers" },
  { name: "aira-plugin-pdf", description: "PDF reading/generation" },
  { name: "aira-plugin-email", description: "Send results via email" },
  { name: "aira-plugin-db", description: "Query databases from the CLI" },
  { name: "aira-plugin-websearch", description: "Web search augmented answers" },
];
