-- Migration 004: Customer Addresses, Coupons, Orders, Order Items, Tax Invoices, Returns & Refunds

-- 1. Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.customer_addresses(user_id);

-- 2. Coupons & Promotional Rules
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_cart_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit_total INT,
    usage_count INT NOT NULL DEFAULT 0,
    usage_limit_per_user INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- 3. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. ORD-202611-0001
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Address snapshots (immutable for audit)
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    
    -- Financial breakdown
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
    
    -- Indian GST Taxation
    is_interstate BOOLEAN NOT NULL DEFAULT false,
    taxable_value NUMERIC(12,2) NOT NULL CHECK (taxable_value >= 0),
    cgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cgst_amount >= 0),
    sgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (sgst_amount >= 0),
    igst_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (igst_amount >= 0),
    total_gst NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_gst >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Payment Details
    payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'cod', 'upi', 'card', 'netbanking')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_gateway_order_id TEXT,
    payment_gateway_payment_id TEXT,
    payment_gateway_signature TEXT,
    paid_at TIMESTAMPTZ,
    
    -- Order Fulfillment Status
    order_status TEXT NOT NULL DEFAULT 'placed' CHECK (order_status IN (
        'placed', 'confirmed', 'processing', 'packed', 
        'dispatched', 'in_transit', 'out_for_delivery', 
        'delivered', 'cancelled', 'returned'
    )),
    
    -- Shipping & Courier Details
    delivery_partner_id UUID, -- References delivery_partners(id)
    courier_name TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    expected_delivery_date DATE,
    internal_notes TEXT,
    
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    delivered_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT NOT NULL,
    hsn_code TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    mrp NUMERIC(12,2) NOT NULL CHECK (mrp >= 0),
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable_value NUMERIC(12,2) NOT NULL,
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    cgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    is_imei_tracked BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- 5. Order Item Serial/IMEI Allocations
CREATE TABLE IF NOT EXISTS public.order_item_imeis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    serial_imei_id UUID NOT NULL REFERENCES public.serial_imei_numbers(id) ON DELETE RESTRICT,
    imei_or_serial TEXT NOT NULL
);

-- 6. Tax Invoices (GST Compliant)
CREATE TABLE IF NOT EXISTS public.tax_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL, -- e.g. INV-202611-0001
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    seller_legal_name TEXT NOT NULL,
    seller_gstin TEXT NOT NULL,
    seller_address JSONB NOT NULL,
    buyer_legal_name TEXT NOT NULL,
    buyer_gstin TEXT,
    place_of_supply TEXT NOT NULL, -- State code or state name
    taxable_value NUMERIC(12,2) NOT NULL,
    cgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON public.tax_invoices(order_id);

-- 7. Returns and Replacements
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number TEXT UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    type TEXT NOT NULL DEFAULT 'refund' CHECK (type IN ('refund', 'replacement', 'exchange')),
    reason TEXT NOT NULL,
    customer_notes TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
        'requested', 'approved', 'rejected', 'pickup_scheduled', 
        'picked_up', 'inspected', 'completed', 'cancelled'
    )),
    inspection_notes TEXT,
    refund_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    refund_status TEXT NOT NULL DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processed', 'failed', 'na')),
    refund_gateway_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON public.returns(user_id);
