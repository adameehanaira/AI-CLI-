import { DEFAULT_THEME } from "../types/config.js";
import type { ThemeConfig } from "../types/config.js";

export function resolveTheme(theme?: ThemeConfig): Required<ThemeConfig> {
  return { ...DEFAULT_THEME, ...theme };
}
