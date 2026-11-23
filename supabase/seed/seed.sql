-- Comprehensive Seed Data for Aura Luxe Electronics

-- 1. Default Website Settings (Fully Dynamic Store Branding)
INSERT INTO public.website_settings (key, value, description) VALUES
('store_branding', '{
  "store_name": "AURA LUXE ELECTRONICS",
  "tagline": "Precision Engineering Meets Timeless Sophistication",
  "logo_url": "/images/logo.svg",
  "favicon_url": "/favicon.ico",
  "brand_colors": {
    "charcoal": "#151515",
    "noir": "#090909",
    "offwhite": "#F7F7F5",
    "champagne": "#C5A46D",
    "neutralgrey": "#858585"
  },
  "contact": {
    "email": "concierge@auraluxe.com",
    "phone": "+91 98200 12345",
    "whatsapp": "+91 98200 12345",
    "address": "Signature Tower, 18th Floor, Bandra Kurla Complex, Mumbai, Maharashtra 400051"
  },
  "social_links": {
    "instagram": "https://instagram.com/auraluxeelectronics",
    "twitter": "https://twitter.com/auraluxe",
    "youtube": "https://youtube.com/auraluxe"
  },
  "gstin": "27AABCU9603R1ZM",
  "cin": "U72200MH2024PTC123456",
  "announcement_bar": {
    "enabled": true,
    "text": "COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ALL ORDERS ACROSS INDIA",
    "link": "/policies/shipping"
  },
  "features": {
    "loyalty_enabled": true,
    "reviews_enabled": true,
    "qa_enabled": true,
    "comparisons_enabled": true
  }
}'::jsonb, 'Master store branding and business profile'),

('policies', '{
  "return_policy": "We offer an exclusive 7-day white-glove inspection and return guarantee on all eligible luxury electronics. Devices must remain unsealed or returned in factory-mint condition with all original serialized packaging and certification.",
  "shipping_policy": "All domestic deliveries are dispatched via secured, climate-controlled logistics with end-to-end GPS monitoring and mandatory OTP verification upon personal handoff.",
  "warranty_policy": "Every product includes full original manufacturer warranty plus complimentary 1-year Aura Luxe Concierge Care."
}'::jsonb, 'Official legal and operational policies')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Staff Roles
INSERT INTO public.staff_roles (id, name, description, is_system) VALUES
('11111111-1111-1111-1111-111111111101', 'Store Executive', 'Full retail shop inventory and order processing rights', true),
('11111111-1111-1111-1111-111111111102', 'Warehouse Supervisor', 'Multi-warehouse stock, POs, and IMEI management', true),
('11111111-1111-1111-1111-111111111103', 'Customer Concierge', 'Support tickets, returns, and order enquiries', true),
('11111111-1111-1111-1111-111111111104', 'Delivery Dispatcher', 'Driver allocation and delivery run management', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Staff Role Permissions Matrix
INSERT INTO public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_manage) VALUES
-- Store Executive
('11111111-1111-1111-1111-111111111101', 'products', true, false, false, false, false, true, false),
('11111111-1111-1111-1111-111111111101', 'orders', true, true, true, false, true, true, false),
('11111111-1111-1111-1111-111111111101', 'inventory', true, false, true, false, false, true, false),
-- Warehouse Supervisor
('11111111-1111-1111-1111-111111111102', 'inventory', true, true, true, true, true, true, true),
('11111111-1111-1111-1111-111111111102', 'warehouses', true, false, true, false, false, true, false),
('11111111-1111-1111-1111-111111111102', 'purchases', true, true, true, false, true, true, false),
-- Customer Concierge
('11111111-1111-1111-1111-111111111103', 'customers', true, true, true, false, false, false, false),
('11111111-1111-1111-1111-111111111103', 'orders', true, false, false, false, false, false, false),
('11111111-1111-1111-1111-111111111103', 'returns', true, false, true, false, true, false, false),
-- Delivery Dispatcher
('11111111-1111-1111-1111-111111111104', 'delivery', true, true, true, false, true, true, true),
('11111111-1111-1111-1111-111111111104', 'orders', true, false, true, false, false, false, false)
ON CONFLICT (role_id, module) DO NOTHING;

