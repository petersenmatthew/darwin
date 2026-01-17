'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<number, 'yes' | 'no' | null>>({});

  const categories = ['All', 'Orders', 'Shipping', 'Returns', 'Products', 'Account', 'Payment'];

  const faqs: FAQItem[] = [
    {
      category: 'Orders',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a confirmation email with a tracking number. You can also log into your account and visit the "Orders" section to see real-time tracking information. If you checked out as a guest, use the tracking link in your shipping confirmation email.',
    },
    {
      category: 'Orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. After that, orders enter our fulfillment process and cannot be changed. To request a modification or cancellation, contact our support team immediately at support@shopwave.com or call 1-800-SHOPWAVE.',
    },
    {
      category: 'Orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. We also offer Klarna and Afterpay for eligible purchases, allowing you to pay in installments.',
    },
    {
      category: 'Shipping',
      question: 'What are your shipping options?',
      answer: 'We offer Standard Shipping (5-7 business days), Express Shipping (2-3 business days), and Next-Day Delivery (order by 2pm EST). Free standard shipping is available on orders over $50. International shipping is available to 45+ countries.',
    },
    {
      category: 'Shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to over 45 countries worldwide. International shipping rates and delivery times vary by destination. Import duties and taxes may apply and are the responsibility of the recipient. You\'ll see the shipping cost at checkout before completing your order.',
    },
    {
      category: 'Shipping',
      question: 'My order shows delivered but I haven\'t received it.',
      answer: 'First, check around your property and with neighbors. Sometimes carriers mark packages as delivered slightly early. If it\'s been 48 hours, contact our support team with your order number and we\'ll investigate and resolve the issue.',
    },
    {
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on all items in their original condition with tags attached. Items must be unworn, unwashed, and unaltered. Some items like intimates and personalized products are final sale. Return shipping is free for US orders.',
    },
    {
      category: 'Returns',
      question: 'How do I start a return?',
      answer: 'Log into your account and go to "Orders". Find the order you want to return and click "Start Return". Select the items and reason for return, then print your prepaid shipping label. Pack the items securely and drop off at any UPS location.',
    },
    {
      category: 'Returns',
      question: 'How long do refunds take?',
      answer: 'Once we receive your return, we\'ll inspect the items within 2-3 business days. Refunds are processed to your original payment method within 5-7 business days after approval. You\'ll receive an email confirmation when your refund is processed.',
    },
    {
      category: 'Returns',
      question: 'Can I exchange an item instead of returning it?',
      answer: 'Currently, we don\'t offer direct exchanges. To get a different size or color, please return the original item for a refund and place a new order. This ensures you get the item you want as quickly as possible.',
    },
    {
      category: 'Products',
      question: 'Are your products authentic?',
      answer: 'Absolutely! We work directly with manufacturers and authorized distributors. Every product is 100% authentic and comes with any applicable warranties. We stand behind the quality of everything we sell.',
    },
    {
      category: 'Products',
      question: 'How do I find my size?',
      answer: 'Each product page includes a detailed size guide. Click the "Size Guide" link near the size selector to view measurements. If you\'re between sizes, we generally recommend sizing up for comfort. Contact us if you need personalized sizing advice.',
    },
    {
      category: 'Products',
      question: 'Will you restock sold out items?',
      answer: 'Many popular items are restocked regularly. Click "Notify Me" on any sold-out product page to receive an email when it\'s back in stock. For limited edition or seasonal items, restocks may not be available.',
    },
    {
      category: 'Account',
      question: 'How do I create an account?',
      answer: 'Click the person icon in the header and select "Sign Up". Enter your email and create a password. You can also sign up using your Google or Apple account for faster access. Having an account lets you track orders, save favorites, and checkout faster.',
    },
    {
      category: 'Account',
      question: 'I forgot my password. What do I do?',
      answer: 'Click "Sign In" then "Forgot Password". Enter your email address and we\'ll send you a password reset link. The link expires after 24 hours. If you don\'t see the email, check your spam folder or contact support.',
    },
    {
      category: 'Account',
      question: 'How do I update my account information?',
      answer: 'Log into your account and go to "Account Settings". From there you can update your name, email, password, shipping addresses, and payment methods. Changes are saved automatically.',
    },
    {
      category: 'Payment',
      question: 'Is my payment information secure?',
      answer: 'Yes! We use industry-standard SSL encryption and are PCI DSS compliant. We never store your full credit card number on our servers. All payments are processed through secure, trusted payment providers.',
    },
    {
      category: 'Payment',
      question: 'Can I use multiple payment methods?',
      answer: 'Currently, we only support one payment method per order. However, you can use a gift card or store credit in combination with another payment method.',
    },
    {
      category: 'Payment',
      question: 'Do you offer gift cards?',
      answer: 'Yes! Digital gift cards are available in amounts from $25 to $500. They\'re delivered via email and never expire. Gift cards can be redeemed at checkout by entering the gift card code.',
    },
  ];

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const handleFeedback = (index: number, helpful: 'yes' | 'no') => {
    setHelpfulFeedback((prev) => ({ ...prev, [index]: helpful }));
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">FAQ</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about orders, shipping, returns, and more.
          Can&apos;t find what you&apos;re looking for? <Link href="/contact" className="text-green-600 hover:text-green-700 font-medium">Contact us</Link>.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No questions found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const actualIndex = faqs.indexOf(faq);
            return (
              <div
                key={actualIndex}
                className="border rounded-lg overflow-hidden hover:border-green-300 transition-colors"
              >
                <button
                  onClick={() => toggleItem(actualIndex)}
                  className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {faq.category}
                    </span>
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openItems.has(actualIndex) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openItems.has(actualIndex) && (
                  <div className="px-4 pb-4 bg-gray-50 border-t">
                    <p className="text-gray-600 py-4">{faq.answer}</p>

                    {/* Feedback */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <span className="text-sm text-gray-500">Was this helpful?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback(actualIndex, 'yes')}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            helpfulFeedback[actualIndex] === 'yes'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleFeedback(actualIndex, 'no')}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            helpfulFeedback[actualIndex] === 'no'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                      {helpfulFeedback[actualIndex] && (
                        <span className="text-sm text-gray-500">Thanks for your feedback!</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Help */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-gray-600 mb-6">
          Our customer support team is here to help you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Contact Support
          </Link>
          <button className="px-6 py-3 border border-gray-300 font-medium rounded-lg hover:bg-white transition-colors">
            Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}
