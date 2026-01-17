'use client';

import Link from 'next/link';
import { Text, Button, Badge } from '@shopify/polaris';
import { products } from '../../data/products';
import ProductCard from '../../components/ProductCard';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';

export default function ElectronicsPage() {
  usePageTracking();
  const electronicsProducts = products.filter(p => p.category === 'Electronics');
  const featuredProduct = electronicsProducts[0];
  const otherProducts = electronicsProducts.slice(1);

  return (
    <div>
      {/* Hero with Featured Product */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge tone="info">Featured</Badge>
              <Text as="h1" variant="heading2xl" fontWeight="bold">
                {featuredProduct.title}
              </Text>
              <p className="mt-4 text-lg text-gray-300">
                {featuredProduct.description}
              </p>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold">${featuredProduct.price}</span>
                {featuredProduct.compareAtPrice && (
                  <span className="text-xl text-gray-400 line-through">${featuredProduct.compareAtPrice}</span>
                )}
              </div>
              <div className="mt-8">
                <Link href={`/products/${featuredProduct.id}`}>
                  <Button size="large">Shop Now</Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-white/10 rounded-2xl p-8 backdrop-blur">
                <img
                  src={featuredProduct.image}
                  alt={featuredProduct.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Text as="h2" variant="headingLg" fontWeight="semibold">
          Shop by Type
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { name: 'Audio', icon: '🎧', count: 12 },
            { name: 'Wearables', icon: '⌚', count: 8 },
            { name: 'Chargers', icon: '🔌', count: 15 },
            { name: 'Accessories', icon: '📱', count: 24 },
          ].map((cat) => (
            <div key={cat.name} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <span className="text-4xl">{cat.icon}</span>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                {cat.name}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {cat.count} products
              </Text>
            </div>
          ))}
        </div>
      </section>

      {/* Deals Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚡</span>
            <div>
              <Text as="h3" variant="headingMd" fontWeight="bold">
                Flash Sale: Up to 40% Off
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Limited time offer on select electronics
              </Text>
            </div>
          </div>
          <Button>View Deals</Button>
        </div>
      </section>

      {/* All Electronics */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Text as="h2" variant="headingLg" fontWeight="semibold">
          All Electronics
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {electronicsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Tech Tips */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-100 rounded-2xl p-8">
          <Text as="h2" variant="headingLg" fontWeight="semibold">
            Tech Tips & Guides
          </Text>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[
              { title: 'How to Choose the Right Headphones', time: '5 min read' },
              { title: 'Smartwatch Buying Guide 2024', time: '8 min read' },
              { title: 'Wireless Charging: Everything You Need to Know', time: '4 min read' },
            ].map((article) => (
              <div key={article.title} className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                <Text as="h3" variant="bodyMd" fontWeight="semibold">
                  {article.title}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {article.time}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
