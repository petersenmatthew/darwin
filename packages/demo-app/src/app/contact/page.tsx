'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePageTracking } from '../../hooks/usePageTracking';
import { useFormTracking } from '../../hooks/useFormTracking';

export default function ContactPage() {
  const { pageLoadTime } = usePageTracking();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    orderNumber: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    trackFieldFocus,
    trackFieldUnfocus,
    trackFieldChanged,
    trackFieldCompleted,
    trackFieldSkipped,
    trackFormError,
    trackFormSubmitted,
  } = useFormTracking({
    formId: 'contact_form',
    formName: 'Contact Form',
    pageLoadTime,
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Track field change
    const fieldType = name === 'email' ? 'email' : name === 'phone' ? 'tel' : name === 'subject' ? 'select' : name === 'message' ? 'textarea' : 'text';
    trackFieldChanged(name, fieldType, value);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    // Determine field type based on field name and input type
    let fieldType = 'text';
    if (fieldName === 'email') {
      fieldType = 'email';
    } else if (fieldName === 'phone') {
      fieldType = 'tel';
    } else if (fieldName === 'subject') {
      fieldType = 'select';
    } else if (fieldName === 'message') {
      fieldType = 'textarea';
    }
    trackFieldFocus(fieldName, fieldType);
  };

  const handleBlur = (fieldName: string) => {
    setFocusedField(null);
    const fieldType = fieldName === 'email' ? 'email' : fieldName === 'phone' ? 'tel' : fieldName === 'subject' ? 'select' : fieldName === 'message' ? 'textarea' : 'text';
    const hasValue = (formData[fieldName as keyof typeof formData]).trim() !== '';
    
    // Track unfocus event
    trackFieldUnfocus(fieldName, fieldType, hasValue);
    
    // Validate on blur
    if (fieldName === 'email' && formData.email && !validateEmail(formData.email)) {
      const errorMsg = 'Please enter a valid email address';
      setErrors((prev) => ({ ...prev, email: errorMsg }));
      trackFormError(fieldName, errorMsg);
    } else if (fieldName === 'name' && !formData.name) {
      const errorMsg = 'Name is required';
      setErrors((prev) => ({ ...prev, name: errorMsg }));
      trackFormError(fieldName, errorMsg);
    } else if (hasValue) {
      trackFieldCompleted(fieldName, fieldType, true);
    } else if (fieldName === 'name' || fieldName === 'email' || fieldName === 'subject' || fieldName === 'message') {
      // Required fields that are empty
      trackFieldSkipped(fieldName, fieldType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Track errors
      Object.entries(newErrors).forEach(([field, error]) => {
        trackFormError(field, error);
      });
      return;
    }

    // Track form submission
    trackFormSubmitted();

    // Simulate form submission
    setFormSubmitted(true);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We&apos;ll get back to you within 24-48 hours.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                setFormSubmitted(false);
                setFormData({ name: '', email: '', phone: '', subject: '', orderNumber: '', message: '' });
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">Contact Us</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="md:col-span-1">
          <h1 className="text-3xl font-bold mb-6">Get in Touch</h1>
          <p className="text-gray-600 mb-8">
            Have a question or feedback? We&apos;d love to hear from you. Fill out the form and our team will get back to you shortly.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">support@shopwave.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-gray-600">1-800-SHOPWAVE</p>
                <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-gray-600">123 Commerce Street</p>
                <p className="text-gray-600">San Francisco, CA 94102</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-gray-600">Available 24/7</p>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium mt-1">
                  Start Chat &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-medium mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-xl font-semibold mb-6">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                      errors.name ? 'border-red-500' : focusedField === 'name' ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                      errors.email ? 'border-red-500' : focusedField === 'email' ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                      focusedField === 'phone' ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number (if applicable)
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    onFocus={() => handleFocus('orderNumber')}
                    onBlur={() => handleBlur('orderNumber')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                      focusedField === 'orderNumber' ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="SW-12345"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => handleFocus('subject')}
                  onBlur={() => handleBlur('subject')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                    errors.subject ? 'border-red-500' : focusedField === 'subject' ? 'border-green-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="shipping">Shipping Question</option>
                  <option value="return">Return/Exchange</option>
                  <option value="product">Product Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none ${
                    errors.message ? 'border-red-500' : focusedField === 'message' ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="How can we help you?"
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-600">
                  Subscribe to our newsletter for updates and offers
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
