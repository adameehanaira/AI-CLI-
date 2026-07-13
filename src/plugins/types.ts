import type { AiraConfig } from "../types/config.js";

/**
 * Contract every Aira plugin must implement. Plugins are plain npm packages
 * named `aira-plugin-<name>` (or a local path during development) that
 * default-export an object matching this interface.
 */
export interface AiraPlugin {
  name: string;
  description?: string;
  /** Called during `aira build`, before the CLI project is written to disk. */
  onBuild?: (config: AiraConfig) => void | Promise<void>;
  /** Called at runtime inside the generated CLI, before a command executes. */
  onCommand?: (commandName: string, args: unknown) => void | Promise<void>;
  /** Registers additional Commander commands onto the generated CLI. */
  registerCommands?: () => Array<{ name: string; description: string; action: (...args: unknown[]) => unknown }>;
}

export type PluginFactory = () => AiraPlugin | Promise<AiraPlugin>;
