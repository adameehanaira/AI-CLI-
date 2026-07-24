# Aira CLI Kit: A Fully Open-Source, Privacy-First Framework for Converting AI APIs into Secure Cross-Platform Terminal Applications

**Author:** Aira Group Of Technology
**Correspondence:** support@airaai.work.gd
**Project Repository:** Aira CLI Kit (`npm i -g aira-cli-kit`)

## Abstract

While command-line interface (CLI) tools are indispensable for modern software workflows, packaging and distributing custom AI models or APIs as standalone terminal utilities traditionally requires writing extensive boilerplate code. Furthermore, existing AI developer tools are frequently proprietary, closed-source, and bound to strict corporate ecosystems. This paper introduces Aira CLI Kit, a comprehensive, fully open-source framework designed to transform any AI API into a professional, cross-platform CLI application via a single declarative configuration file (`aira.config.json`). Aira features a modular multi-provider architecture supporting both local Large Language Models (LLMs) and major corporate APIs (OpenAI, Anthropic, Google), strict local-device data privacy, and a granular, opt-in permission engine for safe file management operations.

## Introduction and Motivation

The rapid adoption of Large Language Models has driven demand for terminal-integrated AI assistants. However, developers attempting to ship their own AI APIs as native CLIs face significant engineering friction:

- **Boilerplate Overhead:** Repeatedly implementing argument parsing, interactive chat loops, configuration management, and publishing workflows.
- **Vendor Lock-in and Closed Sources:** Major developer CLIs are closed-source, restricting customization, re-branding, and model choice.
- **Privacy and Security Risks:** Transmitting sensitive codebase contexts to centralized corporate servers often violates enterprise compliance and data sovereignty requirements.

To resolve these challenges, Aira CLI Kit provides a streamlined, developer-owned framework that abstracts distribution complexity while keeping data entirely under user control.

## System Architecture and Workflow

Aira CLI Kit decouples the CLI definition from the core execution engine through a clean build-time generation pipeline.

```
Step 1: aira.config.json (Declarative API Description)
    ↓ (aira build)
Step 2: Generated Standalone CLI (Commander Entry Point + Baked-In Config)

Branch A (Local Device Only): Local Chat Storage & History (Absolute Data Sovereignty)
Branch B (API Gateway): Local LLMs / OpenAI / Anthropic / Google
```

### 2.1 Declarative Configuration Model

Instead of writing imperative bootstrapping code, developers define their target CLI behavior in a single `aira.config.json` file. Running `aira build` compiles this configuration alongside a lightweight runtime (`@aira/runtime`) and commander into a standalone project inside `dist-cli/<name>/`, ready for `npm publish`.

### 2.2 Flexible Multi-Provider Integration

Aira supports an extensible provider model, allowing generated CLIs to communicate seamlessly with:

- **Local Models:** Ollama and custom local endpoints for offline and zero-cost workflows.
- **Corporate APIs:** High-performance commercial services including OpenAI, Anthropic, Google, and HuggingFace.

## Privacy-First Data Design and Chat History

Data sovereignty is a primary design constraint within Aira:

- **Zero Cloud Telemetry:** Aira collects no usage data or analytics by design.
- **Local Storage:** All interactive chat history and session states remain securely resident on the user's local device. Credentials stored via `aira login` are protected locally using AES-256-GCM encryption.

## Agent Capabilities: File Read, Write, and Edit Operations

To bridge the gap between simple chat tools and functional coding agents (similar to advanced developer utilities), Aira CLI Kit supports agent tools via configuration blocks. When enabled under command definitions, agents can perform file system interactions safely governed by strict runtime protections:

```json
{
  "name": "chat",
  "interactive": true,
  "tools": ["read_file", "write_file", "edit_file", "list_files"]
}
```

### 4.1 Supported Tools & Execution Flow

- **list_files / read_file:** Non-destructive operations that inspect directory structures or read file contents with clear terminal logging for user transparency.
- **write_file / edit_file:** Modification operations that generate text previews or diff blocks and strictly require explicit user confirmation (y/n) prior to disk writes.

### 4.2 Security Constraints

- **Path Containment:** File system actions are sandboxed within the current working directory (`process.cwd()`). Attempts to escape via absolute paths or directory traversal are blocked.
- **Mandatory Confirmation:** No automatic file overwrites are permitted; human-in-the-loop verification is enforced for all modification actions.

## Conclusion

Aira CLI Kit offers a scalable, transparent, and secure framework for developers aiming to commercialize or distribute custom AI APIs as native terminal software. By prioritizing full open-source availability, multi-provider flexibility, local-device privacy, and safety-guarded agent capabilities, Aira empowers developers to build independent, professional CLI ecosystems with minimal friction.

