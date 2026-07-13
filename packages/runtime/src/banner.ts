import gradient from "gradient-string";
import figlet from "figlet";
import chalk from "chalk";

export function printBanner(config: any) {
  const theme = config.theme ?? { logo: "gradient", gradient: ["#7C5CFF", "#00D4FF"] };
  const title = config.displayName ?? config.name;

  if (theme.logo === "none") {
    console.log(chalk.bold(title));
    return;
  }

  const ascii = figlet.textSync(title, { font: "Standard" });
  if (theme.logo === "figlet") {
    console.log(gradient(theme.gradient)(ascii));
  } else {
    console.log(gradient(theme.gradient).multiline(ascii));
  }
  if (config.description) console.log(chalk.dim(config.description));
  console.log();
}
