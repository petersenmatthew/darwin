import express from 'express';
import cors from 'cors';

export function startDarwin() {
    const app = express();
    const port = 3001; // Darwin Dashboard Port? No, Dashboard is 3001 (Next.js), Core API should be different or Dashboard is 3001 and this is internal?
    // Plan says: "Entity C: The Darwin Dashboard (Port 3001)"
    // "Entity B: The Darwin Core... API Server: Exposes endpoints for the Dashboard"
    // So Core needs to run on a port. Let's pick 3002 for Core API or run it as part of the start process.
    // Actually, usually Next.js app (Dashboard) will consume this API.
    // Let's run Core API on 3002.
    const API_PORT = 3002;

    app.use(cors());
    app.use(express.json());

    app.get('/api/status', (req, res) => {
        res.json({ status: 'Scanning' });
    });

    app.get('/api/agents', (req, res) => {
        res.json({ agents: [] });
    });

    app.listen(API_PORT, () => {
        console.log(`Darwin Core API listening on port ${API_PORT}`);
        console.log(`Darwin Dashboard should be running on http://localhost:3001`);
    });

    // Here we would also spawn the Dashboard process programmatically or expect user to run it?
    // "Initialization: Developer runs npx darwin start. Terminal: Shows the 'Darwin Orchestrator' spinning up. Browser: Opens http://localhost:3001"
    // So npx darwin start likely starts the dashboard too.
}