-- 4. Brands
INSERT INTO public.brands (id, name, slug, description, logo_url) VALUES
('22222222-2222-2222-2222-222222222201', 'Apple', 'apple', 'Pioneering design and uncompromising performance ecosystem.', '/images/brands/apple.svg'),
('22222222-2222-2222-2222-222222222202', 'Bang & Olufsen', 'bang-olufsen', 'Danish acoustic mastery, tactile aluminum, and timeless luxury.', '/images/brands/bo.svg'),
('22222222-2222-2222-2222-222222222203', 'Devialet', 'devialet', 'Revolutionary French high-fidelity engineering and pure analog impact.', '/images/brands/devialet.svg'),
('22222222-2222-2222-2222-222222222204', 'Leica', 'leica', 'Legendary German optical precision and artisanal imaging.', '/images/brands/leica.svg'),
('22222222-2222-2222-2222-222222222205', 'Sony', 'sony', 'State-of-the-art cinematic master displays and sensory audio.', '/images/brands/sony.svg'),
('22222222-2222-2222-2222-222222222206', 'Samsung', 'samsung', 'Flagship mobile computing and cutting-edge display innovation.', '/images/brands/samsung.svg')
ON CONFLICT (id) DO NOTHING;

-- 5. Categories
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
('33333333-3333-3333-3333-333333333301', 'Flagship Smartphones', 'flagship-smartphones', 'Handcrafted titanium and aerospace glass mobile computing devices.', 1),
('33333333-3333-3333-3333-333333333302', 'Audiophile Acoustics', 'audiophile-acoustics', 'Precision high-fidelity headphones and sculptural home sound systems.', 2),
('33333333-3333-3333-3333-333333333303', 'Ultra Laptops', 'ultra-laptops', 'Bespoke silicon architectures engineered for creators and executives.', 3),
('33333333-3333-3333-3333-333333333304', 'Cinematic Visuals', 'cinematic-visuals', 'Studio-calibrated master OLEDs and ultra-short throw laser projectors.', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. Warehouses & Retail Stores
INSERT INTO public.warehouses (id, name, code, type, address_line1, city, state, pincode, contact_name, contact_phone) VALUES
('44444444-4444-4444-4444-444444444401', 'Western Central Hub', 'WH-MUM-01', 'warehouse', 'Plot 42, Logistics Park, Bhiwandi', 'Mumbai', 'Maharashtra', '421302', 'Rajesh Sharma', '+91 98200 11111'),
('44444444-4444-4444-4444-444444444402', 'Northern Logistics Center', 'WH-DEL-02', 'warehouse', 'Sector 18, Udyog Vihar', 'Gurugram', 'Haryana', '122015', 'Vikram Malhotra', '+91 98100 22222'),
('44444444-4444-4444-4444-444444444403', 'Aura Luxe Retail Boutique & Salon', 'STORE-BND-01', 'retail_shop', 'Plot C-59, G Block, BKC, Bandra East', 'Mumbai', 'Maharashtra', '400051', 'Aanya Parekh', '+91 98200 33333')
ON CONFLICT (id) DO NOTHING;

-- 7. Serviceable Pincodes (Major Metros & Hubs)
INSERT INTO public.serviceable_pincodes (pincode, city, state, zone, is_deliverable, estimated_days, delivery_charge, cod_available, min_order_free_shipping, assigned_courier) VALUES
('400051', 'Mumbai', 'Maharashtra', 'metro', true, 1, 0.00, true, 1999.00, 'Aura White-Glove Fleet'),
('400001', 'Mumbai', 'Maharashtra', 'metro', true, 1, 0.00, true, 1999.00, 'Aura White-Glove Fleet'),
('110001', 'New Delhi', 'Delhi', 'metro', true, 2, 0.00, true, 1999.00, 'Aura Express Air'),
('122015', 'Gurugram', 'Haryana', 'metro', true, 2, 0.00, true, 1999.00, 'Aura Express Air'),
('560001', 'Bengaluru', 'Karnataka', 'metro', true, 2, 0.00, true, 1999.00, 'Aura Express Air'),
('500001', 'Hyderabad', 'Telangana', 'metro', true, 2, 0.00, true, 1999.00, 'Aura Express Air'),
('600001', 'Chennai', 'Tamil Nadu', 'metro', true, 3, 0.00, true, 1999.00, 'Aura Express Air'),
('700001', 'Kolkata', 'West Bengal', 'metro', true, 3, 0.00, true, 1999.00, 'Aura Express Air')
ON CONFLICT (pincode) DO NOTHING;

-- 8. Products
INSERT INTO public.products (
    id, name, slug, sku, barcode, brand_id, category_id, description, short_description,
    mrp, selling_price, purchase_price, gst_rate, hsn_code, is_imei_tracked, warranty_period_months,
    returnable, return_window_days, is_active, is_featured, is_bestseller, is_trending
) VALUES
-- Product 1: iPhone 16 Pro Max
(
    '55555555-5555-5555-5555-555555555501',
    'Apple iPhone 16 Pro Max (1TB, Desert Titanium)',
    'apple-iphone-16-pro-max-1tb-desert-titanium',
    'APL-IP16PM-1TB-DT',
    '195949000101',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333301',
    'Forged in grade 5 titanium with an exquisite tactile matte textured glass back. Powered by the groundbreaking A18 Pro silicon architecture, Apple Intelligence, and a studio-calibrated 48MP Fusion quad-pixel camera system with 4K 120fps Dolby Vision master capture.',
    'Grade 5 titanium masterpiece powered by A18 Pro silicon with 4K 120fps Dolby Vision.',
    189900.00,
    179900.00,
    155000.00,
    18.00,
    '8517',
    true, -- IMEI Tracked
    12,
    true,
    7,
    true, true, true, true
),
-- Product 2: Bang & Olufsen Beoplay H100
(
    '55555555-5555-5555-5555-555555555502',
    'Bang & Olufsen Beoplay H100 Luxury Wireless Headphones',
    'bang-olufsen-beoplay-h100-infinite-black',
    'BO-H100-BLK',
    '570526000202',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333302',
    'Sculpted from scratch-resistant hardened glass, anodized natural pearl-blasted aluminum, and soft lambskin leather. Features custom 40mm titanium drivers behind aluminum grilles delivering spatial audio tuned by Danish acoustic masters.',
    'Artisanal acoustic headphones crafted in aluminum, hardened glass, and lambskin.',
    149990.00,
    139990.00,
    110000.00,
    18.00,
    '8518',
    true, -- Serial Tracked
    36,
    true,
    7,
    true, true, false, true
),
-- Product 3: Devialet Phantom I 108dB
(
    '55555555-5555-5555-5555-555555555503',
    'Devialet Phantom I 108dB Opéra de Paris Flagship Speaker',
    'devialet-phantom-i-108db-opera-de-paris',
    'DEV-PH1-OPERA',
    '366099000303',
    '22222222-2222-2222-2222-222222222203',
    '33333333-3333-3333-3333-333333333302',
    'Adorned with moon gold leaf side plates applied by the master gilders of Ateliers Gohard in Paris. Produces an astonishing 1100 Watts RMS of zero-distortion, zero-saturation analog-digital hybrid sound, reproducing sub-bass down to 14Hz.',
    'Masterpiece acoustic sculpture with 22-carat moon gold leaf and 1100W RMS power.',
    375000.00,
    349000.00,
    280000.00,
    18.00,
    '8518',
    true,
    60,
    true,
    7,
    true, true, true, false
),
-- Product 4: Apple MacBook Pro 16" M4 Max
(
    '55555555-5555-5555-5555-555555555504',
    'Apple MacBook Pro 16" (M4 Max, 128GB Unified RAM, 4TB SSD)',
    'apple-macbook-pro-16-m4-max-128gb-4tb-space-black',
    'APL-MBP16-M4M-128',
    '195949000404',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333303',
    'The pinnacle of mobile enterprise workstation engineering. Featuring a Liquid Retina XDR display with nano-texture option, 16-core CPU, 40-core GPU, 128GB unified memory bandwidth at 546GB/s, and up to 24 hours of battery efficiency.',
    'Enterprise powerhouse with 16-core M4 Max, 128GB unified RAM, and Liquid Retina XDR.',
    429900.00,
    399900.00,
    345000.00,
    18.00,
    '8471',
    true,
    24,
    true,
    7,
    true, true, false, true
),
-- Product 5: Leica Cine 1 Ultra Short Throw
(
    '55555555-5555-5555-5555-555555555505',
    'Leica Cine 1 120" 4K Laser TV Cinema System',
    'leica-cine-1-120-inch-4k-laser-tv',
    'LCA-CINE1-120',
    '402224000505',
    '22222222-2222-2222-2222-222222222204',
    '33333333-3333-3333-3333-333333333304',
    'Crafted with an iconic perforated aluminum chassis by Leica industrial designers. Employs proprietary triple RGB laser illumination and legendary Summicron optical lens assemblies to deliver 3,000 ANSI lumens of pure cinematic 4K resolution at 120 inches.',
    'Iconic Leica industrial aluminum cinema projector with triple RGB laser and Summicron optics.',
    749000.00,
    699000.00,
    580000.00,
    28.00,
    '8528',
    true,
    36,
    false, -- Non-returnable due to bespoke installation
    0,
    true, true, false, false
)
ON CONFLICT (id) DO NOTHING;

-- 9. Product Images
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
('55555555-5555-5555-5555-555555555501', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop', 'iPhone 16 Pro Max Desert Titanium Angled View', true, 1),
('55555555-5555-5555-5555-555555555502', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop', 'Bang & Olufsen Beoplay H100 Luxury Headphone', true, 1),
('55555555-5555-5555-5555-555555555503', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop', 'Devialet Phantom I Opéra de Paris Gold Edition', true, 1),
('55555555-5555-5555-5555-555555555504', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', 'Apple MacBook Pro 16 Space Black Executive Workstation', true, 1),
('55555555-5555-5555-5555-555555555505', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1200&auto=format&fit=crop', 'Leica Cine 1 Precision Aluminum Laser TV', true, 1)
ON CONFLICT DO NOTHING;

-- 10. Product Specifications
INSERT INTO public.product_specifications (product_id, spec_group, spec_name, spec_value, display_order) VALUES
('55555555-5555-5555-5555-555555555501', 'Architecture', 'Processor', 'Apple A18 Pro chip with 6-core CPU, 6-core GPU, 16-core Neural Engine', 1),
('55555555-5555-5555-5555-555555555501', 'Display', 'Panel', '6.9-inch Super Retina XDR OLED with ProMotion 120Hz & 2000 nits peak', 2),
('55555555-5555-5555-5555-555555555501', 'Optics', 'Main Sensor', '48MP Fusion Camera with anti-reflective lens coating and 5x optical telephoto', 3),
('55555555-5555-5555-5555-555555555502', 'Acoustics', 'Drivers', '40mm custom titanium electro-dynamic drivers', 1),
('55555555-5555-5555-5555-555555555502', 'Materials', 'Housing', 'Aerospace anodized aluminum, hardened glass, genuine lambskin', 2),
('55555555-5555-5555-5555-555555555503', 'Power', 'Amplification', '1100 Watts RMS (Analog Digital Hybrid ADH®)', 1),
('55555555-5555-5555-5555-555555555503', 'Finish', 'Gold Leaf', '22-carat Moon Gold gilded leaf side plates', 2),
('55555555-5555-5555-5555-555555555504', 'Silicon', 'CPU / GPU', 'Apple M4 Max with 16-core CPU and 40-core GPU', 1),
('55555555-5555-5555-5555-555555555504', 'Memory', 'Unified Bandwidth', '128GB Unified Memory with 546GB/s bandwidth', 2)
ON CONFLICT DO NOTHING;

-- 11. Inventory Stock (Allocated between Central Warehouse, Delhi Warehouse, and BKC Retail Salon)
INSERT INTO public.inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, low_stock_threshold) VALUES
-- iPhone 16 Pro Max
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 35, 2, 5),
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444402', 20, 0, 5),
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444403', 8, 1, 3), -- Retail Boutique Stock
-- Bang & Olufsen H100
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 18, 0, 4),
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444403', 6, 0, 2),
-- Devialet Phantom I
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 12, 1, 3),
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444403', 4, 0, 1),
-- MacBook Pro 16"
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401', 15, 0, 3),
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444403', 5, 0, 2),
-- Leica Cine 1
('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444401', 4, 0, 2),
('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444403', 2, 0, 1)
ON CONFLICT (product_id, variant_id, warehouse_id) DO UPDATE SET
quantity_on_hand = EXCLUDED.quantity_on_hand,
quantity_reserved = EXCLUDED.quantity_reserved;

-- 12. Pre-seeded Serial Numbers & IMEIs (Unique tracking)
INSERT INTO public.serial_imei_numbers (product_id, warehouse_id, imei_or_serial, status) VALUES
-- iPhone 16 Pro Max IMEIs
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', '359483084920191', 'in_stock'),
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', '359483084920192', 'in_stock'),
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', '359483084920193', 'in_stock'),
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444403', '359483084920194', 'in_stock'),
-- Devialet Phantom I Serials
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'DVLT-OPERA-2026-9041', 'in_stock'),
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444403', 'DVLT-OPERA-2026-9042', 'in_stock'),
-- MacBook Pro 16 Serials
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401', 'C02G90XJMD6V', 'in_stock'),
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444403', 'C02G90XJMD6W', 'in_stock')
ON CONFLICT (imei_or_serial) DO NOTHING;

-- 13. Promotional Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_cart_value, max_discount_amount, start_date, end_date, is_active) VALUES
('AURAWELCOME', 'Exclusive 5% inaugural privileges on bespoke electronics', 'percentage', 5.00, 50000.00, 15000.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 year', true),
('LUXE10K', 'Flat ₹10,000 celebration privilege on orders exceeding ₹200,000', 'fixed', 10000.00, 200000.00, 10000.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 year', true)
ON CONFLICT (code) DO NOTHING;

-- 14. Homepage CMS Sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, is_active, display_order) VALUES
('hero', 'The Haute Électronique Collection', 'Exquisite craftsmanship meets uncompromising technological supremacy.', true, 1),
('curated_categories', 'Curated Disciplines', 'Explore by sensory experience and engineering domains.', true, 2),
('featured_flagships', 'Iconic Acquisitions', 'Rare, hand-finished electronics engineered without compromise.', true, 3),
('bestsellers', 'Patron Favorites', 'The most coveted acoustic and computational acquisitions.', true, 4),
('white_glove_services', 'The Aura Concierge Standard', 'Discreet delivery, private boutique consultations, and lifetime technical stewardship.', true, 5)
ON CONFLICT (section_key) DO UPDATE SET title = EXCLUDED.title;
