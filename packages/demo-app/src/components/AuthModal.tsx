'use client';

import { useState } from 'react';
import { Text, Button, Icon } from '@shopify/polaris';
import { XIcon } from '@shopify/polaris-icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'guest'>('signin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Text as="h2" variant="headingLg" fontWeight="bold">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'guest' && 'Continue as Guest'}
          </Text>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Icon source={XIcon} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'guest' ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">👋</div>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                No account needed!
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                You can browse and shop without creating an account. Your cart will be saved for this session.
              </Text>
              <div className="mt-6 space-y-3">
                <Button variant="primary" size="large" fullWidth onClick={onClose}>
                  Continue Shopping
                </Button>
                <Button size="large" fullWidth onClick={() => setMode('signup')}>
                  Create Account for Benefits
                </Button>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
                <Text as="h4" variant="bodySm" fontWeight="semibold">
                  Benefits of creating an account:
                </Text>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Track your orders</li>
                  <li>• Save items to wishlist</li>
                  <li>• Faster checkout</li>
                  <li>• Exclusive member discounts</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Social Login */}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 border rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-xl">G</span>
                  Continue with Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 border rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-xl">🍎</span>
                  Continue with Apple
                </button>
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 border-t"></div>
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 border-t"></div>
              </div>

              {/* Email Form */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                {mode === 'signin' && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-green-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}
                <Button variant="primary" size="large" fullWidth submit>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-6 text-center text-sm">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-green-600 font-medium hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="text-green-600 font-medium hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>

              {/* Guest Option */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('guest')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Continue as guest →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
