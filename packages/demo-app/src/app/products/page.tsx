'use client';

import { useState } from 'react';
import { Text, Button, Icon } from '@shopify/polaris';
import { FilterIcon } from '@shopify/polaris-icons';
import { products, categories } from '../../data/products';
import ProductCard from '../../components/ProductCard';
import { usePageTracking } from '../../hooks/usePageTracking';

export default function ProductsPage() {
  usePageTracking();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilters, setPriceFilters] = useState({
    under50: false,
    between50and100: false,
    between100and200: false,
    over200: false,
  });
  const [availabilityFilters, setAvailabilityFilters] = useState({
    inStock: true,
    outOfStock: false,
  });

  const categoryFiltered = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const anyPriceSelected = Object.values(priceFilters).some(Boolean);
  const priceMatches = (price: number) => {
    const matchUnder50 = price < 50 && priceFilters.under50;
    const match50to100 = price >= 50 && price < 100 && priceFilters.between50and100;
    const match100to200 = price >= 100 && price < 200 && priceFilters.between100and200;
    const matchOver200 = price >= 200 && priceFilters.over200;
    return matchUnder50 || match50to100 || match100to200 || matchOver200;
  };

  const anyAvailabilitySelected = Object.values(availabilityFilters).some(Boolean);
  const availabilityMatches = (inStock: boolean) => {
    // If neither availability checkbox is on, allow all
    if (!anyAvailabilitySelected) return true;
    if (availabilityFilters.inStock && inStock) return true;
    if (availabilityFilters.outOfStock && !inStock) return true;
    return false;
  };

  const filteredProducts = categoryFiltered.filter((p) => {
    const priceOk = anyPriceSelected ? priceMatches(p.price) : true;
    const availOk = availabilityMatches(p.inStock);
    return priceOk && availOk;
  });

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
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={priceFilters.under50}
                    onChange={(e) =>
                      setPriceFilters((prev) => ({ ...prev, under50: e.target.checked }))
                    }
                  />
                  Under $50
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={priceFilters.between50and100}
                    onChange={(e) =>
                      setPriceFilters((prev) => ({ ...prev, between50and100: e.target.checked }))
                    }
                  />
                  $50 - $100
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={priceFilters.between100and200}
                    onChange={(e) =>
                      setPriceFilters((prev) => ({ ...prev, between100and200: e.target.checked }))
                    }
                  />
                  $100 - $200
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={priceFilters.over200}
                    onChange={(e) =>
                      setPriceFilters((prev) => ({ ...prev, over200: e.target.checked }))
                    }
                  />
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
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={availabilityFilters.inStock}
                    onChange={(e) =>
                      setAvailabilityFilters((prev) => ({ ...prev, inStock: e.target.checked }))
                    }
                  />
                  In Stock
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={availabilityFilters.outOfStock}
                    onChange={(e) =>
                      setAvailabilityFilters((prev) => ({ ...prev, outOfStock: e.target.checked }))
                    }
                  />
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
