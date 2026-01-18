'use client';

import Link from 'next/link';
import { Text, Button, Badge, Icon } from '@shopify/polaris';
import { StarFilledIcon, CartIcon } from '@shopify/polaris-icons';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { usePageTracking } from '../hooks/usePageTracking';
import { trackEvent } from '../amplitude';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { pageLoadTime } = usePageTracking();

  const formatReviewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-4 h-4 text-orange-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <svg
              className="w-4 h-4 text-gray-300 absolute inset-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg
              className="w-4 h-4 text-orange-500 absolute inset-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
    trackEvent('button_clicked', {
      button_id: `add_to_cart_${product.id}`,
      button_text: 'Add to Cart',
      button_type: 'add_to_cart',
      product_id: product.id,
      product_name: product.title,
      time_since_page_load: timeSincePageLoad,
    });
    
    if (product.inStock) {
      addToCart(product);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="aspect-square bg-gray-100 relative">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.compareAtPrice && (
            <div className="absolute top-2 left-2">
              <Badge tone="success">Sale</Badge>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge tone="critical">Out of Stock</Badge>
            </div>
          )}
          {/* Quick add button */}
          {product.inStock && (
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2"
              >
                <Icon source={CartIcon} />
                Add to Cart
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          <Text as="p" variant="bodyMd" fontWeight="medium" truncate>
            {product.title}
          </Text>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-gray-900">
              {product.rating}
            </span>
            {renderStars(product.rating)}
            <span className="text-sm text-blue-600">
              ({formatReviewCount(product.reviews)})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Text as="span" variant="bodyLg" fontWeight="bold">
              ${product.price}
            </Text>
            {product.compareAtPrice && (
              <Text as="span" variant="bodySm" tone="subdued" textDecorationLine="line-through">
                ${product.compareAtPrice}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
