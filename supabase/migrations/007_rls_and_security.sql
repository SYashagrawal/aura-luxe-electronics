-- Migration 007: Row Level Security (RLS), Role Helper Functions & Inventory Safety Transactions

-- 1. Helper Functions for RBAC in PostgreSQL
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(v_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_staff_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role TEXT;
    v_has_perm BOOLEAN := false;
BEGIN
    SELECT role INTO v_user_role FROM public.profiles WHERE id = auth.uid();
    
    -- Super Admin has universal permission
    IF v_user_role = 'super_admin' THEN
        RETURN true;
    END IF;
    
    -- Non-staff has no permission
    IF v_user_role != 'staff' THEN
        RETURN false;
    END IF;
    
    -- Check specific granular permission in role_permissions
    SELECT 
        CASE 
            WHEN p_action = 'view' THEN rp.can_view
            WHEN p_action = 'create' THEN rp.can_create
            WHEN p_action = 'edit' THEN rp.can_edit
            WHEN p_action = 'delete' THEN rp.can_delete
            WHEN p_action = 'approve' THEN rp.can_approve
            WHEN p_action = 'export' THEN rp.can_export
            WHEN p_action = 'manage' THEN rp.can_manage
            ELSE false
        END INTO v_has_perm
    FROM public.staff_profiles sp
    JOIN public.role_permissions rp ON sp.role_id = rp.role_id
    WHERE sp.user_id = auth.uid() AND sp.is_active = true AND rp.module = p_module;
    
    RETURN COALESCE(v_has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Concurrency-Safe Stock Reservation Function
CREATE OR REPLACE FUNCTION public.reserve_stock_for_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_item RECORD;
    v_available INT;
BEGIN
    FOR v_item IN (SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
        -- Lock row for concurrency safety
        SELECT (quantity_on_hand - quantity_reserved) INTO v_available
        FROM public.inventory
        WHERE product_id = v_item.product_id 
          AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL))
        FOR UPDATE;
        
        IF v_available IS NULL OR v_available < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product id % (variant: %)', v_item.product_id, v_item.variant_id;
        END IF;
        
        UPDATE public.inventory
        SET quantity_reserved = quantity_reserved + v_item.quantity,
            updated_at = NOW()
        WHERE product_id = v_item.product_id
          AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL));
    END LOOP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serial_imei_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_imeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serviceable_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- 4. Essential Policies
-- Profiles: Users can read and update their own profile; Super Admin has full access
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public Catalog: Anyone can read active categories, brands, products, variants, images, specs, banners, settings
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view active brands" ON public.brands FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view active variants" ON public.product_variants FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public can view product specs" ON public.product_specifications FOR SELECT USING (true);
CREATE POLICY "Public can view active banners" ON public.website_banners FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view homepage sections" ON public.homepage_sections FOR SELECT USING (is_active = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view website settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.customer_reviews FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can view published FAQs" ON public.product_faqs FOR SELECT USING (is_published = true OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Public can check serviceable pincodes" ON public.serviceable_pincodes FOR SELECT USING (true);

-- Customer Data: Addresses & Orders
CREATE POLICY "Users manage own addresses" ON public.customer_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.get_current_user_role() IN ('super_admin', 'staff')))
);
CREATE POLICY "Users can view own invoices" ON public.tax_invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = tax_invoices.order_id AND (orders.user_id = auth.uid() OR public.get_current_user_role() IN ('super_admin', 'staff')))
);
CREATE POLICY "Users manage own returns" ON public.returns FOR ALL USING (auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Users manage own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'staff'));
CREATE POLICY "Users view messages of own tickets" ON public.support_ticket_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_ticket_messages.ticket_id AND (support_tickets.user_id = auth.uid() OR public.get_current_user_role() IN ('super_admin', 'staff')))
);

-- Delivery Partner Policies: Can see deliveries assigned to them
CREATE POLICY "Delivery partner can view assigned deliveries" ON public.deliveries FOR SELECT USING (
    delivery_partner_id IN (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()) OR public.get_current_user_role() IN ('super_admin', 'staff')
);
CREATE POLICY "Delivery partner can update assigned deliveries" ON public.deliveries FOR UPDATE USING (
    delivery_partner_id IN (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()) OR public.get_current_user_role() IN ('super_admin', 'staff')
);

-- Super Admin and Staff Full Management Policies
CREATE POLICY "Super admin full access products" ON public.products FOR ALL USING (public.get_current_user_role() = 'super_admin' OR public.has_staff_permission('products', 'edit'));
CREATE POLICY "Super admin full access inventory" ON public.inventory FOR ALL USING (public.get_current_user_role() = 'super_admin' OR public.has_staff_permission('inventory', 'manage'));
CREATE POLICY "Super admin full access orders" ON public.orders FOR UPDATE USING (public.get_current_user_role() = 'super_admin' OR public.has_staff_permission('orders', 'edit'));
CREATE POLICY "Super admin full access settings" ON public.website_settings FOR ALL USING (public.get_current_user_role() = 'super_admin' OR public.has_staff_permission('cms', 'manage'));
CREATE POLICY "Super admin full access staff" ON public.staff_profiles FOR ALL USING (public.get_current_user_role() = 'super_admin');
