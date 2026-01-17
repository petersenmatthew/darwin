import CheckoutButton from '../components/CheckoutButton';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-4xl font-bold mb-8">Welcome to the Shop</h1>
                <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
                    <p>Please buy something so we can test the checkout flow.</p>
                </div>
                <div className="mt-8">
                    <CheckoutButton />
                </div>
            </div>
        </main>
    );
}
