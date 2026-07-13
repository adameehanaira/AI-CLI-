import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ora from "ora";
import { logger } from "../core/logger.js";

const exec = promisify(execFile);

export async function updateCommand() {
  const spinner = ora("Checking for updates...").start();
  try {
    await exec("npm", ["install", "-g", "aira-cli-kit@latest"]);
    spinner.succeed("Aira CLI Kit updated to the latest version.");
  } catch (err) {
    spinner.fail("Update failed");
    logger.error((err as Error).message);
    logger.warn("Try manually: npm install -g aira-cli-kit@latest");
  }
}
