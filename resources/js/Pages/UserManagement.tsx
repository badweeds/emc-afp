import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Components/ui/table';
import { Check, X, UserCheck, Shield, Trash2, Building } from 'lucide-react';
import { toast } from 'sonner';

const militaryUnits = [
  "Eastern Mindanao Command (EastMinCom) Headquarters",
  "Naval Forces Eastern Mindanao (NFEM)",
  "Tactical Operations Group 10 (TOG 10)",
  "4th Infantry Division (4ID)",
  "10th Infantry Division (10ID)"
];

export default function UserManagement({ users }: { users: any[] }) {
  const { auth } = usePage<any>().props;
  const isSuperAdmin = auth.user?.role === 'super_admin';

  const handleApprove = (id: number) => {
    router.post(`/admin/users/${id}/approve`, {}, {
      onSuccess: () => toast.success('User approved successfully!')
    });
  };

  const handleReject = (id: number) => {
    if(confirm('Are you absolutely sure you want to delete this account? This action is permanent.')) {
      router.delete(`/admin/users/${id}`, {
        onSuccess: () => toast.error('Account deleted from database.')
      });
    }
  };

  const handleRoleChange = (id: number, newRole: string) => {
    if (id === auth.user.id) {
        toast.error("You cannot change your own access level!");
        return;
    }

    router.patch(`/admin/users/${id}/role`, { role: newRole }, {
      onSuccess: () => toast.success(`Role updated to ${newRole.replace('_', ' ')}`),
      onError: (errors: any) => {
          if (errors.role) toast.error(errors.role);
      },
      preserveScroll: true
    });
  };

  // NEW: Handle updating military unit
  const handleUnitChange = (id: number, newUnit: string) => {
    if (id === auth.user.id) {
        toast.error("You cannot change your own unit from this panel.");
        return;
    }

    router.patch(`/admin/users/${id}/unit`, { unit: newUnit }, {
      onSuccess: () => toast.success('Military Unit updated successfully!'),
      onError: (errors: any) => {
          if (errors.error) toast.error(errors.error);
      },
      preserveScroll: true
    });
  };

  return (
    <AuthenticatedLayout >
      <Head title="User Management - EMC" />
      <div className="space-y-5 max-w-6xl mx-auto p-6 lg:p-0">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E293B]">Personnel Management</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage access levels and system security</p>
          </div>
        </div>

        {/* PENDING REGISTRATIONS */}
        <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#1E293B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1E293B]">
              <UserCheck className="size-5" /> Pending Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Name / Rank</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Military Unit</TableHead>
                  <TableHead className="font-bold">Requested On</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.status === 'pending').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-700">
                            <Building className="size-3" />
                            {user.unit || 'Not Assigned'}
                        </span>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleApprove(user.id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                          <Check className="size-4 mr-1" /> Approve
                        </Button>
                        <Button onClick={() => handleReject(user.id)} size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
                          <X className="size-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ACTIVE USERS LIST */}
        <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#7B1E1E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1E293B]">
              <Shield className="size-5 text-[#7B1E1E]" /> Approved Personnel (Access Control)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Personnel</TableHead>
                  <TableHead>Military Unit</TableHead>
                  <TableHead>Change Access Level</TableHead>
                  <TableHead className="text-right">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.status === 'approved').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</span>
                        </div>
                    </TableCell>
                    
                    {/* THE FIX: Military Unit Dropdown for Super Admins */}
                    <TableCell>
                      {isSuperAdmin && user.id !== auth.user.id ? (
                        <select 
                          value={user.unit || ''}
                          onChange={(e) => handleUnitChange(user.id, e.target.value)}
                          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-[#7B1E1E] outline-none cursor-pointer max-w-[200px]"
                        >
                          <option value="" disabled>Select Unit...</option>
                          {militaryUnits.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">
                            {user.unit || 'Not Assigned'}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === auth.user.id}
                        className={`text-xs font-bold uppercase tracking-wider border rounded-md px-3 py-1.5 outline-none transition-colors ${
                          user.id === auth.user.id 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70' 
                            : 'bg-slate-50 border-slate-200 cursor-pointer focus:ring-2 focus:ring-[#7B1E1E]'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="commander">Commander</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.id !== auth.user.id ? (
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleReject(user.id)} 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          >
                            <Trash2 className="size-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">Current Session</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}