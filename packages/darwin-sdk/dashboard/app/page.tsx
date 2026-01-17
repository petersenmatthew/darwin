export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Darwin Orchestrator</h1>
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-700 p-4 rounded">
                    <h2 className="text-xl mb-4">Live Agent Feed</h2>
                    {/* Iframe grid would go here */}
                    <div className="text-gray-500">Waiting for agents...</div>
                </div>
                <div className="border border-gray-700 p-4 rounded">
                    <h2 className="text-xl mb-4">Evolution Status</h2>
                    <div className="text-green-500">System Ready</div>
                </div>
            </div>
        </div>
    );
}
