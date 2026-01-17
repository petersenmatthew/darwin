'use client';

import Link from 'next/link';
import { Text, Button, Badge } from '@shopify/polaris';
import { products } from '../../data/products';
import ProductCard from '../../components/ProductCard';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';

export default function AccessoriesPage() {
  usePageTracking();
  const accessoriesProducts = products.filter(p => p.category === 'Accessories');

  return (
    <div>
      {/* Hero - Luxury Style */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Text as="p" variant="bodySm" fontWeight="medium">
                <span className="text-gray-400">PREMIUM COLLECTION</span>
              </Text>
              <Text as="h1" variant="heading3xl" fontWeight="bold">
                Accessories That Define You
              </Text>
              <p className="mt-4 text-lg text-gray-400">
                From everyday essentials to statement pieces, find accessories that complement your unique style.
              </p>
              <div className="mt-8">
                <Button size="large">Explore Collection</Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-30 absolute"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  {accessoriesProducts.slice(0, 2).map((p) => (
                    <div key={p.id} className="w-40 h-40 bg-white/10 rounded-xl p-4 backdrop-blur">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <section className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-8 py-4 scrollbar-hide">
            {['All', 'Bags', 'Wallets', 'Belts', 'Watches', 'Jewelry', 'Sunglasses', 'Hats'].map((cat) => (
              <button
                key={cat}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat === 'All' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge tone="success">Bestsellers</Badge>
            <Text as="h2" variant="headingLg" fontWeight="semibold">
              Customer Favorites
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {accessoriesProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Gift Guide Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎁</span>
            <div>
              <Text as="h3" variant="headingMd" fontWeight="bold">
                Gift Guide
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Find the perfect accessory for every occasion
              </Text>
            </div>
          </div>
          <Button>Shop Gifts</Button>
        </div>
      </section>

      {/* Featured: Bags */}
      <section className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <Text as="p" variant="bodySm" fontWeight="medium" tone="subdued">
                FEATURED CATEGORY
              </Text>
              <Text as="h2" variant="headingXl" fontWeight="bold">
                Bags & Backpacks
              </Text>
              <p className="mt-4 text-gray-600">
                From sleek laptop bags to rugged everyday backpacks, our collection combines style with functionality.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✓ Water-resistant materials</li>
                <li>✓ Padded laptop compartments</li>
                <li>✓ Ergonomic designs</li>
                <li>✓ Lifetime warranty</li>
              </ul>
              <div className="mt-8">
                <Button variant="primary">Shop Bags</Button>
              </div>
            </div>
            <div className="order-1 md:order-2 aspect-square bg-neutral-200 rounded-2xl flex items-center justify-center">
              <span className="text-8xl">🎒</span>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Text as="h2" variant="headingLg" fontWeight="semibold">
          New Arrivals
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {accessoriesProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Values */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🛡️', title: 'Quality Guaranteed', desc: 'Premium materials only' },
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
            ].map((item) => (
              <div key={item.title}>
                <span className="text-4xl">{item.icon}</span>
                <Text as="h3" variant="bodyMd" fontWeight="bold">
                  <span className="text-white">{item.title}</span>
                </Text>
                <Text as="p" variant="bodySm">
                  <span className="text-gray-400">{item.desc}</span>
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
