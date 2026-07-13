/**
 * Aira CLI Kit — Core configuration schema.
 *
 * This is the single file a developer needs to author (aira.config.json / .yaml)
 * to describe their AI API and have Aira generate a full CLI application from it.
 */

export type ProviderType =
  | "openai"
  | "anthropic"
  | "custom"
  | "ollama"
  | "huggingface";

export type AuthType = "bearer" | "api-key" | "basic" | "none";

export interface AuthConfig {
  type: AuthType;
  header?: string; // e.g. "Authorization" or "x-api-key"
  envVar?: string; // e.g. "OPENHANDS_API_KEY"
  prefix?: string; // e.g. "Bearer "
}

export interface CommandParam {
  name: string;
  flag: string; // e.g. "--file <path>"
  description: string;
  required?: boolean;
  default?: string | number | boolean;
}

export type AgentTool = "read_file" | "write_file" | "edit_file" | "list_files";

export interface CommandDefinition {
  name: string; // becomes `<cli> <name>`
  description: string;
  endpoint?: string; // path appended to base api, or full URL
  method?: "GET" | "POST" | "PUT" | "DELETE";
  streaming?: boolean;
  requestTemplate?: Record<string, unknown>; // body template, supports {{input}} interpolation
  responsePath?: string; // dot-path into JSON response to extract, e.g. "choices.0.message.content"
  params?: CommandParam[];
  interactive?: boolean; // opens a REPL-style chat loop
  renderMarkdown?: boolean;
  history?: boolean; // Enable chat history for interactive command
  /**
   * Local filesystem abilities this command's AI is allowed to request.
   * Every write/edit action still requires an explicit "yes" from the user
   * at runtime — this list only controls which action types are even
   * offered, not whether they run without confirmation.
   */
  tools?: AgentTool[];
}

export interface PluginRef {
  name: string;
  options?: Record<string, unknown>;
}

export interface ThemeConfig {
  name?: string;
  primaryColor?: string;
  gradient?: [string, string];
  logo?: "figlet" | "gradient" | "none";
}

export interface AiraConfig {
  $schema?: string;
  name: string; // becomes the generated binary name, e.g. "openhands"
  displayName?: string;
  description?: string;
  version?: string;
  provider: ProviderType;
  api: string; // base URL for the AI API
  auth?: AuthConfig;
  commands?: CommandDefinition[];
  plugins?: PluginRef[];
  theme?: ThemeConfig;
  outDir?: string; // where the generated CLI project is written
  telemetry?: false; // Aira never enables telemetry by default; explicit opt-in only
}

/** Sensible defaults merged with whatever the user supplies. */
export const DEFAULT_COMMANDS: CommandDefinition[] = [
  {
    name: "chat",
    description: "Start an interactive chat session",
    method: "POST",
    interactive: true,
    streaming: false,
    responsePath: "reply",
    renderMarkdown: true,
  },
];

export const DEFAULT_THEME: Required<ThemeConfig> = {
  name: "default",
  primaryColor: "#7C5CFF",
  gradient: ["#7C5CFF", "#00D4FF"],
  logo: "gradient",
};
