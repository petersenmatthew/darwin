'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ShippingPage() {
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [postalCode, setPostalCode] = useState('');
  const [calculatedRates, setCalculatedRates] = useState<null | { standard: string; express: string; overnight: string }>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate rate calculation
    setCalculatedRates({
      standard: 'Free',
      express: '$9.99',
      overnight: '$24.99',
    });
  };

  const shippingOptions = [
    {
      name: 'Standard Shipping',
      time: '5-7 business days',
      price: 'Free on orders over $50',
      description: 'Our most economical option. Perfect for non-urgent orders.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Express Shipping',
      time: '2-3 business days',
      price: '$9.99',
      description: 'Get your order faster with our express service.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: 'Next-Day Delivery',
      time: '1 business day',
      price: '$24.99',
      description: 'Order by 2pm EST for delivery the next business day.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const internationalCountries = [
    { code: 'ca', name: 'Canada', time: '7-14 days', price: 'From $14.99' },
    { code: 'uk', name: 'United Kingdom', time: '10-14 days', price: 'From $19.99' },
    { code: 'de', name: 'Germany', time: '10-14 days', price: 'From $19.99' },
    { code: 'fr', name: 'France', time: '10-14 days', price: 'From $19.99' },
    { code: 'au', name: 'Australia', time: '14-21 days', price: 'From $24.99' },
    { code: 'jp', name: 'Japan', time: '10-14 days', price: 'From $22.99' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">Shipping Information</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Shipping Information</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We offer fast, reliable shipping to get your orders to you as quickly as possible.
          Free standard shipping on all US orders over $50.
        </p>
      </div>

      {/* US Shipping Options */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">US Shipping Options</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                {option.icon}
              </div>
              <h3 className="font-semibold mb-1">{option.name}</h3>
              <p className="text-green-600 font-medium mb-2">{option.time}</p>
              <p className="text-sm text-gray-500 mb-2">{option.price}</p>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Calculator */}
      <section className="mb-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Shipping Calculator</h2>
        <p className="text-gray-600 mb-6">
          Enter your location to see estimated shipping costs and delivery times.
        </p>

        <form onSubmit={handleCalculate} className="grid md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="uk">United Kingdom</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
              <option value="au">Australia</option>
              <option value="jp">Japan</option>
            </select>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Enter postal code"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Calculate
            </button>
          </div>
        </form>

        {calculatedRates && (
          <div className="mt-6 bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-4">Estimated Shipping Rates:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Standard:</span>
                <span className="font-medium">{calculatedRates.standard}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Express:</span>
                <span className="font-medium">{calculatedRates.express}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Overnight:</span>
                <span className="font-medium">{calculatedRates.overnight}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* International Shipping */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">International Shipping</h2>
        <p className="text-gray-600 mb-6">
          We ship to over 45 countries worldwide. International orders may be subject to
          import duties and taxes, which are the responsibility of the recipient.
        </p>

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Country</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Delivery Time</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Starting Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {internationalCountries.map((country) => (
                <tr key={country.code} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">{country.name}</td>
                  <td className="px-6 py-4 text-gray-600">{country.time}</td>
                  <td className="px-6 py-4 font-medium text-green-600">{country.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          * Delivery times are estimates and may vary. Tracking is available for all international shipments.
        </p>
      </section>

      {/* Order Tracking */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Order Tracking</h2>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            Track your order using your order number and email address.
          </p>
          <form className="flex gap-4">
            <input
              type="text"
              placeholder="Order Number (e.g., SW-12345)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Track Order
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Shipping FAQ</h2>
        <div className="space-y-4">
          {[
            {
              q: 'When will my order ship?',
              a: 'Orders placed before 2pm EST Monday-Friday typically ship the same day. Orders placed on weekends or holidays ship the next business day.',
            },
            {
              q: 'Can I change my shipping address after ordering?',
              a: 'Contact us within 1 hour of placing your order and we\'ll do our best to update the shipping address. Once an order has shipped, the address cannot be changed.',
            },
            {
              q: 'Do you offer free shipping?',
              a: 'Yes! We offer free standard shipping on all US orders over $50. Use code FREESHIP at checkout.',
            },
            {
              q: 'What carriers do you use?',
              a: 'We use UPS, FedEx, and USPS depending on the shipping method selected and delivery location. You\'ll receive tracking information via email once your order ships.',
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 hover:border-green-300 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-green-50 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-gray-600 mb-6">
          Our customer service team is happy to help with any shipping inquiries.
        </p>
        <Link
          href="/contact"
          className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
