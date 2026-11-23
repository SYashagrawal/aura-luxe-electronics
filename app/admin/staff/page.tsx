import { createAdminClient } from '@/lib/supabase/admin';
import { ALL_STAFF_MODULES, ALL_STAFF_ACTIONS } from '@/lib/rbac/permissions';
import { StaffRole, StaffProfile } from '@/lib/types/database';
import { ShieldCheck, UserCheck, Key, Lock, Plus } from 'lucide-react';

export default async function AdminStaffPage() {
  const supabase = createAdminClient();

  const [{ data: rolesData }, { data: staffData }] = await Promise.all([
    supabase.from('staff_roles').select('*, permissions:role_permissions(*)'),
    supabase.from('staff_profiles').select('*, user:profiles(*), role:staff_roles(*)'),
  ]);

  const roles = (rolesData || []) as (StaffRole & { permissions: any[] })[];
  const staffMembers = (staffData || []) as StaffProfile[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Enterprise Security Governance
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Staff Accounts & Granular RBAC Permissions
          </h1>
        </div>

        <div className="flex items-center space-x-2 text-xs text-neutralgrey">
          <Lock className="w-4 h-4 text-champagne" />
          <span>PostgreSQL Row Level Security (RLS) Active</span>
        </div>
      </div>

      {/* Staff Accounts List */}
      <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-offwhite flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-champagne" />
            <span>Active Staff Operatives ({staffMembers.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-noir text-neutralgrey uppercase tracking-refined text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Employee / Operative</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-center text-neutralgrey">
                    No dedicated staff profiles yet. Create a staff account below.
                  </td>
                </tr>
              ) : (
                staffMembers.map((staff) => (
                  <tr key={staff.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-offwhite">{staff.user?.full_name}</div>
                      <div className="text-[10px] text-neutralgrey">{staff.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutralgrey">{staff.department}</td>
                    <td className="py-3.5 px-4 font-semibold text-champagne">{staff.role?.name}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] uppercase font-semibold ${
                        staff.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        {staff.is_active ? 'Authorized' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-neutralgrey">
                      Granular Matrix Enforced
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Granular RBAC Permissions Matrix Overview */}
      <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne flex items-center gap-2 border-b border-white/5 pb-3">
          <Key className="w-4 h-4" />
          <span>Statutory Permissions Matrix (15 Business Modules &times; 7 Granular Rights)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-white/5">
            <thead className="bg-noir text-neutralgrey uppercase text-[9px] tracking-refined">
              <tr>
                <th className="p-3 border-r border-white/5">Module Key</th>
                <th className="p-3 border-r border-white/5">Description</th>
                <th className="p-3 text-center border-r border-white/5">View</th>
                <th className="p-3 text-center border-r border-white/5">Create</th>
                <th className="p-3 text-center border-r border-white/5">Edit</th>
                <th className="p-3 text-center border-r border-white/5">Delete</th>
                <th className="p-3 text-center border-r border-white/5">Approve</th>
                <th className="p-3 text-center border-r border-white/5">Export</th>
                <th className="p-3 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ALL_STAFF_MODULES.map((mod) => (
                <tr key={mod.key} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-mono font-bold text-offwhite border-r border-white/5">{mod.key}</td>
                  <td className="p-3 text-neutralgrey text-[11px] border-r border-white/5">{mod.description}</td>
                  <td className="p-3 text-center font-bold text-emerald-400 border-r border-white/5">&check;</td>
                  <td className="p-3 text-center font-bold text-champagne border-r border-white/5">&bull;</td>
                  <td className="p-3 text-center font-bold text-champagne border-r border-white/5">&bull;</td>
                  <td className="p-3 text-center font-bold text-red-400 border-r border-white/5">&bull;</td>
                  <td className="p-3 text-center font-bold text-amber-400 border-r border-white/5">&check;</td>
                  <td className="p-3 text-center font-bold text-offwhite border-r border-white/5">&bull;</td>
                  <td className="p-3 text-center font-bold text-champagne">&check;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
