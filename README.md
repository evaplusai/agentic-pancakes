# Agentics Foundation TV5 Hackathon

[![npm version](https://img.shields.io/npm/v/agentics-hackathon.svg)](https://www.npmjs.com/package/agentics-hackathon)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1234567890?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.agentics.org)
[![Google Cloud](https://img.shields.io/badge/Powered%20by-Google%20Cloud-4285F4?logo=google-cloud)](https://cloud.google.com)
[![Anthropic](https://img.shields.io/badge/Built%20with-Claude-orange)](https://anthropic.com)

<div align="center">

```
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗███████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝██╔════╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║██║     ███████╗
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██║     ╚════██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╗███████║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝╚══════╝
```

### 🚀 TV5 Hackathon - Supported by Google

**Building the Future of Agentic AI | Open Source | Global**

[Website](https://agentics.org/hackathon) · [Discord](https://discord.agentics.org) · [Documentation](#documentation) · [Get Started](#quick-start)

</div>

---

## 🎯 The Challenge

**Every night, millions spend up to 45 minutes deciding what to watch — billions of hours lost every day. Not from lack of content, but from fragmentation.**

Join the Agentics Foundation TV5 Hackathon to build agentic AI solutions that solve real problems. Powered by Google Cloud, Gemini, Claude, and the best open-source tools in the ecosystem.

## ✨ Features

- 🛠️ **Interactive Setup Wizard** - Get started in minutes with guided project initialization
- 🔧 **Tool Management** - Install and configure 17+ AI development tools with a single command
- 🤖 **MCP Server** - Model Context Protocol support for seamless AI integration (STDIO & SSE)
- 🎨 **Beautiful CLI** - Modern terminal UI with colors, spinners, and progress indicators
- 📦 **Zero Config** - Sensible defaults that just work
- 🌐 **Community Integration** - Direct links to Discord and resources
- 🔌 **Agentic Integration** - Full JSON output support for automation and AI agent workflows
- 🤫 **Quiet Mode** - Non-interactive operation for CI/CD and scripting

## 🚀 Quick Start

### One-Line Setup

```bash
npx agentics-hackathon init
```

This will:
1. Check your system prerequisites
2. Guide you through project setup
3. Help you select a hackathon track
4. Install your chosen development tools
5. Connect you with the community

### Global Installation (Optional)

```bash
npm install -g agentics-hackathon
hackathon init
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `npx agentics-hackathon init` | Initialize a new hackathon project |
| `npx agentics-hackathon tools` | Browse and install development tools |
| `npx agentics-hackathon status` | Check project configuration status |
| `npx agentics-hackathon info` | View hackathon details and resources |
| `npx agentics-hackathon mcp [stdio\|sse]` | Start the MCP server |
| `npx agentics-hackathon discord` | Join the community Discord |
| `npx agentics-hackathon help` | Detailed help & examples |

### Init Options

```bash
npx agentics-hackathon init [options]

Options:
  -f, --force           Force reinitialize existing project
  -y, --yes             Skip prompts, use defaults
  -t, --tools <tools>   Tools to install (space-separated)
  --track <track>       Select hackathon track
  --team <name>         Set team name
  --project <name>      Set project name
  --mcp                 Enable MCP server
  --json                Output result as JSON (implies --yes)
  -q, --quiet           Suppress non-essential output
```

### Tools Options

```bash
npx agentics-hackathon tools [options]

Options:
  -l, --list            List all available tools
  -c, --check           Check which tools are installed
  -i, --install <tools> Install specific tools
  --category <cat>      Filter by category
  --available           Alias for --list
  --json                Output result as JSON
  -q, --quiet           Suppress non-essential output

Categories: ai-assistants, orchestration, databases, cloud-platform, synthesis, python-frameworks
```

### Example Workflows

```bash
# Interactive setup (recommended for beginners)
npx agentics-hackathon init

# Quick setup with specific tools
npx agentics-hackathon init --tools claudeFlow geminiCli adk

# Check available tools
npx agentics-hackathon tools --list

# Install specific tools later
npx agentics-hackathon tools --install ruvector agentDb

# Start MCP server for AI integration
npx agentics-hackathon mcp sse --port 3000
```

## 🤖 Agentic Integration

All commands support `--json` output for seamless integration with AI agents and automation scripts.

### JSON Output Examples

```bash
# Get hackathon info as JSON
npx agentics-hackathon info --json

# List tools with installation status
npx agentics-hackathon tools --json

# Filter tools by category
npx agentics-hackathon tools --json --category orchestration

# Check installed tools
npx agentics-hackathon tools --check --json

# Initialize project non-interactively
npx agentics-hackathon init --json --project "my-agent" --team "AI Team" --track multi-agent-systems --mcp

# Get project status
npx agentics-hackathon status --json
```

### Example JSON Responses

**Info Command:**
```json
{
  "success": true,
  "hackathon": {
    "name": "Agentics Foundation TV5 Hackathon",
    "tagline": "Building the Future of Agentic AI",
    "sponsor": "Google Cloud"
  },
  "tracks": [...],
  "resources": {
    "website": "https://agentics.org/hackathon",
    "discord": "https://discord.agentics.org"
  }
}
```

**Tools Command:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "claudeFlow",
      "displayName": "Claude Flow",
      "category": "orchestration",
      "installed": true,
      "installCommand": "npx claude-flow@alpha init --force"
    }
  ],
  "categories": ["ai-assistants", "orchestration", "databases", ...]
}
```

### Automation Script Example

```bash
#!/bin/bash
# Example: Set up a new hackathon project programmatically

# Initialize project
result=$(npx agentics-hackathon init --json --project "agent-swarm" --track multi-agent-systems)

# Check if successful
if echo "$result" | jq -e '.success' > /dev/null; then
  echo "Project initialized successfully!"

  # Get available orchestration tools
  tools=$(npx agentics-hackathon tools --json --category orchestration)
  echo "Available tools: $(echo $tools | jq '.tools[].name')"
fi
```

## 🏆 Hackathon Tracks

### 🎬 Entertainment Discovery
Solve the 45-minute decision problem — help users find what to watch across fragmented content platforms.

### 🤝 Multi-Agent Systems
Build collaborative AI agents that work together using Google ADK and Vertex AI.

### ⚡ Agentic Workflows
Create autonomous workflows with Claude, Gemini, and orchestration tools.

### 💡 Open Innovation
Bring your own idea — any agentic AI solution that makes an impact.

## 🔧 Available Tools (17 Total)

### AI Assistants
| Tool | Description | Install |
|------|-------------|---------|
| **Claude Code CLI** | Anthropic's AI coding assistant | `npm i -g @anthropic-ai/claude-code` |
| **Google Gemini CLI** | Google's multimodal AI interface | `npm i -g @google/generative-ai-cli` |

### Orchestration & Agent Frameworks
| Tool | Description | Install |
|------|-------------|---------|
| **Claude Flow** | #1 agent orchestration - multi-agent swarms, 101 MCP tools | `npx claude-flow@alpha init --force` |
| **Agentic Flow** | Production AI orchestration - 66 agents, 213 MCP tools | `npx agentic-flow init` |
| **Flow Nexus** | Competitive agentic platform on MCP | `npx flow-nexus init` |
| **Google ADK** | Agent Development Kit | `pip install google-adk` |

### Databases & Memory
| Tool | Description | Install |
|------|-------------|---------|
| **RuVector** | Vector database & embeddings | `npm install ruvector` |
| **AgentDB** | Agentic AI state management | `npx agentdb init` |

### Synthesis & Advanced Tools
| Tool | Description | Install |
|------|-------------|---------|
| **Agentic Synth** | Synthesis tools for agentic AI | `npx @ruvector/agentic-synth init` |
| **Strange Loops** | Consciousness exploration SDK - emergent intelligence | `npx strange-loops init` |
| **SPARC 2.0** | Autonomous vector coding agent with MCP | `npx sparc init` |

### Cloud Platform
| Tool | Description | Install |
|------|-------------|---------|
| **Google Cloud CLI** | Full GCP SDK | [Installation Guide](https://cloud.google.com/sdk/docs/install) |
| **Vertex AI SDK** | ML platform SDK | `pip install google-cloud-aiplatform` |

### Python Frameworks
| Tool | Description | Install |
|------|-------------|---------|
| **LionPride** | Python agentic AI framework | `pip install lionpride` |
| **Agentic Framework** | Python framework for AI agents | `pip install agentic-framework` |
| **OpenAI Agents SDK** | Lightweight multi-agent workflows | `pip install openai-agents` |

## 🔌 MCP Server

The hackathon CLI includes a Model Context Protocol (MCP) server for AI integration.

### STDIO Transport

```bash
npx agentics-hackathon mcp stdio
```

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "hackathon": {
      "command": "npx",
      "args": ["agentics-hackathon", "mcp", "stdio"]
    }
  }
}
```

### SSE Transport

```bash
npx agentics-hackathon mcp sse --port 3000
```

Connect at `http://localhost:3000/sse`

### Available MCP Tools

- `get_hackathon_info` - Get hackathon information
- `get_tracks` - List available tracks
- `get_available_tools` - List development tools
- `get_project_status` - Check project configuration
- `check_tool_installed` - Verify tool installation
- `get_resources` - Get hackathon resources

## 📖 Documentation

- **[Agentics Foundation](https://agentics.org)** - Organization homepage
- **[Hackathon Page](https://agentics.org/hackathon)** - Event details
- **[Google ADK Docs](https://google.github.io/adk-docs/)** - Agent Development Kit
- **[Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)** - Google ML Platform
- **[Claude Docs](https://docs.anthropic.com)** - Anthropic documentation
- **[Gemini API](https://ai.google.dev/gemini-api/docs)** - Google AI documentation

## 🌐 Related Projects

Explore more tools from the ecosystem:

- **[RuVector](https://ruv.io/projects)** - Vector database toolkit
- **[AgentDB](https://ruv.io/projects)** - Agent state management
- **[Agentic Synth](https://ruv.io/projects)** - AI synthesis tools
- **[Claude Flow](https://github.com/anthropics/claude-flow)** - Multi-agent orchestration

## 🤝 Community & Support

<div align="center">

### Join Our Discord Community

[![Discord](https://img.shields.io/badge/Join%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.agentics.org)

**Team Formation | Technical Support | Networking | Announcements**

</div>

- **Discord**: [discord.agentics.org](https://discord.agentics.org)
- **Website**: [agentics.org/hackathon](https://agentics.org/hackathon)
- **GitHub Issues**: [Report a bug](https://github.com/agenticsorg/hackathon-tv5/issues)

## 🏗️ Project Structure

```
your-hackathon-project/
├── .hackathon.json     # Project configuration
├── package.json
├── src/
│   ├── agents/         # Your AI agents
│   ├── workflows/      # Agentic workflows
│   └── index.ts
└── README.md
```

## 📄 Configuration

The CLI creates a `.hackathon.json` file in your project:

```json
{
  "projectName": "my-hackathon-project",
  "teamName": "Awesome Team",
  "track": "multi-agent-systems",
  "tools": {
    "claudeCode": true,
    "claudeFlow": true,
    "geminiCli": true,
    "adk": true
  },
  "mcpEnabled": true,
  "discordLinked": true,
  "initialized": true,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

## 🔒 Requirements

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Python** 3.9+ (for Google ADK/Vertex AI)
- **Git** (recommended)

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud** - Hackathon sponsor and technology partner
- **Anthropic** - Claude AI and tooling
- **Agentics Foundation** - Organization and community
- **All Contributors** - Thank you for making this possible!

---

<div align="center">

**Built with ❤️ by the [Agentics Foundation](https://agentics.org)**

*Making AI innovation and education open to everyone through open-source agentic AI systems*

[![Website](https://img.shields.io/badge/agentics.org-Visit-blue?style=flat-square)](https://agentics.org)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/agenticsorg)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/company/agentics)

</div>
