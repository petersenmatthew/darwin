'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Text, Button, Icon } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { products } from '../../data/products';
import ProductCard from '../../components/ProductCard';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';

export default function SearchPage() {
  usePageTracking();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  const popularSearches = ['Headphones', 'Wallet', 'Watch', 'Backpack', 'T-Shirt'];
  const recentSearches = ['Wireless charger', 'Coffee mug'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-colors bg-white">
          <div className="pl-4">
            <Icon source={SearchIcon} tone="subdued" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 px-4 py-4 text-lg outline-none rounded-xl"
            autoFocus
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-4 rounded-r-xl hover:bg-green-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* No Query State */}
      {!query && (
        <div className="mt-12">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                Recent Searches
              </Text>
              <div className="flex flex-wrap gap-2 mt-4">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchInput(term);
                      setQuery(term);
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="mb-8">
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Popular Searches
            </Text>
            <div className="flex flex-wrap gap-2 mt-4">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchInput(term);
                    setQuery(term);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Browse Categories */}
          <div>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Browse Categories
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { name: 'Electronics', href: '/electronics', icon: '📱' },
                { name: 'Clothing', href: '/clothing', icon: '👕' },
                { name: 'Accessories', href: '/accessories', icon: '👜' },
              ].map((cat) => (
                <Link key={cat.name} href={cat.href}>
                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-3xl">{cat.icon}</span>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      {cat.name}
                    </Text>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
                : `No results for "${query}"`}
            </Text>
            {results.length > 0 && (
              <select className="border rounded-md px-3 py-1.5 text-sm">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                No products found
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Try different keywords or browse our categories
              </Text>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchInput(term);
                      setQuery(term);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:border-green-500 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
