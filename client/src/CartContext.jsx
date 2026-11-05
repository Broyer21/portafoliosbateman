import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'mama-huevo-cart';
const LEGACY_STORAGE_KEY = 'casa-clara-cart';

function readCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    const value = JSON.parse(saved || '[]');
    if (saved && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, saved);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  function update(next) {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    add(product) {
      if (product.stock < 1) return;
      const current = items.find((item) => item.id === product.id);
      if (current && current.quantity >= product.stock) return;
      update(current
        ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1 }]);
    },
    setQuantity(id, quantity) {
      if (quantity <= 0) return update(items.filter((item) => item.id !== id));
      update(items.map((item) => item.id === id
        ? { ...item, quantity: Math.min(quantity, item.stock) }
        : item));
    },
    remove(id) {
      update(items.filter((item) => item.id !== id));
    },
    clear() {
      update([]);
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart debe utilizarse dentro de CartProvider.');
  return value;
}
