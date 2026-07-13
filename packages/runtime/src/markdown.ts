import { marked } from "marked";
// @ts-expect-error - no types shipped for marked-terminal
import TerminalRenderer from "marked-terminal";

marked.setOptions({ renderer: new TerminalRenderer() });

export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}
