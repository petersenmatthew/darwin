# Darwin SDK - Browser Automation with Stagehand

A browser automation framework built on Stagehand V3 that provides human-like web navigation with visible cursor movement and continuous reasoning logging.

## Features

- **Hybrid Mode**: Combines DOM and coordinate-based actions for more reliable automation
- **Headful Browser**: See the browser window and cursor movements in real-time
- **Continuous Logging**: Track every step, tool call, and reasoning decision
- **Easy Configuration**: Simple JSON config for website and task prompts
- **Human-like Navigation**: Natural cursor movement and smooth scrolling

## Installation

1. **Navigate to the darwin-sdk package:**

```bash
cd packages/darwin-sdk
```

2. **Install dependencies:**

```bash
npm install
```

3. **Build the package (or use dev mode):**

```bash
# Build TypeScript
npm run build

# OR use dev mode (no build needed)
npm run dev init
```

## Quick Start

1. **Initialize a configuration file:**

From the `packages/darwin-sdk` directory, run:

```bash
# If you built the package:
npm start init
# OR
node dist/cli/index.js init

# If using dev mode (no build needed):
npm run dev init
```

**Note:** The `npx darwin` command will work after you've built and installed the package globally, or if you're using it from within the monorepo after linking.

This creates a `darwin.config.json` file that you can edit to set your website and task.

2. **Edit the configuration:**

Open `darwin.config.json` and update:

```json
{
  "website": "https://example.com",
  "task": "Click the sign up button and fill out the registration form",
  "model": "google/gemini-3-flash-preview",
  "maxSteps": 20
}
```

3. **Run the agent:**

```bash
npx darwin run
```

The browser will open (headful mode), and you'll see the agent navigate the website with a visible cursor, while the terminal logs each step and reasoning.

## Configuration

### Configuration File

Create a `darwin.config.json` file in your project root:

```json
{
  "website": "https://example.com",
  "task": "Your task description here",
  "model": "google/gemini-3-flash-preview",
  "maxSteps": 20,
  "verbose": 2,
  "env": "LOCAL",
  "viewport": {
    "width": 1288,
    "height": 711
  },
  "systemPrompt": "Custom system prompt for the agent"
}
```

### Command Line Options

You can override config values via CLI:

```bash
# Override website and task
npx darwin run --website "https://example.com" --task "Click the login button"

# Override model and max steps
npx darwin run --model "anthropic/claude-sonnet-4-5-20250929" --steps 30

# Use BROWSERBASE environment
npx darwin run --env BROWSERBASE
```

### Environment Variables

**Required for LOCAL mode:**
- Model API key (depending on which model you use):
  - `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` - for Google models (recommended)
  - `ANTHROPIC_API_KEY` - for Anthropic models
  - `OPENAI_API_KEY` - for OpenAI models

**Required for BROWSERBASE mode:**
- `BROWSERBASE_API_KEY` - Browserbase API key
- `BROWSERBASE_PROJECT_ID` - Browserbase project ID
- Model API key (same as above)

Create a `.env` file in the `packages/darwin-sdk` directory:

```bash
# For Google models (default)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# For BROWSERBASE mode (optional)
BROWSERBASE_API_KEY=your_browserbase_api_key_here
BROWSERBASE_PROJECT_ID=your_browserbase_project_id_here
```

Or set them in your shell:

```bash
export GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
export BROWSERBASE_API_KEY=your_browserbase_api_key_here
export BROWSERBASE_PROJECT_ID=your_browserbase_project_id_here
```

**Note:** Stagehand automatically loads these environment variables. No additional configuration needed!

## CLI Commands

### `darwin init`

Create a default configuration file.

```bash
npx darwin init
npx darwin init --config custom-config.json
```

### `darwin run`

Execute the browser agent with the configured task.

```bash
npx darwin run
npx darwin run --website "https://example.com" --task "Your task"
```

### `darwin config`

Manage configuration values.

```bash
# Set website
npx darwin config --set-website "https://example.com"

# Set task
npx darwin config --set-task "Navigate and find the contact page"

# Set model
npx darwin config --set-model "google/gemini-3-flash-preview"
```

## Programmatic Usage

```typescript
import { BrowserAgent } from "./core/browser-agent";

const agent = new BrowserAgent({
  website: "https://example.com",
  task: "Click the sign up button and fill out the registration form",
  model: "google/gemini-3-flash-preview",
  maxSteps: 20,
  env: "LOCAL", // or "BROWSERBASE"
  verbose: 2,
});

await agent.init();
const result = await agent.execute();
agent.printLogSummary();
await agent.close();
```

## Architecture

### BrowserAgent

The main class that wraps Stagehand and provides:

- **Hybrid Mode**: Uses both DOM and coordinate-based actions
- **Headful Browser**: Visible browser window with cursor highlighting
- **Step Logging**: Tracks every action, tool call, and reasoning
- **Human-like Behavior**: Natural cursor movement and smooth scrolling

### Configuration System

Easy-to-edit JSON configuration for:

- Website URL
- Task description
- Model selection
- Execution parameters
- System prompts

### Logging

Continuous logging of:

- Step numbers and progress
- Tool calls and arguments
- Reasoning and decision-making
- Finish reasons
- Execution summary

## Models

Recommended models for hybrid mode:

- `google/gemini-3-flash-preview` (recommended - best balance)
- `anthropic/claude-sonnet-4-5-20250929`
- `anthropic/claude-haiku-4-5-20251001`

## MCP Integration

You can add MCP integrations to the agent:

```typescript
const agent = new BrowserAgent({
  website: "https://example.com",
  task: "Your task",
  integrations: [
    `https://mcp.exa.ai/mcp?exaApiKey=${process.env.EXA_API_KEY}`
  ],
});
```

## API Server

Start the API server:

```typescript
import { startDarwin } from "./core/main";

startDarwin();
```

Endpoints:

- `GET /api/status` - Check API status
- `GET /api/config` - Get current configuration
- `POST /api/run` - Run agent asynchronously
- `POST /api/run-sync` - Run agent synchronously and return results

## Examples

See `darwin.config.example.json` for a complete configuration example.

## Requirements

- Node.js 18+
- Chrome/Chromium browser (for LOCAL mode)
- Stagehand V3 package (`@browserbasehq/stagehand`)

## Notes

- Hybrid mode requires `experimental: true` (automatically set)
- Headful mode only works with `env: "LOCAL"`
- Cursor highlighting is enabled by default in hybrid mode
- The agent uses human-like delays and natural movement patterns
