import chalk from "chalk";

/**
 * Centralized logger so output styling is consistent everywhere and can be
 * themed or silenced (e.g. `--quiet`, `--json`) from one place.
 */
class Logger {
  private quiet = false;

  setQuiet(value: boolean) {
    this.quiet = value;
  }

  info(message: string) {
    if (!this.quiet) console.log(chalk.cyan("info"), message);
  }

  success(message: string) {
    if (!this.quiet) console.log(chalk.green("✔"), message);
  }

  warn(message: string) {
    if (!this.quiet) console.log(chalk.yellow("⚠"), message);
  }

  error(message: string) {
    console.error(chalk.red("✖"), message);
  }

  step(message: string) {
    if (!this.quiet) console.log(chalk.magenta("→"), message);
  }

  raw(message: string) {
    console.log(message);
  }
}

export const logger = new Logger();
