'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Text, Button, Divider } from '@shopify/polaris';
import { useCart } from '../../context/CartContext';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';
import { trackEvent } from '../../amplitude';
import { useFormTracking } from '../../hooks/useFormTracking';

export default function CheckoutPage() {
  const { pageLoadTime } = usePageTracking();
  const router = useRouter();
  const { items, getCartTotal, clearCart, appliedPromo, applyPromo, removePromo, getDiscount } = useCart();
  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    if (appliedPromo) {
      setPromoError('Promo code already applied');
      return;
    }
    if (applyPromo(promoCode)) {
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };
  
  // Form tracking for checkout forms
  const {
    trackFieldFocus,
    trackFieldUnfocus,
    trackFieldChanged,
    trackFieldCompleted,
    trackFormSubmitted,
  } = useFormTracking({
    formId: 'checkout_form',
    formName: 'Checkout Form',
    pageLoadTime,
  });

  // Helper functions for form field tracking
  const handleFieldFocus = (fieldName: string, fieldType: string = 'text') => {
    trackFieldFocus(fieldName, fieldType);
  };

  const handleFieldBlur = (fieldName: string, fieldType: string = 'text', e?: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const hasValue = Boolean(e?.target?.value && e.target.value.trim() !== '');
    trackFieldUnfocus(fieldName, fieldType, hasValue);
    if (hasValue) {
      trackFieldCompleted(fieldName, fieldType, true);
    }
  };

  const handleFieldChange = (fieldName: string, fieldType: string = 'text', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    trackFieldChanged(fieldName, fieldType, e.target.value);
  };

  const subtotal = getCartTotal();
  const discount = getDiscount();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleNextStep = () => {
    const form = document.getElementById('checkout-form') as HTMLFormElement;
    if (form.checkValidity()) {
      setStep(step + 1);
    } else {
      form.reportValidity(); // shows browser validation errors
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
            Add some items to your cart before checking out.
          </Text>
          <div className="mt-8">
            <Link href="/products">
              <Button variant="primary" size="large">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
    trackEvent('button_clicked', {
      button_id: 'place_order',
      button_text: 'Place Order',
      button_type: 'place_order',
      cart_total: total,
      time_since_page_load: timeSincePageLoad,
    });
    // Track form submission
    trackFormSubmitted();
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Shipping' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Review' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-24 h-0.5 mx-4 ${step > s.num ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            {step === 1 && (
              <form id="checkout-form">
                <Text as="h2" variant="headingLg" fontWeight="semibold">
                  Shipping Information
                </Text>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      onFocus={() => handleFieldFocus('shipping_first_name', 'text')}
                      onChange={(e) => handleFieldChange('shipping_first_name', 'text', e)}
                      onBlur={(e) => handleFieldBlur('shipping_first_name', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      onFocus={() => handleFieldFocus('shipping_last_name', 'text')}
                      onChange={(e) => handleFieldChange('shipping_last_name', 'text', e)}
                      onBlur={(e) => handleFieldBlur('shipping_last_name', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john.doe@example.com"
                      onFocus={() => handleFieldFocus('shipping_email', 'email')}
                      onChange={(e) => handleFieldChange('shipping_email', 'email', e)}
                      onBlur={(e) => handleFieldBlur('shipping_email', 'email', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="123 Main Street"
                      onFocus={() => handleFieldFocus('shipping_address', 'text')}
                      onChange={(e) => handleFieldChange('shipping_address', 'text', e)}
                      onBlur={(e) => handleFieldBlur('shipping_address', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Apt 4B"
                      onFocus={() => handleFieldFocus('shipping_apartment', 'text')}
                      onChange={(e) => handleFieldChange('shipping_apartment', 'text', e)}
                      onBlur={(e) => handleFieldBlur('shipping_apartment', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="San Francisco"
                      onFocus={() => handleFieldFocus('shipping_city', 'text')}
                      onChange={(e) => handleFieldChange('shipping_city', 'text', e)}
                      onBlur={(e) => handleFieldBlur('shipping_city', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="94102"
                      onFocus={() => handleFieldFocus('shipping_zip_code', 'text')}
                      onChange={(e) => handleFieldChange('shipping_zip_code', 'text', e)}
                      onBlur={(e) => handleFieldBlur('shipping_zip_code', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="(555) 123-4567"
                      onFocus={() => handleFieldFocus('shipping_phone', 'tel')}
                      onChange={(e) => handleFieldChange('shipping_phone', 'tel', e)}
                      onBlur={(e) => handleFieldBlur('shipping_phone', 'tel', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Text as="h3" variant="headingMd" fontWeight="semibold">
                    Shipping Method
                  </Text>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" defaultChecked className="text-green-600" />
                        <div>
                          <div className="font-medium">Standard Shipping</div>
                          <div className="text-sm text-gray-500">5-7 business days</div>
                        </div>
                      </div>
                      <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </label>
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" className="text-green-600" />
                        <div>
                          <div className="font-medium">Express Shipping</div>
                          <div className="text-sm text-gray-500">2-3 business days</div>
                        </div>
                      </div>
                      <span className="font-medium">$14.99</span>
                    </label>
                  </div>
                </div>
              </form>
            )}

            {step === 2 && (
              <form id="checkout-form">
                <Text as="h2" variant="headingLg" fontWeight="semibold">
                  Payment Information
                </Text>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      onFocus={() => handleFieldFocus('payment_card_number', 'text')}
                      onChange={(e) => handleFieldChange('payment_card_number', 'text', e)}
                      onBlur={(e) => handleFieldBlur('payment_card_number', 'text', e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        onFocus={() => handleFieldFocus('payment_expiry_date', 'text')}
                        onChange={(e) => handleFieldChange('payment_expiry_date', 'text', e)}
                        onBlur={(e) => handleFieldBlur('payment_expiry_date', 'text', e)}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cvc"
                        placeholder="123"
                        onFocus={() => handleFieldFocus('payment_cvc', 'text')}
                        onChange={(e) => handleFieldChange('payment_cvc', 'text', e)}
                        onBlur={(e) => handleFieldBlur('payment_cvc', 'text', e)}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      onFocus={() => handleFieldFocus('payment_cardholder_name', 'text')}
                      onChange={(e) => handleFieldChange('payment_cardholder_name', 'text', e)}
                      onBlur={(e) => handleFieldBlur('payment_cardholder_name', 'text', e)}
                      placeholder="John Doe"
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Billing address same as shipping</span>
                  </label>
                </div>
              </form>
            )}

            {step === 3 && (
              <>
                <Text as="h2" variant="headingLg" fontWeight="semibold">
                  Review Your Order
                </Text>

                <div className="mt-6 space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <Text as="h3" variant="bodyMd" fontWeight="semibold">Shipping Address</Text>
                        <p className="text-sm text-gray-600 mt-1">
                          John Doe<br />
                          123 Main Street, Apt 4B<br />
                          San Francisco, 94102<br />
                          (555) 123-4567
                        </p>
                      </div>
                      <Button 
                        variant="plain" 
                        onClick={() => {
                          const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                          trackEvent('button_clicked', {
                            button_id: 'edit_shipping_address',
                            button_text: 'Edit',
                            button_type: 'edit_shipping',
                            time_since_page_load: timeSincePageLoad,
                          });
                          setStep(1);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <Text as="h3" variant="bodyMd" fontWeight="semibold">Payment Method</Text>
                        <p className="text-sm text-gray-600 mt-1">
                          Visa ending in 4242<br />
                          Expires 12/25
                        </p>
                      </div>
                      <Button 
                        variant="plain" 
                        onClick={() => {
                          const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                          trackEvent('button_clicked', {
                            button_id: 'edit_payment_method',
                            button_text: 'Edit',
                            button_type: 'edit_payment',
                            time_since_page_load: timeSincePageLoad,
                          });
                          setStep(2);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Text as="h3" variant="bodyMd" fontWeight="semibold">Order Items</Text>
                    <div className="mt-3 space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <Text as="p" variant="bodyMd" fontWeight="medium">
                              {item.product.title}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Qty: {item.quantity}
                            </Text>
                          </div>
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg border p-6 sticky top-4">
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Order Summary
            </Text>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text as="p" variant="bodySm" truncate>
                      {item.product.title}
                    </Text>
                  </div>
                  <Text as="span" variant="bodySm">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
              ))}
            </div>

            <Divider />

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedPromo})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-6 pt-4 border-t">
              <Text as="h3" variant="bodySm" fontWeight="medium">
                Have a promo code?
              </Text>
              {appliedPromo ? (
                <div className="mt-2 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-center justify-between">
                  <span>Code &quot;{appliedPromo}&quot; applied - 10% off!</span>
                  <button
                    onClick={() => {
                      removePromo();
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
                          button_id: 'apply_promo_code_checkout',
                          button_text: 'Apply',
                          button_type: 'apply_promo',
                          time_since_page_load: timeSincePageLoad,
                        });
                        handleApplyPromo();
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

      {/* Sticky Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {step > 1 ? (
              <Button
                onClick={() => {
                  const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                  trackEvent('button_clicked', {
                    button_id: `checkout_back_step_${step}`,
                    button_text: 'Back',
                    button_type: 'checkout_navigation',
                    current_step: step,
                    new_step: step - 1,
                    time_since_page_load: timeSincePageLoad,
                  });
                  setStep(step - 1);
                }}
              >
                Back
              </Button>
            ) : (
              <Link href="/cart">
                <Button
                  onClick={() => {
                    const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                    trackEvent('button_clicked', {
                      button_id: 'back_to_cart',
                      button_text: 'Back to Cart',
                      button_type: 'navigation',
                      time_since_page_load: timeSincePageLoad,
                    });
                  }}
                >
                  Back to Cart
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <Text as="span" variant="bodySm" tone="subdued">Total</Text>
              <Text as="p" variant="bodyLg" fontWeight="bold">${total.toFixed(2)}</Text>
            </div>
            {step < 3 ? (
              <Button
                variant="primary"
                size="large"
                onClick={() => {
                  const timeSincePageLoad = pageLoadTime ? Date.now() - pageLoadTime : undefined;
                  trackEvent('button_clicked', {
                    button_id: `checkout_next_step_${step}`,
                    button_text: 'Continue',
                    button_type: 'checkout_navigation',
                    current_step: step,
                    new_step: step + 1,
                    time_since_page_load: timeSincePageLoad,
                  });
                  handleNextStep();
                }}
              >
                Continue
              </Button>
            ) : (
              <Button variant="primary" size="large" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for sticky footer */}
      <div className="h-24"></div>
    </div>
  );
}
