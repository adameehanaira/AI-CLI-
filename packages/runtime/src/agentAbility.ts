import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import inquirer from "inquirer";
import chalk from "chalk";
import type { AgentTool } from "./types.js";

/**
 * File access abilities available to a generated CLI's AI when the command
 * config allows them (`tools: ["read_file", "write_file", ...]`).
 *
 * Safety rules, enforced here — not left to the AI or the developer's API:
 *   1. Every path is resolved against process.cwd() and MUST stay inside it.
 *      No "../../etc/passwd" style escapes, no absolute paths outside cwd.
 *   2. write_file and edit_file ALWAYS show a preview and ask for a typed
 *      confirmation before touching disk. There is no "auto-approve" mode.
 *   3. read_file and list_files don't need confirmation (they can't change
 *      anything) but every action is echoed to the terminal so the user can
 *      see exactly what the agent looked at or touched.
 */

export class AgentPermissionError extends Error {}

function resolveSafePath(userPath: string): string {
  const target = resolve(process.cwd(), userPath);
  const rel = relative(process.cwd(), target);

  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new AgentPermissionError(
      `Refusing to access "${userPath}" — it's outside the current project directory.`,
    );
  }
  return target;
}

function assertAllowed(tool: AgentTool, allowed: AgentTool[] | undefined) {
  if (!allowed?.includes(tool)) {
    throw new AgentPermissionError(
      `The "${tool}" ability isn't enabled for this command. Add it to "tools" in aira.config.json to allow it.`,
    );
  }
}

export interface AgentAction {
  type: AgentTool;
  path: string;
  content?: string;      // for write_file
  find?: string;          // for edit_file
  replace?: string;       // for edit_file
}

export interface AgentActionResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

async function confirm(message: string): Promise<boolean> {
  const { proceed } = await inquirer.prompt([
    { type: "confirm", name: "proceed", message, default: false },
  ]);
  return proceed;
}

export async function runAgentAction(
  action: AgentAction,
  allowedTools: AgentTool[] | undefined,
): Promise<AgentActionResult> {
  assertAllowed(action.type, allowedTools);
  const safePath = resolveSafePath(action.path);

  switch (action.type) {
    case "list_files": {
      if (!existsSync(safePath) || !statSync(safePath).isDirectory()) {
        return { ok: false, message: `Not a directory: ${action.path}` };
      }
      const entries = readdirSync(safePath);
      console.log(chalk.dim(`  📂 listed ${action.path} (${entries.length} entries)`));
      return { ok: true, message: `Listed ${entries.length} entries`, data: entries };
    }

    case "read_file": {
      if (!existsSync(safePath)) {
        return { ok: false, message: `File not found: ${action.path}` };
      }
      const content = readFileSync(safePath, "utf-8");
      console.log(chalk.dim(`  📖 read ${action.path} (${content.length} chars)`));
      return { ok: true, message: `Read ${action.path}`, data: content };
    }

    case "write_file": {
      const exists = existsSync(safePath);
      console.log(
        chalk.yellow(`\n  ✎ The agent wants to ${exists ? "overwrite" : "create"}: ${action.path}`),
      );
      console.log(chalk.dim("  ── preview ──"));
      console.log(chalk.dim((action.content ?? "").slice(0, 800)));
      console.log(chalk.dim("  ─────────────\n"));

      const approved = await confirm(`Allow writing to "${action.path}"?`);
      if (!approved) {
        return { ok: false, message: "Denied by user." };
      }

      writeFileSync(safePath, action.content ?? "", "utf-8");
      console.log(chalk.green(`  ✔ wrote ${action.path}`));
      return { ok: true, message: `Wrote ${action.path}` };
    }

    case "edit_file": {
      if (!existsSync(safePath)) {
        return { ok: false, message: `File not found: ${action.path}` };
      }
      const original = readFileSync(safePath, "utf-8");
      if (!action.find || !original.includes(action.find)) {
        return { ok: false, message: `Text to replace was not found in ${action.path}` };
      }

      const updated = original.replace(action.find, action.replace ?? "");
      console.log(chalk.yellow(`\n  ✎ The agent wants to edit: ${action.path}`));
      console.log(chalk.red(`  - ${action.find.slice(0, 200)}`));
      console.log(chalk.green(`  + ${(action.replace ?? "").slice(0, 200)}\n`));

      const approved = await confirm(`Allow this edit to "${action.path}"?`);
      if (!approved) {
        return { ok: false, message: "Denied by user." };
      }

      writeFileSync(safePath, updated, "utf-8");
      console.log(chalk.green(`  ✔ edited ${action.path}`));
      return { ok: true, message: `Edited ${action.path}` };
    }

    default:
      return { ok: false, message: `Unknown tool: ${action.type}` };
  }
}

/**
 * Looks for a fenced ```agent-action JSON block in an AI response and parses
 * it, so developer APIs can request a file action using a simple convention
 * instead of a bespoke protocol:
 *
 *   ```agent-action
 *   { "type": "write_file", "path": "hello.py", "content": "print('hi')" }
 *   ```
 */
export function extractAgentAction(text: string): AgentAction | null {
  const match = text.match(/```agent-action\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed?.type && parsed?.path) return parsed as AgentAction;
  } catch {
    // Malformed block — ignore rather than crash the CLI on a bad API response.
  }
  return null;
}
