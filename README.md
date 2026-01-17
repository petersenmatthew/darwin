# darwin

## Prerequisites

1. **Node.js version**: The project requires Node.js 20 (see `.nvmrc`)
2. **Install dependencies**: Run `npm install` from the root directory

## Running the Project

This is a monorepo with multiple packages. The recommended pipeline is:

1. **Demo App** (the target website to test)
2. **Express Backend + Dashboard** (run together)**
3. **SDK CLI** (optional, for command-line usage)

### Recommended: Run Services Together

**Step 1: Start the Demo App** (Next.js app on port 3000):
```bash
cd packages/demo-app
npm run dev
```

**Step 2: Start Express Backend + Dashboard together** (from root directory):
```bash
npm run start:services
```

This single command runs:
- Express API Backend on port 3002
- Dashboard on port 3001

The Express backend provides API endpoints for the dashboard to communicate with the browser agent.

### Alternative: Run Individual Packages

**Demo App** (Next.js app on port 3000):
```bash
cd packages/demo-app
npm run dev
```

**Express API Backend** (runs on port 3002):
```bash
cd packages/darwin-sdk/core
npm run start:dev   # Development mode with hot reload
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

### Option: Run All Packages in Development Mode

From the root directory:

```bash
npm run dev
```

This runs the `dev` script for all workspaces.

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
2. Start demo app: `cd packages/demo-app && npm run dev` (runs on http://localhost:3000)
3. Start services: `npm run start:services` (from root - runs Express API on http://localhost:3002 and Dashboard on http://localhost:3001)
4. (Optional) Run SDK CLI: `cd packages/darwin-sdk && npm run dev run` (requires config and API keys)

**Note:** The dashboard requires the Express API backend to be running on port 3002 to function properly. Use `npm run start:services` to run both together.

The demo app is a Next.js e-commerce site, the dashboard is a Next.js UI for managing the Darwin SDK, and the Express backend provides the API endpoints that the dashboard uses to control browser agents.