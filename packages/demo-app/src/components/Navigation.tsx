'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Text, Icon } from '@shopify/polaris';
import { CartIcon, SearchIcon, PersonIcon } from '@shopify/polaris-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import AuthModal from './AuthModal';

export default function Navigation() {
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* Top Bar */}
        <div className="bg-green-600 text-white text-center text-sm py-2">
          <span className="hidden sm:inline">Free shipping on orders over $50 | </span>
          Use code WELCOME10 for 10% off
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <Text as="span" variant="headingMd" fontWeight="bold">
                ShopWave
              </Text>
            </Link>

            {/* Nav Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/products" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                All Products
              </Link>
              <Link href="/electronics" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Electronics
              </Link>
              <Link href="/clothing" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Clothing
              </Link>
              <Link href="/accessories" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Accessories
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon source={SearchIcon} />
              </Link>

              <Link
                href="/wishlist"
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setShowAuthModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon source={PersonIcon} />
              </button>

              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Icon source={CartIcon} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 ml-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-4">
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/electronics"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Electronics
                </Link>
                <Link
                  href="/clothing"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Clothing
                </Link>
                <Link
                  href="/accessories"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accessories
                </Link>

                <div className="border-t pt-4 mt-2">
                  <Link
                    href="/account"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors block mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/wishlist"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors block mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                  <Link
                    href="/cart"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                </div>

                <div className="border-t pt-4 mt-2">
                  <Link
                    href="/about"
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors block mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors block mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    href="/faq"
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors block mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/shipping"
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shipping
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
