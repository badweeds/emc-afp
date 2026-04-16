import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Components/ui/table';
import { Check, X, UserCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement({ users }: { users: any[] }) {
  const handleApprove = (id: number) => {
    router.post(`/admin/users/${id}/approve`, {}, {
      onSuccess: () => toast.success('User approved successfully!')
    });
  };

  const handleReject = (id: number) => {
    if(confirm('Are you sure you want to delete this registration request?')) {
      router.delete(`/admin/users/${id}`, {
        onSuccess: () => toast.error('Request rejected/deleted.')
      });
    }
  };

  return (
    <AuthenticatedLayout >
      <div className="space-y-5 max-w-6xl mx-auto p-6 lg:p-0">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E293B]">Personnel Requests</h1>
            <p className="text-slate-500 mt-1 font-medium">Approve or manage unit access to the dashboard</p>
          </div>
        </div>

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
                  <TableHead className="font-bold">Status</TableHead>
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
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold uppercase tracking-wider">Pending</span>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button onClick={() => handleApprove(user.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="size-4 mr-1" /> Approve
                      </Button>
                      <Button onClick={() => handleReject(user.id)} size="sm" variant="destructive">
                        <X className="size-4 mr-1" /> Reject
                      </Button>
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
            <CardTitle className="text-[#1E293B]">Approved Personnel (Active Database)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Personnel</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.status === 'approved').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-slate-500">
                      {user.updated_at ? "Recently Active" : "Never logged in"}
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