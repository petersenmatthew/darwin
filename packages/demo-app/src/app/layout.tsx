'use client';

import './globals.css';
// import type { Metadata } from 'next';
import PolarisProvider from '../components/PolarisProvider';
import Navigation from '../components/Navigation';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Link from 'next/link';
import { initAmplitude } from '../amplitude';
import { useEffect } from 'react';
// export const metadata: Metadata = {
//   title: 'ShopWave - Demo Store',
//   description: 'A demo e-commerce store',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initAmplitude();
  }, [])

  return (  
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <PolarisProvider>
          <CartProvider>
            <WishlistProvider>
              <Navigation />
              <main>{children}</main>

              {/* Footer */}
              <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <Link href="/" className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="font-semibold">ShopWave</span>
                      </Link>
                      <p className="text-sm text-gray-500 mb-4">Your one-stop shop for quality products at great prices.</p>
                      <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                        </a>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4 text-sm">Shop</h4>
                      <ul className="text-sm text-gray-500 space-y-2">
                        <li><Link href="/products" className="hover:text-gray-700 transition-colors">All Products</Link></li>
                        <li><Link href="/electronics" className="hover:text-gray-700 transition-colors">Electronics</Link></li>
                        <li><Link href="/clothing" className="hover:text-gray-700 transition-colors">Clothing</Link></li>
                        <li><Link href="/accessories" className="hover:text-gray-700 transition-colors">Accessories</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4 text-sm">Support</h4>
                      <ul className="text-sm text-gray-500 space-y-2">
                        <li><Link href="/contact" className="hover:text-gray-700 transition-colors">Contact Us</Link></li>
                        <li><Link href="/faq" className="hover:text-gray-700 transition-colors">FAQs</Link></li>
                        <li><Link href="/shipping" className="hover:text-gray-700 transition-colors">Shipping Info</Link></li>
                        <li><Link href="/returns" className="hover:text-gray-700 transition-colors">Returns</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4 text-sm">Company</h4>
                      <ul className="text-sm text-gray-500 space-y-2">
                        <li><Link href="/about" className="hover:text-gray-700 transition-colors">About Us</Link></li>
                        <li><Link href="/account" className="hover:text-gray-700 transition-colors">My Account</Link></li>
                        <li><Link href="/wishlist" className="hover:text-gray-700 transition-colors">Wishlist</Link></li>
                        <li><Link href="/cart" className="hover:text-gray-700 transition-colors">Cart</Link></li>
                      </ul>
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="border-t mt-8 pt-8">
                    <div className="max-w-md mx-auto text-center">
                      <h4 className="font-medium mb-2">Subscribe to our newsletter</h4>
                      <p className="text-sm text-gray-500 mb-4">Get the latest updates on new products and upcoming sales.</p>
                      <form className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                        <button
                          type="submit"
                          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Subscribe
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                      © 2024 ShopWave. All rights reserved. | Demo Store
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                      <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                      <a href="#" className="hover:text-gray-600 transition-colors">Cookie Settings</a>
                    </div>
                  </div>
                </div>
              </footer>
            </WishlistProvider>
          </CartProvider>
        </PolarisProvider>
      </body>
    </html>
  );
}
