# Flowcore Platform MCP Server

A Model Context Protocol (MCP) server for managing and interacting with the Flowcore Platform.

## Usage with npx

You can run this package directly using npx without installing it:

```bash
npx @flowcore/platform-mcp-server --username <username> --pat <pat>
```

Replace `<username>` and `<pat>` with your Flowcore username and PAT (Personal Access Token).

## Installation

If you prefer to install the package globally:

```bash
npm install -g @flowcore/platform-mcp-server
```

Then run it:

```bash
platform-mcp-server --username <username> --pat <pat>
```

## Development

To install dependencies:

```bash
bun install
```

Run the project directly with Bun:

```bash
bun run src/index.ts --username <username> --pat <pat>
```

## Building

Build the project:

```bash
bun run build
```

Run the built project:

```bash
node dist/cli.js --username <username> --pat <pat>
```

## Environment Variables

| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| USERNAME | string | Flowcore username | - | ✓ |
| PAT | string | Flowcore PAT (Personal Access Token) | - | ✓ |

## About

This project uses the Model Context Protocol (MCP) to provide a standardized interface for interacting with the Flowcore Platform. It allows AI assistants to query and manage Flowcore resources through a structured API.

Originally created using `bun init` in bun v1.2.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

