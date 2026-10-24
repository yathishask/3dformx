-- ============================================================================
-- 3D FormX - Supabase Complete Database Schema & Migration
-- ============================================================================

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE (references auth.users.id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Automatic Profile Creation Trigger when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);


-- ============================================================================
-- 3. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);


-- ============================================================================
-- 4. PRODUCT IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);


-- ============================================================================
-- 5. ADDRESSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);


-- ============================================================================
-- 6. CARTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);


-- ============================================================================
-- 7. CART ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);


-- ============================================================================
-- 8. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_id TEXT,
    payment_method TEXT DEFAULT 'razorpay',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);


-- ============================================================================
-- 9. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 1. Categories: Publicly readable
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
    ON public.categories FOR SELECT USING (true);

-- 2. Products: Publicly readable when active
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON public.products;
CREATE POLICY "Active products are viewable by everyone" 
    ON public.products FOR SELECT USING (is_active = true);

-- 3. Product Images: Publicly readable
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON public.product_images;
CREATE POLICY "Product images are viewable by everyone" 
    ON public.product_images FOR SELECT USING (true);

-- 4. Profiles: Users can view and edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Addresses: Users can manage their own addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" 
    ON public.addresses FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
CREATE POLICY "Users can insert own addresses" 
    ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" 
    ON public.addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" 
    ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- 6. Carts & Cart Items: Users can manage their own cart
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" 
    ON public.carts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage cart items" ON public.cart_items;
CREATE POLICY "Users can manage cart items" 
    ON public.cart_items FOR ALL USING (
        cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
    );

-- 7. Orders & Order Items: Users can view their own orders; guests and users can place orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" 
    ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order items viewable with order" ON public.order_items;
CREATE POLICY "Order items viewable with order" 
    ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" 
    ON public.order_items FOR INSERT WITH CHECK (true);


-- ============================================================================
-- SEED DATA: CATEGORIES & 3D FORMX CATALOG (Idempotent with Cleanup & (id) Upsert)
-- ============================================================================

-- Clean up any previous seed entries to ensure no primary key or slug collisions
DELETE FROM public.product_images 
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE slug LIKE 'fx-%' OR (id >= 'a0000000-0000-0000-0000-000000000001' AND id <= 'a0000000-0000-0000-0000-000000000015')
);

DELETE FROM public.products 
WHERE slug LIKE 'fx-%' OR (id >= 'a0000000-0000-0000-0000-000000000001' AND id <= 'a0000000-0000-0000-0000-000000000015');

DELETE FROM public.categories 
WHERE slug IN ('printers', 'filaments', 'resins', 'scanners', 'accessories') 
   OR (id >= 'c0000000-0000-0000-0000-000000000001' AND id <= 'c0000000-0000-0000-0000-000000000005');

