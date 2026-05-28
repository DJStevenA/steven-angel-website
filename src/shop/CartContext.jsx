/**
 * CartContext — shopping cart state with localStorage persistence.
 *
 * Items are stored by product ID. Each item is { id, slug, name, price, image }.
 * Digital products = quantity always 1 (no duplicates).
 *
 * Provides: cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal
 */

import React, { createContext, useContext, useState, useCallback } from "react";

const STORAGE_KEY = "shop_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      // No duplicates for digital products
      if (prev.some((item) => item.id === product.id)) return prev;
      const next = [...prev, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        headline: product.headline,
      }];
      saveCart(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== productId);
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, []);

  const isInCart = useCallback((productId) => {
    return cart.some((item) => item.id === productId);
  }, [cart]);

  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isInCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
