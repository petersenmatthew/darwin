'use client';

import { useState } from 'react';
import { Text, Button, Icon } from '@shopify/polaris';
import { FilterIcon } from '@shopify/polaris-icons';
import { products, categories } from '../../data/products';
import ProductCard from '../../components/ProductCard';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Text as="h1" variant="headingXl" fontWeight="bold">
          All Products
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          {sortedProducts.length} products
        </Text>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-lg border p-4">
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              Categories
            </Text>
            <div className="mt-4 space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedCategory === cat
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="border-t mt-6 pt-6">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Price Range
              </Text>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded" />
                  Under $50
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded" />
                  $50 - $100
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded" />
                  $100 - $200
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded" />
                  Over $200
                </label>
              </div>
            </div>

            <div className="border-t mt-6 pt-6">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Availability
              </Text>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded" defaultChecked />
                  In Stock
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded" />
                  Out of Stock
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Button icon={FilterIcon} variant="plain">
                Filters
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Text as="span" variant="bodySm" tone="subdued">
                Sort by:
              </Text>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button disabled>Previous</Button>
            <Button variant="primary">1</Button>
            <Button>2</Button>
            <Button>3</Button>
            <Button>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
