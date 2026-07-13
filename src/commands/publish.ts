import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ora from "ora";
import { loadConfig } from "../core/configLoader.js";
import { buildCli } from "../builders/cliBuilder.js";
import { logger } from "../core/logger.js";

const exec = promisify(execFile);

export async function publishCommand(options: { config?: string; dryRun?: boolean }) {
  const config = loadConfig(options.config);
  const spinner = ora("Building CLI for publish...").start();

  try {
    const { outDir } = await buildCli(config);
    spinner.succeed(`Built ${config.name}`);

    if (options.dryRun) {
      logger.info(`Dry run — skipping npm publish. Project ready at ${outDir}`);
      return;
    }

    const publishSpinner = ora(`Publishing ${config.name} to npm...`).start();
    await exec("npm", ["publish", "--access", "public"], { cwd: outDir });
    publishSpinner.succeed(`Published ${config.name} to npm`);
  } catch (err) {
    spinner.fail("Publish failed");
    logger.error((err as Error).message);
    logger.warn("Make sure you're logged in to npm (`npm login`) and the package name is available.");
    process.exitCode = 1;
  }
}
