'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Text, Button, Badge, Icon, Divider } from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useCart } from '../../context/CartContext';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';
import { trackEvent } from '../../amplitude';

export default function CartPage() {
  const { pageLoadTime } = usePageTracking();
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = getCartTotal();
  const discount = appliedPromo ? subtotal * 0.1 : 0; // 10% off
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (appliedPromo) {
      setPromoError('Promo code already applied');
      return;
    }
    if (code === 'WELCOME10') {
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <Text as="h1" variant="headingXl" fontWeight="bold">
            Your cart is empty
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Looks like you haven&apos;t added anything to your cart yet.
          </Text>
          <div className="mt-8">
            <Link href="/products">
              <Button variant="primary" size="large">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Text as="h1" variant="headingXl" fontWeight="bold">
        Shopping Cart
      </Text>
      <Text as="p" variant="bodyMd" tone="subdued">
        {items.length} item{items.length !== 1 ? 's' : ''} in your cart
      </Text>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            {items.map((item, index) => (
              <div key={item.product.id}>
                <div className="p-6 flex gap-6">
                  {/* Image */}
                  <Link href={`/products/${item.product.id}`}>
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/products/${item.product.id}`}>
                          <Text as="h3" variant="bodyLg" fontWeight="semibold">
                            {item.product.title}
                          </Text>
                        </Link>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {item.product.category}
                        </Text>
                      </div>
                      <Text as="span" variant="bodyLg" fontWeight="bold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </Text>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => {
                            const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                            trackEvent('button_clicked', {
                              button_id: `quantity_decrease_${item.product.id}`,
                              button_text: '-',
                              button_type: 'quantity_decrease',
                              product_id: item.product.id,
                              product_name: item.product.title,
                              current_quantity: item.quantity,
                              new_quantity: item.quantity - 1,
                              time_since_page_load: timeSincePageLoad,
                            });
                            updateQuantity(item.product.id, item.quantity - 1);
                          }}
                          className="px-3 py-1.5 hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 border-x text-sm">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                            trackEvent('button_clicked', {
                              button_id: `quantity_increase_${item.product.id}`,
                              button_text: '+',
                              button_type: 'quantity_increase',
                              product_id: item.product.id,
                              product_name: item.product.title,
                              current_quantity: item.quantity,
                              new_quantity: item.quantity + 1,
                              time_since_page_load: timeSincePageLoad,
                            });
                            updateQuantity(item.product.id, item.quantity + 1);
                          }}
                          className="px-3 py-1.5 hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => {
                          const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                          trackEvent('button_clicked', {
                            button_id: `remove_from_cart_${item.product.id}`,
                            button_text: 'Remove',
                            button_type: 'remove_from_cart',
                            product_id: item.product.id,
                            product_name: item.product.title,
                            time_since_page_load: timeSincePageLoad,
                          });
                          removeFromCart(item.product.id);
                        }}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                      >
                        <Icon source={DeleteIcon} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                {index < items.length - 1 && <Divider />}
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link href="/products">
              <Button variant="plain">← Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg border p-6 sticky top-4">
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Order Summary
            </Text>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <Text as="span" tone="subdued">Subtotal</Text>
                <Text as="span">${subtotal.toFixed(2)}</Text>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <Text as="span">Discount (10%)</Text>
                  <Text as="span">-${discount.toFixed(2)}</Text>
                </div>
              )}
              <div className="flex justify-between">
                <Text as="span" tone="subdued">Shipping</Text>
                <Text as="span">
                  {shipping === 0 ? (
                    <Badge tone="success">Free</Badge>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text as="span" tone="subdued">Tax (8%)</Text>
                <Text as="span">${tax.toFixed(2)}</Text>
              </div>
              <Divider />
              <div className="flex justify-between">
                <Text as="span" variant="bodyLg" fontWeight="bold">Total</Text>
                <Text as="span" variant="bodyLg" fontWeight="bold">${total.toFixed(2)}</Text>
              </div>
            </div>

            {shipping > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </div>
            )}

            <div className="mt-6">
              <Link href="/checkout">
                <Button 
                  variant="primary" 
                  size="large" 
                  fullWidth
                  onClick={() => {
                    const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                    trackEvent('button_clicked', {
                      button_id: 'proceed_to_checkout',
                      button_text: 'Proceed to Checkout',
                      button_type: 'checkout',
                      cart_total: total,
                      time_since_page_load: timeSincePageLoad,
                    });
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>

            <div className="mt-4">
              <Button 
                size="large" 
                fullWidth
                onClick={() => {
                  const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                  trackEvent('button_clicked', {
                    button_id: 'paypal_checkout',
                    button_text: 'PayPal',
                    button_type: 'paypal_checkout',
                    cart_total: total,
                    time_since_page_load: timeSincePageLoad,
                  });
                }}
              >
                PayPal
              </Button>
            </div>

            {/* Promo Code */}
            <div className="mt-6">
              <Text as="h3" variant="bodySm" fontWeight="medium">
                Have a promo code?
              </Text>
              {appliedPromo ? (
                <div className="mt-2 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-center justify-between">
                  <span>Code "{appliedPromo}" applied - 10% off!</span>
                  <button
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoCode('');
                    }}
                    className="text-green-800 hover:underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                    />
                    <Button
                      onClick={() => {
                        const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                        trackEvent('button_clicked', {
                          button_id: 'apply_promo_code',
                          button_text: 'Apply',
                          button_type: 'apply_promo',
                          time_since_page_load: timeSincePageLoad,
                        });
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && (
                    <p className="mt-1 text-sm text-red-600">{promoError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
