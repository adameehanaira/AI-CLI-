import type { AiraConfig } from "../types/config.js";
import { DEFAULT_COMMANDS } from "../types/config.js";

/** Renders README.md for the generated CLI project. */
export function renderReadme(config: AiraConfig): string {
  const commands = config.commands?.length ? config.commands : DEFAULT_COMMANDS;
  const name = config.name;

  const commandDocs = commands
    .map((c) => `- \`${name} ${c.name}${c.interactive ? "" : " <input>"}\` — ${c.description}`)
    .join("\n");

  return `# ${config.displayName ?? name}

${config.description ?? `A CLI for ${name}, generated with [Aira CLI Kit](https://github.com/aira-group/aira-cli-kit).`}

## Install

\`\`\`bash
npm install -g ${name}
# or run without installing
npx ${name}
\`\`\`

## Usage

\`\`\`bash
${name} --help
\`\`\`

### Commands

${commandDocs}
- \`${name} doctor\` — Check environment, auth and connectivity

## Authentication

${
  config.auth && config.auth.type !== "none"
    ? `Set your API key before use:\n\n\`\`\`bash\nexport ${config.auth.envVar ?? `${name.toUpperCase()}_API_KEY`}="your-key-here"\n\`\`\`\n\nOr run \`${name} login\` to store it securely on this machine.`
    : "This CLI does not require authentication."
}

## Built with Aira CLI Kit

This CLI was generated from a single \`aira.config.json\` file using [Aira CLI Kit](https://github.com/aira-group/aira-cli-kit) — a framework by **Aira Group Of Technology** for turning any AI API into a production-ready CLI.

---

MIT License
`;
}
