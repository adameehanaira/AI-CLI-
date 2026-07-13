import chalk from "chalk";
import { loadConfig } from "../core/configLoader.js";
import { logger } from "../core/logger.js";

export async function configCommand(action: "show" | "validate" = "show", options: { config?: string } = {}) {
  const config = loadConfig(options.config);

  if (action === "validate") {
    logger.success("Config is valid.");
    return;
  }

  logger.raw(chalk.bold(`\n${config.displayName ?? config.name}\n`));
  logger.raw(JSON.stringify(config, null, 2));
}
