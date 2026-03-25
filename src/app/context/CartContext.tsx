import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { CartItem, Product, ProductVariant, Order, OrderNotificationRow, products } from '../data/products';
import { getOrders, postOrder, getToken, type ApiOrder } from '../lib/api';
import { useAuth } from './AuthContext';

function toOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    items: o.items as CartItem[],
    total: o.total,
    status: o.status as Order['status'],
    createdAt: new Date(o.createdAt),
    estimatedTime: o.estimatedTime,
    deliveryAddress: o.deliveryAddress,
    pickupLocation: o.pickupLocation,
    paymentMethod: o.paymentMethod,
    cancelReason: o.cancelReason,
    notifications: o.notifications as OrderNotificationRow[] | undefined,
  };
}

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  ordersLoading: boolean;
  /** True when the last orders fetch failed (e.g. API down); orders may be stale or empty. */
  ordersError: boolean;
  refreshOrders: () => Promise<void>;
  addToCart: (product: Product, quantity: number, files?: File[], variant?: ProductVariant | null) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (
    deliveryAddress?: string,
    pickupLocation?: string,
    paymentMethod?: string,
    estimatedTime?: string,
  ) => Promise<string>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  /** Add all line items from a past order to the cart (catalog match by product id). */
  reorderFromOrder: (order: Order) => void;
  discountCode: string;
  discountRate: number;
  applyPromoCode: (code: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, authReady, refreshSession } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number>(0);

  const applyPromoCode = (code: string) => {
    const c = code.trim().toUpperCase();
    if (c === 'FLASH10') {
      setDiscountCode(c);
      setDiscountRate(0.10);
      return true;
    } else if (c === 'CLB5') {
      setDiscountCode(c);
      setDiscountRate(0.05);
      return true;
    }
    setDiscountCode('');
    setDiscountRate(0);
    return false;
  };

  const refreshOrders = useCallback(async () => {
    if (!getToken() || !user?.id) {
      setOrders([]);
      setOrdersError(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const list = await getOrders();
      setOrders(list.map(toOrder));
      setOrdersError(false);
    } catch {
      setOrdersError(true);
    } finally {
      setOrdersLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authReady) return;
    if (!user?.id || !getToken()) {
      setOrders([]);
      setOrdersError(false);
      return;
    }
    void refreshOrders();
  }, [authReady, user?.id, refreshOrders]);

  const addToCart = (product: Product, quantity: number, files?: File[], variant?: ProductVariant | null) => {
    setCart((prevCart) => {
      const actualProduct = variant
        ? { ...product, id: `${product.id}-${variant.id}`, name: `${product.name} - ${variant.name}`, price: variant.price }
        : product;
      const existingItem = prevCart.find((item) => item.id === actualProduct.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === actualProduct.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                files: files ? [...(item.files || []), ...files] : item.files,
              }
            : item,
        );
      }
      return [...prevCart, { ...actualProduct, quantity, files }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
    setDiscountRate(0);
  };

  const reorderFromOrder = useCallback((order: Order) => {
    setCart((prevCart) => {
      let next = [...prevCart];
      for (const line of order.items) {
        const product = products.find((p) => p.id === line.id);
        if (!product) continue;
        const existing = next.find((i) => i.id === product.id);
        if (existing) {
          next = next.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + line.quantity } : i,
          );
        } else {
          next.push({ ...product, quantity: line.quantity });
        }
      }
      return next;
    });
  }, []);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const placeOrder = async (
    deliveryAddress?: string,
    pickupLocation?: string,
    paymentMethod?: string,
    estimatedTime?: string,
  ) => {
    const items = cart.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      image: item.image,
      unit: item.unit,
      minQuantity: item.minQuantity,
      fileNames: item.files?.map((f) => f.name),
    }));
    const created = await postOrder({
      items,
      total: getCartTotal(),
      deliveryAddress,
      pickupLocation,
      paymentMethod,
      estimatedTime,
    });
    clearCart();
    const order = toOrder(created);
    setOrders((prev) => [order, ...prev]);
    void refreshSession();
    return created.id;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        ordersLoading,
        ordersError,
        refreshOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        getCartTotal,
        getCartItemCount,
        reorderFromOrder,
        discountCode,
        discountRate,
        applyPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
