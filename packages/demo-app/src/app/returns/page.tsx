'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePageTracking } from '../../hooks/usePageTracking';
import ScrollTracker from '../../components/tracking/ScrollTracker';

export default function ReturnsPage() {
  usePageTracking();
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    reason: '',
    items: '',
    condition: '',
    resolution: '',
    comments: '',
  });
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.orderNumber) newErrors.orderNumber = 'Order number is required';
      if (!formData.email) newErrors.email = 'Email is required';
    } else if (currentStep === 2) {
      if (!formData.reason) newErrors.reason = 'Please select a reason';
      if (!formData.items) newErrors.items = 'Please describe the items';
      if (!formData.condition) newErrors.condition = 'Please select item condition';
    } else if (currentStep === 3) {
      if (!formData.resolution) newErrors.resolution = 'Please select your preferred resolution';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      setFormSubmitted(true);
    }
  };

  if (formSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Return Request Submitted!</h1>
          <p className="text-gray-600 mb-4">
            Your return request #RET-{Math.random().toString(36).substring(2, 8).toUpperCase()} has been received.
          </p>
          <p className="text-gray-600 mb-6">
            You&apos;ll receive an email with your prepaid shipping label and return instructions within 24 hours.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              <li>Print the prepaid shipping label from your email</li>
              <li>Pack items securely in their original packaging if possible</li>
              <li>Attach the label and drop off at any UPS location</li>
              <li>Receive refund within 5-7 days after we receive your return</li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">Returns & Exchanges</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="md:col-span-1">
          <h1 className="text-2xl font-bold mb-6">Returns & Exchanges</h1>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold mb-4">Return Policy Highlights</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">30-day return window</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">Free return shipping (US)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">Original condition required</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">Refunds in 5-7 business days</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">Non-Returnable Items</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Intimate apparel</li>
              <li>• Personalized items</li>
              <li>• Final sale items</li>
              <li>• Items without tags</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            <p className="mb-2">Need help?</p>
            <Link href="/contact" className="text-green-600 hover:text-green-700 font-medium">
              Contact Support &rarr;
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step ? 'bg-green-600 text-white' :
                    s === step ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {s < step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 md:w-24 h-1 mx-2 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Order Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Order Information</h2>
                  <p className="text-gray-600">Enter your order details to start the return process.</p>

                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                        errors.orderNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="SW-12345"
                    />
                    {errors.orderNumber && <p className="mt-1 text-sm text-red-500">{errors.orderNumber}</p>}
                    <p className="mt-1 text-sm text-gray-500">Find this in your order confirmation email</p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Return Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Return Details</h2>
                  <p className="text-gray-600">Tell us about the items you want to return.</p>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Return <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                        errors.reason ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a reason</option>
                      <option value="size">Wrong size</option>
                      <option value="color">Color not as expected</option>
                      <option value="quality">Quality issues</option>
                      <option value="damaged">Arrived damaged</option>
                      <option value="wrong-item">Received wrong item</option>
                      <option value="changed-mind">Changed my mind</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                  </div>

                  <div>
                    <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">
                      Items to Return <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="items"
                      name="items"
                      value={formData.items}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none ${
                        errors.items ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="List the items and quantities you're returning"
                    />
                    {errors.items && <p className="mt-1 text-sm text-red-500">{errors.items}</p>}
                  </div>

                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                        errors.condition ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select condition</option>
                      <option value="new">New with tags</option>
                      <option value="like-new">Like new (tags removed)</option>
                      <option value="used">Used/Worn</option>
                      <option value="defective">Defective/Damaged</option>
                    </select>
                    {errors.condition && <p className="mt-1 text-sm text-red-500">{errors.condition}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Resolution */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Resolution Preference</h2>
                  <p className="text-gray-600">How would you like us to resolve this return?</p>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Resolution <span className="text-red-500">*</span>
                    </label>
                    {[
                      { value: 'refund', label: 'Full Refund', desc: 'Refund to original payment method' },
                      { value: 'store-credit', label: 'Store Credit', desc: 'Get 10% extra as store credit' },
                      { value: 'exchange', label: 'Exchange', desc: 'Exchange for different size/color' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.resolution === option.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resolution"
                          value={option.value}
                          checked={formData.resolution === option.value}
                          onChange={handleChange}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                    {errors.resolution && <p className="mt-1 text-sm text-red-500">{errors.resolution}</p>}
                  </div>

                  <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                      placeholder="Any additional information (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Return Request
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
