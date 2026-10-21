export interface HeroSlide {
  id: string;
  image: string;
  tag: string;
  subtitle: string;
  title: string;
  priceText: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Hero Banner Slideshow Images & Content
 * You can add, remove, or replace image URLs here anytime.
 * Supports both external URLs and local images placed in /public/images/ (e.g., '/images/banner1.jpg')
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=85',
    tag: 'THE GREAT 3D FESTIVAL',
    subtitle: '3D FORMX SIGNATURE SERIES',
    title: 'CUSTOM 3D PRINTS & GIFTS',
    priceText: 'Starting from ₹ 499',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop?category=printers',
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1920&q=85',
    tag: 'NEW COLLECTION LIVE',
    subtitle: 'PRECISION MOTORSPORT & F1 COLLECTIBLES',
    title: 'F1 MINIATURES & KEYCHAINS',
    priceText: 'Starting from ₹ 299',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop?category=filaments',
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1920&q=85',
    tag: 'INDUSTRIAL GRADE',
    subtitle: 'HIGH-PRECISION RESIN &ACCESSORIES',
    title: 'PREMIUM KEYCHAINS & MODELS',
    priceText: 'Starting from ₹ 199',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop?category=resins',
  },
  {
    id: 'slide-4',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1920&q=85',
    tag: 'PAN-INDIA EXPRESS DELIVERY',
    subtitle: 'ENGINEERED FOR PERFECTION',
    title: 'EXPLORE FULL 3D CATALOG',
    priceText: 'Starting from ₹ 399',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop',
  },
];
