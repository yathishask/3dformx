import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { Category, HeroSlideRow } from '../types/database';
import { HeroSlide } from '../data/heroSlides';

const PLACEHOLDER_IMAGE = '/images/logo-transparent.png';

function mapRowToProduct(row: any): Product {
  // Sort product_images with primary image first, then by display_order
  const sortedImages =
    row.product_images && Array.isArray(row.product_images) && row.product_images.length > 0
      ? [...row.product_images]
          .sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.display_order ?? 0) - (b.display_order ?? 0);
          })
          .map((img: any) => img.image_url)
      : [PLACEHOLDER_IMAGE];

  // Build technical specs strictly from Supabase row
  const dbSpecs: Record<string, string> =
    row.specs && typeof row.specs === 'object' && Object.keys(row.specs).length > 0
      ? row.specs
      : {
          ...(row.sku ? { SKU: row.sku } : {}),
          ...(row.category?.name ? { Category: row.category.name } : {}),
          ...(row.brand ? { Brand: row.brand } : { Brand: '3D FormX' }),
          'Stock Status':
            Number(row.stock_quantity) > 0
              ? `In Stock (${row.stock_quantity} available)`
              : 'Out of Stock',
        };

  // Build features strictly from Supabase row
  const dbFeatures: string[] = Array.isArray(row.features) ? row.features : [];

  // Build variants strictly from Supabase row
  const dbVariants = Array.isArray(row.variants) && row.variants.length > 0 ? row.variants : undefined;

  return {
    id: row.slug || row.id,
    name: row.name,
    tagline: row.tagline || row.description || '',
    category: (row.category?.slug as any) || 'uncategorized',
    categoryLabel: row.category?.name || 'Uncategorized',
    brand: row.brand || '3D FormX',
    price: Number(row.price),
    originalPrice:
      row.original_price !== null && row.original_price !== undefined
        ? Number(row.original_price)
        : undefined,
    rating:
      row.rating !== null && row.rating !== undefined ? Number(row.rating) : 5.0,
    reviewsCount:
      row.reviews_count !== null && row.reviews_count !== undefined
        ? Number(row.reviews_count)
        : 0,
    badge: row.badge || (row.is_featured ? 'Popular' : undefined),
    badgeType: row.is_featured ? 'bestseller' : undefined,
    images: sortedImages,
    description: row.description || '',
    specs: dbSpecs,
    features: dbFeatures,
    variants: dbVariants,
    inStock: Number(row.stock_quantity) > 0,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
  };
}

export const productService = {
  /**
   * Fetch all active hero banner slides strictly from Supabase `hero_slides` table
   */
  async getHeroSlides(): Promise<HeroSlide[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data) {
        console.error('Error fetching hero_slides from Supabase:', error);
        return [];
      }

      return (data as HeroSlideRow[]).map((row) => ({
        id: row.id,
        image: row.image_url,
        tag: row.tag?.trim() || '',
        subtitle: row.subtitle?.trim() || '',
        title: row.title?.trim() || '',
        priceText: row.price_text?.trim() || '',
        ctaText: row.cta_text?.trim() || '',
        ctaLink: row.cta_link?.trim() || '/shop',
      }));
    } catch (err) {
      console.error('Unexpected error fetching hero_slides:', err);
      return [];
    }
  },

  /**
   * Fetch all active categories strictly from Supabase `categories` table
   * Ordered by `display_order` ascending (1, 2, 3...)
   */
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error || !data) {
        console.error('Error fetching categories from Supabase:', error);
        return [];
      }

      return (data as Category[]).sort((a, b) => {
        const orderA =
          a.display_order !== null && a.display_order !== undefined
            ? Number(a.display_order)
            : 999;
        const orderB =
          b.display_order !== null && b.display_order !== undefined
            ? Number(b.display_order)
            : 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      return [];
    }
  },

  /**
   * Fetch all active products with joined category and images strictly from Supabase
   */
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (
            id,
            name,
            slug
          ),
          product_images (
            image_url,
            is_primary,
            display_order
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching products from Supabase:', error);
        return [];
      }

      return data.map(mapRowToProduct);
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      return [];
    }
  },

  /**
   * Fetch a single product by slug or UUID strictly from Supabase
   */
  async getProductById(idOrSlug: string): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      // First try matching by slug
      const { data: bySlug } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (
            id,
            name,
            slug
          ),
          product_images (
            image_url,
            is_primary,
            display_order
          )
        `)
        .eq('is_active', true)
        .eq('slug', idOrSlug)
        .maybeSingle();

      if (bySlug) {
        return mapRowToProduct(bySlug);
      }

      // Otherwise try matching by UUID id
      const { data: byId } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (
            id,
            name,
            slug
          ),
          product_images (
            image_url,
            is_primary,
            display_order
          )
        `)
        .eq('is_active', true)
        .eq('id', idOrSlug)
        .maybeSingle();

      if (byId) {
        return mapRowToProduct(byId);
      }

      return null;
    } catch (err) {
      console.error('Unexpected error fetching product by ID:', err);
      return null;
    }
  },
};
