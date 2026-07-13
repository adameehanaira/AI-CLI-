import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import axios from "axios";
import { renderMarkdown } from "./markdown.js";
import { getStoredSecret } from "./secureStore.js";
import { extractAgentAction, runAgentAction, AgentPermissionError } from "./agentAbility.js";

function buildHeaders(config: any): Record<string, string> {
  const auth = config.auth;
  if (!auth || auth.type === "none") return { "Content-Type": "application/json" };
  const envVar = auth.envVar ?? `${config.name.toUpperCase().replace(/-/g, "_")}_API_KEY`;
  const secret = process.env[envVar] ?? getStoredSecret(config.name);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    if (auth.type === "bearer") headers[auth.header ?? "Authorization"] = `${auth.prefix ?? "Bearer "}${secret}`;
    else if (auth.type === "api-key") headers[auth.header ?? "x-api-key"] = secret;
  }
  return headers;
}

/** Starts an interactive REPL-style chat loop against the configured AI API. */
export async function startChatRepl(config: any, cmd: any, _opts: Record<string, unknown>) {
  console.log(chalk.dim(`Chatting with ${config.displayName ?? config.name}. Type "exit" to quit.`));
  console.log(chalk.dim(`Type "clear" to clear chat history.\n`));

  if (cmd.tools?.length) {
    console.log(
      chalk.dim(`  Agent abilities enabled: ${cmd.tools.join(", ")} — writes/edits always ask for confirmation.\n`),
    );
  }

  const history: { role: string; content: string }[] = [];
  const hasHistoryPlaceholder = cmd.requestTemplate
    ? (JSON.stringify(cmd.requestTemplate).includes('"{{history}}"') || JSON.stringify(cmd.requestTemplate).includes('"{{messages}}"'))
    : false;
  const useHistory = cmd.history || hasHistoryPlaceholder;

  while (true) {
    const { message } = await inquirer.prompt([{ type: "input", name: "message", message: chalk.cyan("you ›") }]);
    if (!message) continue;
    if (message.trim().toLowerCase() === "exit") break;
    if (message.trim().toLowerCase() === "clear" || message.trim().toLowerCase() === "/clear") {
      history.length = 0;
      console.log(chalk.yellow("Chat history cleared.\n"));
      continue;
    }

    if (useHistory) {
      history.push({ role: "user", content: message });
    }

    const spinner = ora("thinking...").start();
    try {
      let body: any;
      if (cmd.requestTemplate) {
        let templateStr = JSON.stringify(cmd.requestTemplate);
        templateStr = templateStr.replace(/\{\{input\}\}/g, message.replace(/"/g, '\\"').replace(/\n/g, '\\n'));
        if (templateStr.includes('"{{history}}"') || templateStr.includes('"{{messages}}"')) {
          templateStr = templateStr
            .replace(/"\{\{history\}\}"/g, JSON.stringify(history))
            .replace(/"\{\{messages\}\}"/g, JSON.stringify(history));
          body = JSON.parse(templateStr);
        } else {
          body = JSON.parse(templateStr);
          if (cmd.history) {
            if ("messages" in body) {
              body.messages = history;
            } else if ("history" in body) {
              body.history = history;
            } else {
              body.history = history;
            }
          }
        }
      } else {
        body = cmd.history ? { message, history } : { message };
      }

      const url = cmd.endpoint
        ? cmd.endpoint.startsWith("http") ? cmd.endpoint : new URL(cmd.endpoint, config.api).toString()
        : config.api;

      const response = await axios.request({ url, method: cmd.method ?? "POST", headers: buildHeaders(config), data: body });
      const path = cmd.responsePath ?? "reply";
      const reply = path.split(".").reduce((acc: any, key: string) => acc?.[key], response.data) ?? response.data;
      spinner.stop();

      const text = typeof reply === "string" ? reply : JSON.stringify(reply);
      console.log(chalk.magenta(`${config.name} ›`), cmd.renderMarkdown ? renderMarkdown(text) : text, "\n");

      if (useHistory) {
        history.push({ role: "assistant", content: text });
      }

      // If file abilities are enabled for this command, check whether the AI's
      // reply requested a file action, and — only after explicit confirmation
      // inside runAgentAction — carry it out.
      if (cmd.tools?.length) {
        const action = extractAgentAction(text);
        if (action) {
          try {
            const result = await runAgentAction(action, cmd.tools);
            console.log(chalk.dim(`  → ${result.message}\n`));
          } catch (err) {
            if (err instanceof AgentPermissionError) {
              console.log(chalk.red(`  ✖ ${err.message}\n`));
            } else {
              throw err;
            }
          }
        }
      }
    } catch (err: any) {
      spinner.fail("Request failed");
      console.error(chalk.red(err.message));
    }
  }
}