-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', '3D Printers', 'printers', 'Industrial CoreXY and high-speed precision manufacturing printers.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', true),
    ('c0000000-0000-0000-0000-000000000002', 'Industrial Filaments', 'filaments', 'Carbon fiber composites, PEEK, PA12, and engineering grade spools.', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80', true),
    ('c0000000-0000-0000-0000-000000000003', 'Precision Resins', 'resins', 'High-temp, tough, dental, and castable SLA/DLP 8K resins.', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', true),
    ('c0000000-0000-0000-0000-000000000004', '3D Scanners & Metrology', 'scanners', 'Sub-millimeter optical & laser handheld 3D scanning systems.', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', true),
    ('c0000000-0000-0000-0000-000000000005', 'Spare Parts & Upgrades', 'accessories', 'Hardened titanium nozzles, high-flow hotends, and PEI magnetic plates.', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80', true)
ON CONFLICT (id) DO UPDATE
SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active;

-- Insert Products
INSERT INTO public.products (id, category_id, name, slug, description, price, stock_quantity, sku, is_featured, is_active)
VALUES
    -- 1. Apex-7 CoreXY
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'FormX Apex-7 CoreXY Industrial 3D Printer', 'fx-apex-7', 'Ultra-high speed 600mm/s CoreXY system with 350°C hardened hotend and active chamber heating. Engineered for demanding industrial prototypes in India.', 149999.00, 18, 'FX-PRN-APX7', true, true),
    
    -- 2. Nano-X SLA
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'FormX Nano-X 12K SLA Desktop Precision Printer', 'fx-nano-x', 'Sub-18 micron dental and jewelry precision resin 3D printer with optical auto-heating vat and carbon air scrubber.', 89999.00, 24, 'FX-PRN-NNX12', true, true),
    
    -- 3. Matrix-500
    ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'FormX Matrix-500 Large-Scale Architecture Printer', 'fx-matrix-500', 'Massive 500x500x600mm build envelope featuring dual-independent IDEX extruders for simultaneous multi-material production.', 279999.00, 7, 'FX-PRN-MTX500', false, true),
    
    -- 4. Vector-Pro
    ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'FormX Vector-Pro High-Speed Production Printer', 'fx-vector-pro', 'Reliable industrial workhorse with 500mm/s acceleration, vibration compensation sensors, and automated bed leveling matrix.', 64999.00, 35, 'FX-PRN-VCTPRO', false, true),
    
    -- 5. CarbonX PA12-CF
    ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'CarbonX PA12-CF Carbon Fiber Filament (1kg)', 'fx-pa12-cf', 'Aerospace grade chopped carbon fiber reinforced Nylon 12. Unrivaled tensile strength and thermal resistance up to 180°C.', 4899.00, 110, 'FX-MAT-PA12CF', true, true),
    
    -- 6. DuraPEEK Ultra
    ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'DuraPEEK Ultra High-Temp Filament (500g)', 'fx-peek-ultra', 'Medical and aerospace certified PEEK polymer capable of continuous operation at 250°C. Resists harsh acids and oils.', 12499.00, 30, 'FX-MAT-PEEK500', false, true),
    
    -- 7. AeroPLA+
    ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'FormX AeroPLA+ High-Speed Filament (1kg)', 'fx-aeropla-plus', 'Enhanced impact-resistant PLA engineered for 600mm/s printing speeds without clogging or stringing.', 1699.00, 240, 'FX-MAT-PLAPLUS', false, true),
    
    -- 8. FlexTPU 95A
    ('a0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'FormX FlexTPU 95A Industrial Elastomer (1kg)', 'fx-flextpu-95a', 'Durable shore 95A elastomeric filament resistant to abrasion, petroleum solvents, and repeated mechanical flexure.', 2499.00, 85, 'FX-MAT-TPU95A', false, true),
    
    -- 9. TitanTough 8K Resin
    ('a0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'TitanTough 8K Engineering Photopolymer Resin (1kg)', 'fx-titantough-8k', 'ABS-like mechanical resilience and snap-fit durability with ultra-crisp 8K surface fidelity.', 3899.00, 60, 'FX-RES-TT8K', true, true),
    
    -- 10. PyroCast
    ('a0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'PyroCast High-Heat Resistant Resin (1kg)', 'fx-pyrocast-resin', 'Heat deflection temperature exceeding 230°C. Ideal for injection molding inserts, hot gas manifolds, and testing.', 5699.00, 42, 'FX-RES-PYRO230', false, true),
    
    -- 11. DentalCraft
    ('a0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', 'DentalCraft Bio-Compatible Surgical Guide Resin (1kg)', 'fx-dentalcraft-bio', 'Class I certified biocompatible resin for accurate dental models, clear aligner masters, and implant surgical guides.', 7499.00, 35, 'FX-RES-DENTBIO', false, true),
    
    -- 12. MetriScan-3D
    ('a0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000004', 'FormX MetriScan-3D Handheld Laser Metrology Scanner', 'fx-metriscan-3d', 'Industrial metrology scanner with 22 blue laser crosshairs and 0.02mm certified accuracy for reverse engineering in automotive labs.', 389999.00, 5, 'FX-SCN-MTR3D', true, true),
    
    -- 13. PolyScan Go
    ('a0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000004', 'PolyScan Go Portable Optical 3D Scanner', 'fx-polyscan-go', 'Portable structured light scanner capturing geometry and full 24-bit color texture in seconds for VR, artifacts, and industrial design.', 119999.00, 12, 'FX-SCN-PLYGO', false, true),
    
    -- 14. Volcano-X Nozzle
    ('a0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000005', 'Volcano-X Tungsten Carbide High-Flow Nozzle (0.4mm)', 'fx-volcano-nozzle', 'Diamond-hard tungsten carbide core wrapped in copper alloy. Extrudes 1000kg of abrasive carbon fiber with zero orifice wear.', 3299.00, 150, 'FX-ACC-TC04', false, true),
    
    -- 15. MagnePlate PEI
    ('a0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000005', 'MagnePlate Double-Sided Textured PEI Spring Steel Sheet (350mm)', 'fx-magneplate-pei', 'Spring steel build plate with textured powder-coated PEI on side A and satin smooth PEI on side B. Parts pop off upon cooling.', 2499.00, 95, 'FX-ACC-PEI350', false, true)
ON CONFLICT (id) DO UPDATE
SET 
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    sku = EXCLUDED.sku,
    is_featured = EXCLUDED.is_featured,
    is_active = EXCLUDED.is_active;

-- Insert Product Images
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80', false, 1),
    ('a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', false, 2),
    ('a0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', false, 1),
    ('a0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80', true, 0),
    ('a0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80', true, 0);
