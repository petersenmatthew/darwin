import './globals.css';
import type { Metadata } from 'next';
import PolarisProvider from '../components/PolarisProvider';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'ShopWave - Demo Store',
  description: 'A demo e-commerce store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <PolarisProvider>
          <Navigation />
          <main>{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">ShopWave</h3>
                  <p className="text-sm text-gray-500">Your one-stop shop for quality products at great prices.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-4 text-sm">Shop</h4>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="hover:text-gray-700 cursor-pointer">All Products</li>
                    <li className="hover:text-gray-700 cursor-pointer">Electronics</li>
                    <li className="hover:text-gray-700 cursor-pointer">Clothing</li>
                    <li className="hover:text-gray-700 cursor-pointer">Home & Garden</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-4 text-sm">Support</h4>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="hover:text-gray-700 cursor-pointer">Contact Us</li>
                    <li className="hover:text-gray-700 cursor-pointer">FAQs</li>
                    <li className="hover:text-gray-700 cursor-pointer">Shipping Info</li>
                    <li className="hover:text-gray-700 cursor-pointer">Returns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-4 text-sm">Company</h4>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="hover:text-gray-700 cursor-pointer">About Us</li>
                    <li className="hover:text-gray-700 cursor-pointer">Careers</li>
                    <li className="hover:text-gray-700 cursor-pointer">Privacy Policy</li>
                    <li className="hover:text-gray-700 cursor-pointer">Terms of Service</li>
                  </ul>
                </div>
              </div>
              <div className="border-t mt-8 pt-8 text-center text-sm text-gray-400">
                © 2024 ShopWave. All rights reserved. | Demo Store
              </div>
            </div>
          </footer>
        </PolarisProvider>
      </body>
    </html>
  );
}
