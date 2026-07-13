import { watch } from "node:fs";
import { resolveConfigPath, loadConfig } from "../core/configLoader.js";
import { buildCli } from "../builders/cliBuilder.js";
import { logger } from "../core/logger.js";

/** Rebuilds the generated CLI whenever aira.config.* changes — fast local iteration. */
export async function devCommand(options: { config?: string }) {
  const configPath = resolveConfigPath(options.config);

  const rebuild = async () => {
    try {
      const config = loadConfig(options.config);
      await buildCli(config);
    } catch (err) {
      logger.error((err as Error).message);
    }
  };

  await rebuild();
  logger.info(`Watching ${configPath} for changes... (Ctrl+C to stop)`);

  watch(configPath, { persistent: true }, () => {
    logger.step("Config changed, rebuilding...");
    void rebuild();
  });
}
