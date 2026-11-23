-- Migration 005: Pincode Serviceability & Delivery Partner Ecosystem

-- 1. Serviceable Pincodes & Rules
CREATE TABLE IF NOT EXISTS public.serviceable_pincodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode VARCHAR(6) UNIQUE NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zone TEXT NOT NULL DEFAULT 'standard', -- e.g., 'metro', 'tier2', 'remote'
    is_deliverable BOOLEAN NOT NULL DEFAULT true,
    estimated_days INT NOT NULL DEFAULT 3,
    delivery_charge NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    cod_available BOOLEAN NOT NULL DEFAULT true,
    min_order_free_shipping NUMERIC(10,2) NOT NULL DEFAULT 1999.00,
    assigned_courier TEXT DEFAULT 'In-House Fleet',
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pincodes_lookup ON public.serviceable_pincodes(pincode);

-- 2. Delivery Partners
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'two_wheeler' CHECK (vehicle_type IN ('two_wheeler', 'three_wheeler', 'four_wheeler', 'van')),
    vehicle_number TEXT NOT NULL,
    driving_license TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_on_duty BOOLEAN NOT NULL DEFAULT true,
    current_lat NUMERIC(10,7),
    current_lng NUMERIC(10,7),
    last_location_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_partners_user ON public.delivery_partners(user_id);

-- 3. Deliveries (Assignments & Delivery Runs)
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
        'assigned', 'accepted', 'picked_up', 'in_transit', 
        'out_for_delivery', 'delivered', 'failed', 'returned'
    )),
    delivery_otp VARCHAR(6) NOT NULL,
    otp_verified BOOLEAN NOT NULL DEFAULT false,
    proof_of_delivery_url TEXT,
    failure_reason TEXT,
    notes TEXT,
    customer_signature_url TEXT,
    latitude_at_delivery NUMERIC(10,7),
    longitude_at_delivery NUMERIC(10,7),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    out_for_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_partner ON public.deliveries(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
