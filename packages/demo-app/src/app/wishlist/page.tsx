'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';

export default function WishlistPage() {
  usePageTracking();
  const { items, removeFromWishlist, clearWishlist, addToWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [showAddedMessage, setShowAddedMessage] = useState<string | null>(null);

  const handleAddToCart = (productId: string) => {
    const product = items.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      setShowAddedMessage(productId);
      setTimeout(() => setShowAddedMessage(null), 2000);
    }
  };

  const handleMoveAllToCart = () => {
    items.forEach((product) => {
      if (product.inStock) {
        addToCart(product);
      }
    });
    clearWishlist();
  };

  // Suggested products (products not in wishlist)
  const suggestedProducts = products
    .filter((p) => !items.find((item) => item.id === p.id))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
        <p className="text-gray-600 mb-8">
          Save your favorite items here so you can easily find them later.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Start Shopping
        </Link>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-6">You might like these</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {suggestedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg border p-4 text-left hover:shadow-md transition-shadow">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.title}</h3>
                    <p className="text-green-600 font-medium">${product.price.toFixed(2)}</p>
                  </Link>
                  <button
                    onClick={() => addToWishlist(product)}
                    className="mt-2 w-full py-2 text-sm text-gray-600 border rounded hover:bg-gray-50 transition-colors"
                  >
                    Add to Wishlist
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">My Wishlist</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleMoveAllToCart}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Add All to Cart
          </button>
          <button
            onClick={clearWishlist}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Wishlist
          </button>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {items.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow group">
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-white px-3 py-1 rounded text-sm font-medium">Out of Stock</span>
                  </div>
                )}
                {product.compareAtPrice && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    Sale
                  </span>
                )}
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-medium mb-1 hover:text-green-600 transition-colors line-clamp-1">
                  {product.title}
                </h3>
              </Link>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviews})</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={!product.inStock}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    product.inStock
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {showAddedMessage === product.id ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                  title="Remove from wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {/* Suggested Products */}
      {suggestedProducts.length > 0 && (
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.title}</h3>
                  <p className="text-green-600 font-medium">${product.price.toFixed(2)}</p>
                </Link>
                <button
                  onClick={() => addToWishlist(product)}
                  className="mt-2 w-full py-2 text-sm text-gray-600 border rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Wishlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
