import { StaffModule, StaffAction, RolePermission } from '../types/database';

export const ALL_STAFF_MODULES: { key: StaffModule; label: string; description: string }[] = [
  { key: 'products', label: 'Products & Catalogue', description: 'Product listings, specifications, variants, media, and pricing' },
  { key: 'pricing', label: 'Discounts & Coupons', description: 'Promotional rules, coupons, scheduled campaigns, and cart rules' },
  { key: 'orders', label: 'Orders & Invoices', description: 'Customer orders, fulfillment, dispatch, cancellation, and invoices' },
  { key: 'customers', label: 'Customer CRM', description: 'Customer profiles, history, support communication, and lifetime value' },
  { key: 'inventory', label: 'Stock & Inventory', description: 'Quantity on hand, reservations, stock adjustments, and low-stock alerts' },
  { key: 'warehouses', label: 'Warehouses & Retail Shops', description: 'Warehouse management, physical retail shop stock, and inter-store transfers' },
  { key: 'purchases', label: 'Purchase Orders & GRN', description: 'Supplier procurement, purchase orders, and goods receipt notes' },
  { key: 'suppliers', label: 'Vendors & Suppliers', description: 'Supplier directories, contracts, and payment records' },
  { key: 'finance', label: 'GST & Financial Reports', description: 'Tax reports, GSTR-1, GSTR-3B summaries, and credit notes' },
  { key: 'returns', label: 'Returns & Refunds', description: 'RMA processing, quality inspection, refund approvals, and restock' },
  { key: 'delivery', label: 'Delivery & Fleet', description: 'Driver assignment, live tracking, serviceability pincodes, and proof of delivery' },
  { key: 'reports', label: 'Analytics & Reports', description: 'Sales charts, revenue breakdown, executive performance metrics' },
  { key: 'exports', label: 'Data Export (CSV/Excel)', description: 'Sensitive business data export to spreadsheets' },
  { key: 'cms', label: 'Website CMS & Customization', description: 'Store branding, homepage banners, layout reordering, and legal pages' },
  { key: 'staff', label: 'Staff & Role Management', description: 'Creating staff accounts, assigning roles, and customizing permissions' },
];

export const ALL_STAFF_ACTIONS: { key: StaffAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' },
  { key: 'manage', label: 'Manage All' },
];

/**
 * Validates whether a user's permissions grant the requested action on a module
 */
export function checkPermission(
  userRole: string,
  userPermissions: RolePermission[] | undefined,
  module: StaffModule,
  action: StaffAction
): boolean {
  if (userRole === 'super_admin') {
    return true; // Super admin has universal bypass
  }

  if (userRole !== 'staff' || !userPermissions) {
    return false;
  }

  const perm = userPermissions.find(p => p.module === module);
  if (!perm) return false;

  if (perm.can_manage) return true;

  switch (action) {
    case 'view': return perm.can_view;
    case 'create': return perm.can_create;
    case 'edit': return perm.can_edit;
    case 'delete': return perm.can_delete;
    case 'approve': return perm.can_approve;
    case 'export': return perm.can_export;
    case 'manage': return perm.can_manage;
    default: return false;
  }
}
