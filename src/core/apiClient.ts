import axios, { type AxiosRequestConfig } from "axios";
import type { AiraConfig, AuthConfig } from "../types/config.js";
import { getSecret } from "./secureStore.js";
import { AiraError } from "./errors.js";

/** Builds an authenticated axios instance from an Aira config's auth block. */
export function buildAuthHeaders(auth: AuthConfig | undefined, cliName: string): Record<string, string> {
  if (!auth || auth.type === "none") return {};

  const envVar = auth.envVar ?? `${cliName.toUpperCase().replace(/-/g, "_")}_API_KEY`;
  const secret = process.env[envVar] ?? getSecret(cliName);

  if (!secret) {
    throw new AiraError(
      `Missing API key for "${cliName}". Set the ${envVar} environment variable, or run "${cliName} login".`,
      "AIRA_AUTH_MISSING",
    );
  }

  switch (auth.type) {
    case "bearer":
      return { [auth.header ?? "Authorization"]: `${auth.prefix ?? "Bearer "}${secret}` };
    case "api-key":
      return { [auth.header ?? "x-api-key"]: secret };
    case "basic":
      return { [auth.header ?? "Authorization"]: `Basic ${Buffer.from(secret).toString("base64")}` };
    default:
      return {};
  }
}

export interface CallOptions {
  config: AiraConfig;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  extraHeaders?: Record<string, string>;
}

/** Generic call used by every generated command to reach the developer's AI API. */
export async function callApi({ config, endpoint, method = "POST", body, extraHeaders }: CallOptions) {
  const url = endpoint
    ? endpoint.startsWith("http")
      ? endpoint
      : new URL(endpoint, config.api).toString()
    : config.api;

  const headers = {
    "Content-Type": "application/json",
    ...buildAuthHeaders(config.auth, config.name),
    ...extraHeaders,
  };

  const requestConfig: AxiosRequestConfig = { url, method, headers, data: body };

  try {
    const response = await axios.request(requestConfig);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      throw new AiraError(`API request failed (${status ?? "network"}): ${detail}`, "AIRA_API_ERROR");
    }
    throw err;
  }
}

/** Extracts a value from a JSON response using a dot-path, e.g. "choices.0.message.content". */
export function extractByPath(data: unknown, path?: string): unknown {
  if (!path) return data;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return acc;
    return (acc as Record<string, unknown>)[key];
  }, data);
}
