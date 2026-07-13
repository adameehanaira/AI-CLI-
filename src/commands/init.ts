import inquirer from "inquirer";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { logger } from "../core/logger.js";
import { exampleConfig } from "../templates/exampleConfig.template.js";

export async function initCommand() {
  const target = join(process.cwd(), "aira.config.json");

  if (existsSync(target)) {
    const { overwrite } = await inquirer.prompt([
      { type: "confirm", name: "overwrite", message: "aira.config.json already exists. Overwrite?", default: false },
    ]);
    if (!overwrite) {
      logger.warn("Aborted — existing config left untouched.");
      return;
    }
  }

  const answers = await inquirer.prompt([
    { type: "input", name: "name", message: "CLI binary name (lowercase, no spaces):", default: "my-ai-cli" },
    { type: "input", name: "displayName", message: "Display name:", default: "My AI CLI" },
    { type: "input", name: "description", message: "Short description:", default: "An AI-powered command line assistant." },
    { type: "input", name: "api", message: "Base API URL:", default: "https://api.example.com/v1/chat" },
    {
      type: "list",
      name: "provider",
      message: "Provider type:",
      choices: ["custom", "openai", "anthropic", "ollama", "huggingface"],
    },
    {
      type: "list",
      name: "authType",
      message: "Authentication type:",
      choices: ["bearer", "api-key", "basic", "none"],
    },
  ]);

  const config = {
    ...exampleConfig,
    name: answers.name,
    displayName: answers.displayName,
    description: answers.description,
    provider: answers.provider,
    api: answers.api,
    auth:
      answers.authType === "none"
        ? { type: "none" }
        : { type: answers.authType, envVar: `${answers.name.toUpperCase().replace(/-/g, "_")}_API_KEY` },
  };

  writeFileSync(target, JSON.stringify(config, null, 2) + "\n", "utf-8");
  logger.success(`Created ${chalk.bold("aira.config.json")}`);
  logger.raw(chalk.dim("\nNext steps:"));
  logger.raw(`  ${chalk.cyan("aira dev")}      Preview your CLI locally`);
  logger.raw(`  ${chalk.cyan("aira build")}    Generate the full CLI project`);
  logger.raw(`  ${chalk.cyan("aira publish")}  Publish it to npm\n`);
}
