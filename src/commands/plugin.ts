import chalk from "chalk";
import { logger } from "../core/logger.js";
import { OFFICIAL_PLUGINS } from "../plugins/pluginManager.js";

export async function pluginListCommand() {
  logger.raw(chalk.bold("\nOfficial Aira plugins:\n"));
  for (const p of OFFICIAL_PLUGINS) {
    logger.raw(`  ${chalk.cyan(p.name.padEnd(24))} ${p.description}`);
  }
  logger.raw(chalk.dim("\nInstall with: npm install <plugin-name>"));
  logger.raw(chalk.dim('Then add it to aira.config.json under "plugins": [{ "name": "..." }]\n'));
}
