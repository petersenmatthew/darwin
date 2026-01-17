'use client';

import Link from 'next/link';
import { Text, Button } from '@shopify/polaris';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { usePageTracking } from '../hooks/usePageTracking';
import ScrollTracker from '../components/tracking/ScrollTracker';

export default function Home() {
  usePageTracking();
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      <ScrollTracker />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <Text as="h1" variant="heading3xl" fontWeight="bold">
              New Season Arrivals
            </Text>
            <p className="mt-4 text-lg text-green-100">
              Discover our latest collection of premium products. Quality meets style at unbeatable prices.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/products">
                <Button size="large">Shop Now</Button>
              </Link>
              <Button size="large" variant="plain">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Text as="h2" variant="headingLg" fontWeight="semibold">
          Shop by Category
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { name: 'Electronics', icon: '📱', href: '/electronics' },
            { name: 'Clothing', icon: '👕', href: '/clothing' },
            { name: 'Accessories', icon: '👜', href: '/accessories' },
          ].map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  {cat.name}
                </Text>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <Text as="h2" variant="headingLg" fontWeight="semibold">
            Featured Products
          </Text>
          <Link href="/products">
            <Button variant="plain">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between">
          <div>
            <Text as="h2" variant="headingXl" fontWeight="bold">
              Get 20% Off Your First Order
            </Text>
            <p className="mt-2 text-gray-300">
              Sign up for our newsletter and receive exclusive offers.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg text-gray-900 w-64"
            />
            <Button variant="primary">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* More Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Text as="h2" variant="headingLg" fontWeight="semibold">
          More to Explore
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {products.slice(4, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
