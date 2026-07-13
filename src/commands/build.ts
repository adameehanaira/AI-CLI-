import ora from "ora";
import { loadConfig } from "../core/configLoader.js";
import { buildCli } from "../builders/cliBuilder.js";
import { logger } from "../core/logger.js";

export async function buildCommand(options: { config?: string }) {
  const spinner = ora("Reading configuration...").start();
  try {
    const config = loadConfig(options.config);
    spinner.text = `Generating CLI "${config.name}"...`;
    const result = await buildCli(config);
    spinner.succeed(`Built ${result.files.length} files → ${result.outDir}`);
    logger.raw(`\nTry it:\n  cd ${result.outDir} && npm install && node bin/index.js --help\n`);
  } catch (err) {
    spinner.fail("Build failed");
    logger.error((err as Error).message);
    process.exitCode = 1;
  }
}
