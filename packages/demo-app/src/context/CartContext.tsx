'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Product } from '../data/products';
import { trackEvent, getPageName } from '../amplitude';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const checkoutStartTime = useRef<number | null>(null);
  const hasTrackedCheckoutStart = useRef<boolean>(false);

  // Track checkout goal start
  useEffect(() => {
    if (items.length > 0 && !hasTrackedCheckoutStart.current) {
      checkoutStartTime.current = Date.now();
      hasTrackedCheckoutStart.current = true;
    }
  }, [items.length]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      // Track goal completed (add to cart)
      trackEvent('goal_completed', {
        goal_type: 'add_to_cart',
        goal_id: `add_to_cart_${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        page_name: getPageName(),
      });

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    // Track checkout goal completion
    if (checkoutStartTime.current) {
      const timeOnGoal = Date.now() - checkoutStartTime.current;
      trackEvent('goal_completed', {
        goal_type: 'checkout',
        goal_id: `checkout_${Date.now()}`,
        cart_value: getCartTotal(),
        time_on_goal: timeOnGoal,
        page_name: getPageName(),
      });
      checkoutStartTime.current = null;
      hasTrackedCheckoutStart.current = false;
    }
    setItems([]);
  };

  // Track checkout abandonment when items are removed without completing checkout
  useEffect(() => {
    if (items.length === 0 && checkoutStartTime.current && hasTrackedCheckoutStart.current) {
      const timeOnGoal = checkoutStartTime.current ? Date.now() - checkoutStartTime.current : 0;
      trackEvent('goal_abandoned', {
        goal_type: 'checkout',
        goal_id: `checkout_abandoned_${Date.now()}`,
        time_on_goal: timeOnGoal,
        page_name: getPageName(),
      });
      checkoutStartTime.current = null;
      hasTrackedCheckoutStart.current = false;
    }
  }, [items.length]);

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
