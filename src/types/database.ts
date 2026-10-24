export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductRow {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  tagline?: string | null;
  brand?: string | null;
  description: string | null;
  price: number;
  original_price?: number | null;
  stock_quantity: number;
  sku: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  badge?: string | null;
  specs?: Record<string, string> | null;
  features?: string[] | null;
  variants?: any[] | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface CartRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: ProductRow;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  address_id: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id?: string | null;
  payment_method?: string | null;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
  address?: Address;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface HeroSlideRow {
  id: string;
  image_url: string;
  tag?: string | null;
  subtitle?: string | null;
  title?: string | null;
  price_text?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  display_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
