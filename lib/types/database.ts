export type UserRole = 'customer' | 'staff' | 'super_admin' | 'delivery_partner';

export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export type StaffModule = 
  | 'products'
  | 'pricing'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'warehouses'
  | 'purchases'
  | 'suppliers'
  | 'finance'
  | 'returns'
  | 'delivery'
  | 'reports'
  | 'exports'
  | 'cms'
  | 'staff';

export type StaffAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'manage';

export interface RolePermission {
  id: string;
  role_id: string;
  module: StaffModule;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  can_manage: boolean;
}

export interface StaffRole {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  permissions?: RolePermission[];
}

export interface StaffProfile {
  id: string;
  user_id: string;
  role_id: string;
  employee_code: string;
  department: string;
  is_active: boolean;
  user?: Profile;
  role?: StaffRole;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  subcategories?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string;
  title: string;
  color?: string;
  storage?: string;
  ram?: string;
  additional_price: number;
  mrp: number;
  selling_price: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id?: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  spec_group: string;
  spec_name: string;
  spec_value: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  brand_id?: string;
  category_id?: string;
  description: string;
  short_description?: string;
  mrp: number;
  selling_price: number;
  purchase_price: number;
  discount_percent: number;
  gst_rate: number; // 0, 5, 12, 18, 28
  hsn_code: string;
  is_imei_tracked: boolean;
  warranty_period_months: number;
  returnable: boolean;
  return_window_days: number;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  total_stock?: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: 'warehouse' | 'retail_shop';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  contact_name?: string;
  contact_phone?: string;
  is_active: boolean;
}

export interface InventoryRecord {
  id: string;
  product_id: string;
  variant_id?: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_damaged: number;
  low_stock_threshold: number;
  product?: Product;
  variant?: ProductVariant;
  warehouse?: Warehouse;
}

export type SerialStatus = 'in_stock' | 'reserved' | 'sold' | 'returned' | 'defective';

export interface SerialImeiRecord {
  id: string;
  product_id: string;
  variant_id?: string;
  warehouse_id: string;
  imei_or_serial: string;
  status: SerialStatus;
  order_id?: string;
  sold_at?: string;
  warranty_expires_at?: string;
  notes?: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  address_type: 'home' | 'work' | 'other';
  full_name: string;
  phone: string;
  alternate_phone?: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface ServiceablePincode {
  id: string;
  pincode: string;
  city: string;
  state: string;
  zone: string;
  is_deliverable: boolean;
  estimated_days: number;
  delivery_charge: number;
  cod_available: boolean;
  min_order_free_shipping: number;
  assigned_courier?: string;
  special_instructions?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_cart_value: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit_total?: number;
  usage_count: number;
  usage_limit_per_user: number;
  is_active: boolean;
}

export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title?: string;
  sku: string;
  hsn_code: string;
  quantity: number;
  unit_price: number;
  mrp: number;
  discount: number;
  taxable_value: number;
  gst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_price: number;
  is_imei_tracked: boolean;
  assigned_imeis?: string[];
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: CustomerAddress;
  billing_address: CustomerAddress;
  subtotal: number;
  discount_amount: number;
  coupon_id?: string;
  delivery_charge: number;
  is_interstate: boolean;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_gateway_order_id?: string;
  payment_gateway_payment_id?: string;
  paid_at?: string;
  order_status: OrderStatus;
  delivery_partner_id?: string;
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  expected_delivery_date?: string;
  internal_notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface TaxInvoice {
  id: string;
  invoice_number: string;
  order_id: string;
  invoice_date: string;
  seller_legal_name: string;
  seller_gstin: string;
  seller_address: Record<string, string>;
  buyer_legal_name: string;
  buyer_gstin?: string;
  place_of_supply: string;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  pdf_url?: string;
  created_at: string;
}

export type DeliveryStatus = 
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface DeliveryPartner {
  id: string;
  user_id: string;
  partner_name: string;
  phone: string;
  vehicle_type: 'two_wheeler' | 'three_wheeler' | 'four_wheeler' | 'van';
  vehicle_number: string;
  driving_license?: string;
  is_active: boolean;
  is_on_duty: boolean;
  current_lat?: number;
  current_lng?: number;
  last_location_updated_at?: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_partner_id?: string;
  status: DeliveryStatus;
  delivery_otp: string;
  otp_verified: boolean;
  proof_of_delivery_url?: string;
  failure_reason?: string;
  notes?: string;
  customer_signature_url?: string;
  latitude_at_delivery?: number;
  longitude_at_delivery?: number;
  assigned_at: string;
  accepted_at?: string;
  picked_up_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  order?: Order;
  partner?: DeliveryPartner;
}

export interface StoreBranding {
  store_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  brand_colors: {
    charcoal: string;
    noir: string;
    offwhite: string;
    champagne: string;
    neutralgrey: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  social_links: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  gstin: string;
  cin: string;
  announcement_bar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  features: {
    loyalty_enabled: boolean;
    reviews_enabled: boolean;
    qa_enabled: boolean;
    comparisons_enabled: boolean;
  };
}
