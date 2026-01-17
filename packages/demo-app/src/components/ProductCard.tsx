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
          <div className="flex items-center gap-1 mt-1">
            <Icon source={StarFilledIcon} tone="warning" />
            <Text as="span" variant="bodySm" tone="subdued">
              {product.rating} ({product.reviews})
            </Text>
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
