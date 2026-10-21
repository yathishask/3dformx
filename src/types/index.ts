export type ProductCategory = 'printers' | 'filaments' | 'resins' | 'scanners' | 'accessories';

export interface ProductVariant {
  id: string;
  name: string;
  inStock: boolean;
  colorHex?: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  categoryLabel: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeType?: 'featured' | 'bestseller' | 'sale' | 'new';
  images: string[];
  description: string;
  specs: Record<string, string>;
  features: string[];
  variants?: ProductVariant[];
  inStock: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: string; // unique cart entry key (productId + variantId)
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  totalPrice: number;
  toastMessage: string | null;
  clearToast: () => void;
}
