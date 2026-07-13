import gradient from "gradient-string";
import figlet from "figlet";
import chalk from "chalk";
import type { AiraConfig } from "../types/config.js";
import { resolveTheme } from "../themes/default.js";

/** Prints the branded ASCII/gradient banner shown when a generated CLI runs with no args. */
export function renderBanner(config: AiraConfig): string {
  const theme = resolveTheme(config.theme);
  const title = config.displayName ?? config.name;

  if (theme.logo === "none") {
    return chalk.bold(title);
  }

  const ascii = figlet.textSync(title, { font: "Standard" });
  if (theme.logo === "figlet") {
    return gradient(theme.gradient)(ascii);
  }

  // "gradient" (default): gradient text banner, lighter weight than full figlet
  return gradient(theme.gradient).multiline(
    `${ascii}\n${chalk.dim(config.description ?? "")}`,
  );
}

/** Aira CLI Kit's own framework banner (shown by `aira` itself, not generated CLIs). */
export function renderAiraBanner(): string {
  const ascii = figlet.textSync("AIRA", { font: "Standard" });
  return gradient(["#7C5CFF", "#00D4FF"]).multiline(ascii) + chalk.dim("\n  CLI Kit — turn any AI API into a CLI\n");
}
