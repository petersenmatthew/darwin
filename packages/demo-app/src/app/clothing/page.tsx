'use client';

import Link from 'next/link';
import { Text, Button, Badge } from '@shopify/polaris';
import { products } from '../../data/products';
import ProductCard from '../../components/ProductCard';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';

export default function ClothingPage() {
  usePageTracking();
  const clothingProducts = products.filter(p => p.category === 'Clothing');

  return (
    <div>
      {/* Hero - Fashion Style */}
      <section className="relative bg-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Text as="p" variant="bodySm" fontWeight="medium" tone="subdued">
                NEW COLLECTION
              </Text>
              <Text as="h1" variant="heading2xl" fontWeight="bold">
                Spring/Summer 2024
              </Text>
              <p className="mt-4 text-lg text-gray-600">
                Discover our latest collection featuring sustainable materials and timeless designs.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="large" variant="primary">Shop Women</Button>
                <Button size="large">Shop Men</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
              <div className="aspect-[3/4] bg-gray-300 rounded-lg mt-8"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Size Guide Banner */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center gap-8 text-sm">
          <span className="flex items-center gap-2">📏 Size Guide Available</span>
          <span className="flex items-center gap-2">🔄 Free Returns within 30 days</span>
          <span className="flex items-center gap-2">🌱 Sustainably Made</span>
        </div>
      </section>

      {/* Shop by Style */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Text as="h2" variant="headingLg" fontWeight="semibold">
          Shop by Style
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { name: 'Casual', image: '👕' },
            { name: 'Active', image: '🏃' },
            { name: 'Formal', image: '👔' },
            { name: 'Loungewear', image: '🛋️' },
          ].map((style) => (
            <div key={style.name} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                {style.image}
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Text as="span" variant="headingMd" fontWeight="bold">
                  <span className="text-white">{style.name}</span>
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge tone="warning">Limited Edition</Badge>
              <Text as="h2" variant="headingLg" fontWeight="semibold">
                Essentials Collection
              </Text>
            </div>
            <Button variant="plain">View All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clothingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {/* Show placeholders if not enough products */}
            {clothingProducts.length < 4 && (
              <>
                <div className="aspect-square bg-amber-100 rounded-lg flex items-center justify-center">
                  <Text as="span" tone="subdued">Coming Soon</Text>
                </div>
                <div className="aspect-square bg-amber-100 rounded-lg flex items-center justify-center">
                  <Text as="span" tone="subdued">Coming Soon</Text>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-video bg-green-100 rounded-2xl flex items-center justify-center">
            <span className="text-8xl">🌿</span>
          </div>
          <div>
            <Badge tone="success">Sustainability</Badge>
            <Text as="h2" variant="headingXl" fontWeight="bold">
              Fashion That Cares
            </Text>
            <p className="mt-4 text-gray-600">
              Every piece in our collection is made with sustainable materials and ethical manufacturing practices.
              We believe fashion should look good and do good.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm">✓</span>
                100% Organic Cotton
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm">✓</span>
                Fair Trade Certified
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm">✓</span>
                Carbon Neutral Shipping
              </li>
            </ul>
            <div className="mt-8">
              <Button>Learn More</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
