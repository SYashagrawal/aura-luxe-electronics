import { createServerSupabaseClient } from '../supabase/server';
import { checkPermission } from './permissions';
import { StaffModule, StaffAction, RolePermission, Profile } from '../types/database';

export interface AuthContext {
  user: Profile | null;
  permissions: RolePermission[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  isDeliveryPartner: boolean;
}

export async function getServerAuthContext(): Promise<AuthContext> {
  const supabase = createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return {
      user: null,
      permissions: [],
      isAuthenticated: false,
      isSuperAdmin: false,
      isStaff: false,
      isDeliveryPartner: false,
    };
  }

  // Fetch full profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    return {
      user: null,
      permissions: [],
      isAuthenticated: false,
      isSuperAdmin: false,
      isStaff: false,
      isDeliveryPartner: false,
    };
  }

  let permissions: RolePermission[] = [];

  if (profile.role === 'staff') {
    // Fetch assigned staff profile and role permissions
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('role_id, is_active')
      .eq('user_id', profile.id)
      .single();

    if (staffProfile && staffProfile.is_active) {
      const { data: perms } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', staffProfile.role_id);
      
      permissions = perms || [];
    }
  }

  return {
    user: profile,
    permissions,
    isAuthenticated: true,
    isSuperAdmin: profile.role === 'super_admin',
    isStaff: profile.role === 'staff',
    isDeliveryPartner: profile.role === 'delivery_partner',
  };
}

export async function requirePermission(module: StaffModule, action: StaffAction): Promise<AuthContext> {
  const context = await getServerAuthContext();

  if (!context.isAuthenticated || !context.user) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }

  const allowed = checkPermission(context.user.role, context.permissions, module, action);
  if (!allowed) {
    throw new Error(`FORBIDDEN: You do not possess [${action.toUpperCase()}] privilege on [${module.toUpperCase()}].`);
  }

  return context;
}
