import chalk from "chalk";
import axios from "axios";
import { getStoredSecret } from "./secureStore.js";

export async function doctorCheck(config: any) {
  console.log(chalk.bold(`\n${config.name} doctor\n`));
  const checks: Array<{ label: string; pass: boolean }> = [];

  checks.push({ label: "Node.js >= 18", pass: parseInt(process.versions.node, 10) >= 18 });

  if (config.auth && config.auth.type !== "none") {
    const envVar = config.auth.envVar ?? `${config.name.toUpperCase()}_API_KEY`;
    checks.push({ label: `Auth key present (${envVar})`, pass: Boolean(process.env[envVar] ?? getStoredSecret(config.name)) });
  }

  try {
    await axios.head(config.api, { timeout: 4000, validateStatus: () => true });
    checks.push({ label: "API reachable", pass: true });
  } catch {
    checks.push({ label: "API reachable", pass: false });
  }

  for (const c of checks) console.log(`  ${c.pass ? chalk.green("✔") : chalk.red("✖")} ${c.label}`);
  console.log();
}
