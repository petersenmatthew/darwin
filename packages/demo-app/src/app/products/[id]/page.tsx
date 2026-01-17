'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Text, Button, Badge, Icon } from '@shopify/polaris';
import { StarFilledIcon, CartIcon, HeartIcon, CheckIcon } from '@shopify/polaris-icons';
import { products } from '../../../data/products';
import { useCart } from '../../../context/CartContext';
import ProductCard from '../../../components/ProductCard';
import { usePageTracking } from '../../../hooks/usePageTracking';
import ScrollTracker from '../../../components/tracking/ScrollTracker';

export default function ProductDetailPage() {
  usePageTracking();
  const params = useParams();
  const router = useRouter();
  const product = products.find(p => p.id === params.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Text as="h1" variant="headingXl">Product not found</Text>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.compareAtPrice && (
              <div className="absolute top-4 left-4">
                <Badge tone="success">Sale</Badge>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-md cursor-pointer hover:ring-2 ring-green-500">
                <img
                  src={product.image}
                  alt=""
                  className="w-full h-full object-cover rounded-md opacity-80"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="mb-2">
            <Badge>{product.category}</Badge>
          </div>
          <Text as="h1" variant="heading2xl" fontWeight="bold">
            {product.title}
          </Text>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon
                  key={i}
                  source={StarFilledIcon}
                  tone={i <= Math.floor(product.rating) ? 'warning' : 'subdued'}
                />
              ))}
            </div>
            <Text as="span" variant="bodySm" tone="subdued">
              {product.rating} ({product.reviews} reviews)
            </Text>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <Text as="span" variant="heading2xl" fontWeight="bold">
              ${product.price}
            </Text>
            {product.compareAtPrice && (
              <>
                <Text as="span" variant="headingLg" tone="subdued" textDecorationLine="line-through">
                  ${product.compareAtPrice}
                </Text>
                <Badge tone="success">
                  Save ${(product.compareAtPrice - product.price).toFixed(2)}
                </Badge>
              </>
            )}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <div className="border-t border-b py-6 my-6">
            <div className="flex items-center gap-4 mb-4">
              <Text as="span" variant="bodyMd" fontWeight="medium">
                Quantity:
              </Text>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${
                  addedToCart
                    ? 'bg-green-700 text-white'
                    : product.inStock
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Icon source={addedToCart ? CheckIcon : CartIcon} />
                {addedToCart ? 'Added to Cart!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <Button size="large" icon={HeartIcon}>
                Save
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon source={CheckIcon} tone="success" />
              Free shipping on orders over $50
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon source={CheckIcon} tone="success" />
              30-day return policy
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon source={CheckIcon} tone="success" />
              2-year warranty included
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="border-b">
          <div className="flex gap-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {selectedTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          )}
          {selectedTab === 'specifications' && (
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="text-sm text-gray-500">Brand</div>
              <div className="text-sm">ShopWave</div>
              <div className="text-sm text-gray-500">SKU</div>
              <div className="text-sm">SW-{product.id.padStart(6, '0')}</div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="text-sm">{product.category}</div>
              <div className="text-sm text-gray-500">Weight</div>
              <div className="text-sm">0.5 kg</div>
              <div className="text-sm text-gray-500">Dimensions</div>
              <div className="text-sm">10 x 10 x 5 cm</div>
            </div>
          )}
          {selectedTab === 'reviews' && (
            <div className="space-y-6">
              {[
                { name: 'John D.', rating: 5, comment: 'Excellent product! Exactly what I needed.', date: '2 weeks ago' },
                { name: 'Sarah M.', rating: 4, comment: 'Good quality, fast shipping. Would buy again.', date: '1 month ago' },
                { name: 'Mike R.', rating: 5, comment: 'Best purchase I have made this year!', date: '1 month ago' },
              ].map((review, i) => (
                <div key={i} className="border-b pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium">
                        {review.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{review.name}</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <Icon
                              key={j}
                              source={StarFilledIcon}
                              tone={j <= review.rating ? 'warning' : 'subdued'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {review.date}
                    </Text>
                  </div>
                  <p className="mt-3 text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <Text as="h2" variant="headingLg" fontWeight="semibold">
            Related Products
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
