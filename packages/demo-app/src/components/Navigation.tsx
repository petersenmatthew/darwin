'use client';

import Link from 'next/link';
import { Text, Button, Icon } from '@shopify/polaris';
import { CartIcon, SearchIcon, PersonIcon } from '@shopify/polaris-icons';

export default function Navigation() {
  return (
    <header className="bg-white border-b border-gray-200">
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

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              All Products
            </Link>
            <Link href="/products?category=Electronics" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Electronics
            </Link>
            <Link href="/products?category=Clothing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Clothing
            </Link>
            <Link href="/products?category=Home" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Home
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Icon source={SearchIcon} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Icon source={PersonIcon} />
            </button>
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <Icon source={CartIcon} />
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
