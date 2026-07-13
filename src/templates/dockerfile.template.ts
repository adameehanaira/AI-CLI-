import type { AiraConfig } from "../types/config.js";

export function renderDockerfile(config: AiraConfig): string {
  return `FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev
ENTRYPOINT ["node", "bin/index.js"]
# Usage: docker run --rm -e ${config.auth?.envVar ?? config.name.toUpperCase() + "_API_KEY"}=xxx ${config.name} chat "hello"
`;
}
