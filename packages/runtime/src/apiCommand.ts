import axios from "axios";
import ora from "ora";
import chalk from "chalk";
import { getStoredSecret } from "./secureStore.js";
import { renderMarkdown } from "./markdown.js";

function interpolate(template: unknown, values: Record<string, string>): unknown {
  if (typeof template === "string") return template.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? "");
  if (Array.isArray(template)) return template.map((t) => interpolate(t, values));
  if (template && typeof template === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(template)) out[k] = interpolate(v, values);
    return out;
  }
  return template;
}

function extractByPath(data: unknown, path?: string): unknown {
  if (!path) return data;
  return path.split(".").reduce<unknown>((acc, key) => (acc == null ? acc : (acc as any)[key]), data);
}

function buildHeaders(config: any): Record<string, string> {
  const auth = config.auth;
  if (!auth || auth.type === "none") return { "Content-Type": "application/json" };

  const envVar = auth.envVar ?? `${config.name.toUpperCase().replace(/-/g, "_")}_API_KEY`;
  const secret = process.env[envVar] ?? getStoredSecret(config.name);
  if (!secret) {
    console.error(chalk.red("✖"), `Missing API key. Set ${envVar} or run "${config.name} login".`);
    process.exit(1);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth.type === "bearer") headers[auth.header ?? "Authorization"] = `${auth.prefix ?? "Bearer "}${secret}`;
  else if (auth.type === "api-key") headers[auth.header ?? "x-api-key"] = secret;
  else if (auth.type === "basic") headers[auth.header ?? "Authorization"] = `Basic ${Buffer.from(secret).toString("base64")}`;
  return headers;
}

export async function runApiCommand(config: any, cmd: any, input: string, opts: Record<string, unknown>) {
  const spinner = ora(`Running ${cmd.name}...`).start();
  try {
    const url = cmd.endpoint
      ? cmd.endpoint.startsWith("http") ? cmd.endpoint : new URL(cmd.endpoint, config.api).toString()
      : config.api;

    const body = cmd.requestTemplate
      ? interpolate(cmd.requestTemplate, { input, ...opts })
      : { input };

    const response = await axios.request({
      url,
      method: cmd.method ?? "POST",
      headers: buildHeaders(config),
      data: body,
    });

    const result = extractByPath(response.data, cmd.responsePath);
    spinner.stop();

    const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
    console.log(cmd.renderMarkdown ? renderMarkdown(text) : text);
  } catch (err: any) {
    spinner.fail("Request failed");
    console.error(chalk.red(err.response?.data ? JSON.stringify(err.response.data) : err.message));
    process.exitCode = 1;
  }
}
