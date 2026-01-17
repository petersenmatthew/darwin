export default function Home() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Demo App</h1>

      {/* Button Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-4">
          <button className="bg-purple-500 text-white px-4 py-2 rounded">
            Primary
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded">
            Secondary
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded">
            Outline
          </button>
        </div>
      </section>

      {/* List Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">List</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Item one</li>
          <li>Item two</li>
          <li>Item three</li>
          <li>Item four</li>
        </ul>
      </section>

      {/* Card Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Card</h2>
        <div className="border rounded-lg p-4 shadow-sm">
          <h3 className="font-medium">Card Title</h3>
          <p className="text-gray-600">This is a simple card component.</p>
        </div>
      </section>

      {/* Input Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Form</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter text..."
            className="border rounded px-3 py-2 w-full"
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
            Submit
          </button>
        </div>
      </section>
    </main>
  );
}
