# darwin

## Prerequisites

1. **Node.js version**: The project requires Node.js 20 (see `.nvmrc`)
2. **Install dependencies**: Run `npm install` from the root directory

## Running the Project

This is a monorepo with multiple packages. You can run them individually or together:

### Option 1: Run All Packages in Development Mode

From the root directory:

```bash
npm run dev
```

This runs the `dev` script for all workspaces.

### Option 2: Run Individual Packages

**Demo App** (Next.js app on port 3000):
```bash
cd packages/demo-app
npm run dev
```

**Darwin Dashboard** (Next.js app on port 3001):
```bash
cd packages/darwin-sdk/dashboard
npm run dev
```

**Darwin SDK CLI** (browser automation):
```bash
cd packages/darwin-sdk
npm run dev init    # Initialize config
npm run dev run     # Run the agent
```

### Option 3: Run SDK on Demo App

From the root directory:

```bash
npm run run-sdk-on-demo
```

This runs the Darwin SDK against the demo app.

### Option 4: Evolve Command

From the root directory:

```bash
npm run evolve
```

## Environment Setup

For the Darwin SDK to work, you'll need to set up environment variables. Create a `.env` file in `packages/darwin-sdk`:

```bash
# Required for LOCAL mode (choose one model):
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
# OR
ANTHROPIC_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here

# Optional for BROWSERBASE mode:
BROWSERBASE_API_KEY=your_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here
```

## Quick Start Summary

1. Install dependencies: `npm install` (from root)
2. Run demo app: `cd packages/demo-app && npm run dev` (runs on http://localhost:3000)
3. Run dashboard: `cd packages/darwin-sdk/dashboard && npm run dev` (runs on http://localhost:3001)
4. Run SDK: `cd packages/darwin-sdk && npm run dev run` (requires config and API keys)

The demo app is a Next.js e-commerce site, and the dashboard is a Next.js UI for managing the Darwin SDK.