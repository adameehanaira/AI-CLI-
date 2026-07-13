#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init.js";
import { buildCommand } from "./commands/build.js";
import { devCommand } from "./commands/dev.js";
import { doctorCommand } from "./commands/doctor.js";
import { configCommand } from "./commands/config.js";
import { pluginListCommand } from "./commands/plugin.js";
import { publishCommand } from "./commands/publish.js";
import { loginCommand, logoutCommand } from "./commands/auth.js";
import { updateCommand } from "./commands/update.js";
import { renderAiraBanner } from "./utils/banner.js";
import { logger } from "./core/logger.js";
import { AiraError } from "./core/errors.js";

const program = new Command();

program
  .name("aira")
  .description("Turn any AI API into a professional, cross-platform CLI application.")
  .version("0.1.0")
  .option("-q, --quiet", "suppress non-essential output");

program.hook("preAction", (thisCommand) => {
  logger.setQuiet(Boolean(thisCommand.opts().quiet));
});

program
  .command("init")
  .description("Create a new aira.config.json interactively")
  .action(initCommand);

program
  .command("build")
  .description("Generate a complete CLI project from aira.config")
  .option("-c, --config <path>", "path to config file")
  .action(buildCommand);

program
  .command("dev")
  .description("Rebuild the generated CLI automatically as you edit the config")
  .option("-c, --config <path>", "path to config file")
  .action(devCommand);

program
  .command("doctor")
  .description("Diagnose environment, auth and API connectivity issues")
  .option("-c, --config <path>", "path to config file")
  .action(doctorCommand);

program
  .command("config")
  .description("Show or validate the current aira.config")
  .argument("[action]", "show | validate", "show")
  .option("-c, --config <path>", "path to config file")
  .action((action, options) => configCommand(action, options));

const pluginCmd = program.command("plugin").description("Manage Aira plugins");
pluginCmd.command("list").description("List official plugins").action(pluginListCommand);

program
  .command("publish")
  .description("Build and publish the generated CLI to npm")
  .option("-c, --config <path>", "path to config file")
  .option("--dry-run", "build without publishing")
  .action(publishCommand);

program
  .command("login")
  .description("Securely store an API key for the configured CLI")
  .option("-c, --config <path>", "path to config file")
  .action(loginCommand);

program
  .command("logout")
  .description("Remove stored credentials for the configured CLI")
  .option("-c, --config <path>", "path to config file")
  .action(logoutCommand);

program
  .command("update")
  .description("Update Aira CLI Kit to the latest version")
  .action(updateCommand);

program.on("command:*", (operands) => {
  logger.error(`Unknown command "${operands[0]}". Run ${chalk.cyan("aira help")} to see available commands.`);
  process.exitCode = 1;
});

async function main() {
  if (process.argv.length <= 2) {
    console.log(renderAiraBanner());
    program.outputHelp();
    return;
  }

  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof AiraError) {
      logger.error(err.message);
      if (err.hint) logger.raw(chalk.dim(`  Hint: ${err.hint}`));
    } else {
      logger.error((err as Error).message ?? String(err));
    }
    process.exitCode = 1;
  }
}

void main();
