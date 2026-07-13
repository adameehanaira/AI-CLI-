/** The starter config written by `aira init`. */
export const exampleConfig = {
  "$schema": "https://raw.githubusercontent.com/aira-group/aira-cli-kit/main/schema/aira.config.schema.json",
  "name": "my-ai-cli",
  "displayName": "My AI CLI",
  "description": "An AI-powered command line assistant.",
  "version": "0.1.0",
  "provider": "custom",
  "api": "https://api.example.com/v1/chat",
  "auth": {
    "type": "bearer",
    "envVar": "MY_AI_CLI_API_KEY"
  },
  "commands": [
    {
      "name": "chat",
      "description": "Start an interactive chat session",
      "method": "POST",
      "interactive": true,
      "requestTemplate": { "message": "{{input}}" },
      "responsePath": "reply",
      "renderMarkdown": true
    },
    {
      "name": "summarize",
      "description": "Summarize a block of text",
      "method": "POST",
      "endpoint": "/summarize",
      "requestTemplate": { "text": "{{input}}" },
      "responsePath": "summary"
    }
  ],
  "plugins": [],
  "theme": {
    "primaryColor": "#7C5CFF",
    "gradient": ["#7C5CFF", "#00D4FF"],
    "logo": "gradient"
  }
};
