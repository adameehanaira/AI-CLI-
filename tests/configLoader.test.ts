import { describe, it, expect } from "vitest";
import { configSchema } from "../src/core/configLoader.js";

describe("configSchema", () => {
  it("accepts a minimal valid config", () => {
    const result = configSchema.safeParse({
      name: "my-cli",
      provider: "custom",
      api: "https://api.example.com/chat",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid name", () => {
    const result = configSchema.safeParse({
      name: "My CLI!",
      provider: "custom",
      api: "https://api.example.com/chat",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-URL api field", () => {
    const result = configSchema.safeParse({
      name: "my-cli",
      provider: "custom",
      api: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
