import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Components/ui/table';
import { Check, X, UserCheck, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement({ users }: { users: any[] }) {
  const { auth } = usePage<any>().props;

  // Handle Approving users[cite: 22]
  const handleApprove = (id: number) => {
    router.post(`/admin/users/${id}/approve`, {}, {
      onSuccess: () => toast.success('User approved successfully!')
    });
  };

  // Handle Rejecting or Deleting users[cite: 22, 23]
  const handleReject = (id: number) => {
    if(confirm('Are you absolutely sure you want to delete this account? This action is permanent.')) {
      router.delete(`/admin/users/${id}`, {
        onSuccess: () => toast.error('Account deleted from database.')
      });
    }
  };

  // Handle updating roles[cite: 22]
  const handleRoleChange = (id: number, newRole: string) => {
    router.patch(`/admin/users/${id}/role`, { role: newRole }, {
      onSuccess: () => toast.success(`Role updated to ${newRole.replace('_', ' ')}`),
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

        {/* PENDING REGISTRATIONS[cite: 22] */}
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
                  <TableHead className="font-bold">Requested On</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.status === 'pending').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
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

        {/* ACTIVE USERS LIST - Includes Role Change and Delete[cite: 22, 23] */}
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
                    <TableCell>
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#7B1E1E] outline-none cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="commander">Commander</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Only allow deletion of OTHER users, not yourself to prevent lockout */}
                      {user.id !== auth.user.id ? (
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleReject(user.id)} 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          >
                            <Trash2 className="size-4 mr-1" /> Remove Account
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