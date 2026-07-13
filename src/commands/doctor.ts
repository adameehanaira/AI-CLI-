import chalk from "chalk";
import { loadConfig } from "../core/configLoader.js";
import { getSecret } from "../core/secureStore.js";
import { logger } from "../core/logger.js";
import axios from "axios";

export async function doctorCommand(options: { config?: string }) {
  logger.raw(chalk.bold("\nAira Doctor\n"));
  const checks: Array<{ label: string; pass: boolean; detail?: string }> = [];

  checks.push({ label: "Node.js version", pass: parseInt(process.versions.node, 10) >= 18, detail: process.version });

  let config;
  try {
    config = loadConfig(options.config);
    checks.push({ label: "aira.config found & valid", pass: true, detail: config.name });
  } catch (err) {
    checks.push({ label: "aira.config found & valid", pass: false, detail: (err as Error).message });
  }

  if (config?.auth && config.auth.type !== "none") {
    const envVar = config.auth.envVar ?? `${config.name.toUpperCase()}_API_KEY`;
    const hasKey = Boolean(process.env[envVar] ?? getSecret(config.name));
    checks.push({ label: `Auth key present (${envVar})`, pass: hasKey });
  }

  if (config?.api) {
    try {
      await axios.head(config.api, { timeout: 4000, validateStatus: () => true });
      checks.push({ label: "API endpoint reachable", pass: true, detail: config.api });
    } catch {
      checks.push({ label: "API endpoint reachable", pass: false, detail: config.api });
    }
  }

  for (const check of checks) {
    const icon = check.pass ? chalk.green("✔") : chalk.red("✖");
    logger.raw(`  ${icon} ${check.label}${check.detail ? chalk.dim(`  (${check.detail})`) : ""}`);
  }

  const failed = checks.filter((c) => !c.pass).length;
  logger.raw("");
  if (failed === 0) logger.success("All checks passed.");
  else logger.warn(`${failed} check(s) need attention.`);
}
