'use client';

import Link from 'next/link';
import { Text, Button, Icon } from '@shopify/polaris';
import { CheckIcon } from '@shopify/polaris-icons';
import { usePageTracking } from '../../../hooks/usePageTracking';
import ScrollTracker from '../../../components/tracking/ScrollTracker';

export default function CheckoutSuccessPage() {
  usePageTracking();
  const orderNumber = `SW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
          <Icon source={CheckIcon} tone="text-inverse" />
        </div>
      </div>

      <Text as="h1" variant="heading2xl" fontWeight="bold">
        Order Confirmed!
      </Text>

      <Text as="p" variant="bodyLg" tone="subdued">
        Thank you for your purchase
      </Text>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <Text as="p" variant="bodySm" tone="subdued">
          Order Number
        </Text>
        <Text as="p" variant="headingLg" fontWeight="bold">
          {orderNumber}
        </Text>
      </div>

      <div className="mt-8 space-y-4 text-left bg-white border rounded-lg p-6">
        <div className="flex justify-between">
          <Text as="span" tone="subdued">Email Confirmation</Text>
          <Text as="span">john.doe@example.com</Text>
        </div>
        <div className="flex justify-between">
          <Text as="span" tone="subdued">Shipping Address</Text>
          <Text as="span">123 Main Street, San Francisco, CA</Text>
        </div>
        <div className="flex justify-between">
          <Text as="span" tone="subdued">Estimated Delivery</Text>
          <Text as="span">5-7 business days</Text>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/products">
          <Button variant="primary" size="large">
            Continue Shopping
          </Button>
        </Link>
        <Button size="large">
          Track Order
        </Button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        A confirmation email has been sent to your email address.
        <br />
        If you have any questions, please contact our support team.
      </p>
    </div>
  );
}
