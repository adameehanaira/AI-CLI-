import inquirer from "inquirer";
import { loadConfig } from "../core/configLoader.js";
import { setSecret, clearSecret } from "../core/secureStore.js";
import { logger } from "../core/logger.js";

export async function loginCommand(options: { config?: string }) {
  const config = loadConfig(options.config);

  if (!config.auth || config.auth.type === "none") {
    logger.info(`${config.name} does not require authentication.`);
    return;
  }

  const { apiKey } = await inquirer.prompt([
    { type: "password", name: "apiKey", message: `Enter API key for ${config.name}:`, mask: "*" },
  ]);

  setSecret(config.name, apiKey);
  logger.success(`Credentials saved securely for ${config.name}.`);
}

export async function logoutCommand(options: { config?: string }) {
  const config = loadConfig(options.config);
  clearSecret(config.name);
  logger.success(`Credentials cleared for ${config.name}.`);
}
