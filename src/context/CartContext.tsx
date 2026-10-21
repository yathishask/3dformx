import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartContextType, CartItem, Product, ProductVariant } from '../types';

const CART_STORAGE_KEY = '3dformx_cart_v1';
const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING_FEE = 99;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    const chosenVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const cartItemId = chosenVariant ? `${product.id}_${chosenVariant.id}` : product.id;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: cartItemId, product, quantity, selectedVariant: chosenVariant }];
    });

    const variantLabel = chosenVariant ? ` (${chosenVariant.name})` : '';
    showToast(`Added ${quantity}x "${product.name}${variantLabel}" to cart`);
  };

  const removeFromCart = (cartItemId: string) => {
    const item = cart.find(i => i.id === cartItemId);
    setCart(prev => prev.filter(i => i.id !== cartItemId));
    if (item) {
      showToast(`Removed "${item.product.name}" from cart`);
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Your cart has been cleared');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  // 18% GST is included in MRP (standard in Indian e-commerce), show GST portion
  const tax = Math.round((subtotal * 18) / 118);
  const totalPrice = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shipping,
        tax,
        totalPrice,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
