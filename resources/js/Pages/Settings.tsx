import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Badge } from '../Components/ui/badge';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Activity, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings({ activeUsers = [] }: { activeUsers?: any[] }) {
  const { auth } = usePage<any>().props;
  const isAdmin = auth.user.role === 'admin';

  // --- Helper Function: Calculate relative time ---
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const otherActiveUsers = activeUsers.filter(u => u.id !== auth.user.id);

  // --- 1. Profile Update Form ---
  const { 
    data: profileData, 
    setData: setProfileData, 
    patch: patchProfile, 
    processing: profileProcessing,
    errors: profileErrors 
  } = useForm({
    name: auth.user.name,
    email: auth.user.email,
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Pointing to the new route name we created in web.php
    patchProfile(route('settings.profile.update'), {
      onSuccess: () => toast.success('Profile updated successfully!'),
      preserveScroll: true,
    });
  };

  // --- 2. Password Change Form ---
  const { 
    data: passData, 
    setData: setPassData, 
    put: putPassword, 
    processing: passProcessing, 
    errors: passErrors, 
    reset: resetPass 
  } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    putPassword(route('password.update'), {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        resetPass();
      },
      onError: () => toast.error('Failed to update password. Please check the fields.'),
      preserveScroll: true,
    });
  };

  // --- 3. Delete Account Form (NON-ADMINS ONLY) ---
  const {
    data: deleteData,
    setData: setDeleteData,
    delete: deleteUser,
    processing: deleteProcessing,
    errors: deleteErrors,
  } = useForm({
    password: '',
  });

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
        // Pointing to the new route name we created in web.php
        deleteUser(route('settings.account.destroy'), {
            onSuccess: () => toast.success('Account deleted.'),
            preserveScroll: true,
        });
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Settings - EMC" />

      <div className="space-y-6 max-w-5xl mx-auto p-6 lg:p-2">
        
        {/* Header - Minimalist Style */}
        <div className="flex flex-col gap-1 mb-2">
            <h1 className="text-3xl font-extrabold text-[#1E293B]">Account & Security</h1>
            <p className="text-slate-500 font-medium">Manage your credentials and monitor system activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Profile & Password */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Card */}
            <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#1E293B]">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-[#1E293B]">
                  <User className="size-5 text-[#7B1E1E]" /> Profile Information
                </CardTitle>
                <CardDescription>Update your account's profile name and email address.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name / Rank</Label>
                    <Input 
                        id="name" 
                        value={profileData.name} 
                        onChange={e => setProfileData('name', e.target.value)}
                        className="bg-slate-50 focus:ring-[#7B1E1E]"
                    />
                    {profileErrors.name && <p className="text-red-500 text-xs font-bold">{profileErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email} 
                        onChange={e => setProfileData('email', e.target.value)}
                        className="bg-slate-50 focus:ring-[#7B1E1E]"
                    />
                    {profileErrors.email && <p className="text-red-500 text-xs font-bold">{profileErrors.email}</p>}
                  </div>
                  <Button disabled={profileProcessing} className="bg-[#1E293B] hover:bg-[#0f172a]">
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Security Card */}
            <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#7B1E1E]">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-[#1E293B]">
                  <Lock className="size-5 text-[#7B1E1E]" /> Security Credentials
                </CardTitle>
                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input 
                        id="current_password" 
                        type="password" 
                        value={passData.current_password}
                        onChange={e => setPassData('current_password', e.target.value)}
                        className="bg-slate-50"
                    />
                    {passErrors.current_password && <p className="text-red-500 text-xs font-bold">{passErrors.current_password}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={passData.password}
                            onChange={e => setPassData('password', e.target.value)}
                            className="bg-slate-50"
                        />
                        {passErrors.password && <p className="text-red-500 text-xs font-bold">{passErrors.password}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input 
                            id="password_confirmation" 
                            type="password" 
                            value={passData.password_confirmation}
                            onChange={e => setPassData('password_confirmation', e.target.value)}
                            className="bg-slate-50"
                        />
                    </div>
                  </div>
                  <Button disabled={passProcessing} className="bg-[#7B1E1E] hover:bg-[#8B2E2E]">
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Delete Account Card (Hidden from Admins) */}
            {!isAdmin && (
                <Card className="shadow-md bg-red-50 border border-red-200 border-t-4 border-t-red-600">
                <CardHeader className="border-b border-red-200/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="size-5" /> Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600/80">Once your account is deleted, all of its resources and data will be permanently deleted.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="delete_password" className="text-red-700">Confirm Password to Delete</Label>
                        <Input 
                            id="delete_password" 
                            type="password" 
                            placeholder="Enter your password"
                            value={deleteData.password}
                            onChange={e => setDeleteData('password', e.target.value)}
                            className="bg-white border-red-200 focus:ring-red-500"
                        />
                        {deleteErrors.password && <p className="text-red-600 text-xs font-bold">{deleteErrors.password}</p>}
                    </div>
                    <Button variant="destructive" disabled={deleteProcessing} className="bg-red-600 hover:bg-red-700">
                        Delete Account
                    </Button>
                    </form>
                </CardContent>
                </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Real-Time Login Monitoring (ADMIN ONLY) */}
          <div className="space-y-6">
            <Card className="shadow-md bg-white border border-slate-200">
              <CardHeader className="bg-[#1E293B] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                  <Activity className="size-4 text-yellow-500" /> Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  
                  {/* Current User always shows as active */}
                  <div className="p-4 flex items-center justify-between bg-green-50/30">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="size-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 uppercase">
                          {auth.user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{auth.user.name} (You)</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{auth.user.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-white border-green-200 text-green-700">Online</Badge>
                  </div>

                  {/* ADMIN VIEW: Map over REAL database users */}
                  {isAdmin ? (
                    <div className="max-h-[400px] overflow-y-auto">
                        <div className="px-4 py-2 bg-slate-50 flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recently Active Personnel</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{otherActiveUsers.length} Found</p>
                        </div>
                        
                        <div className="p-4 flex flex-col gap-4">
                            {otherActiveUsers.length > 0 ? (
                                otherActiveUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 leading-none mb-0.5">{user.name}</p>
                                                <p className="text-[10px] text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {timeAgo(user.updated_at)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">No other active personnel found.</p>
                            )}
                        </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50">
                        <ShieldCheck className="size-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-xs text-slate-500 font-medium">Session monitoring is restricted to Admin personnel only.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-lg">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Clock className="size-3" /> System Time: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </Card>

            {/* Quick Status Stats for Admins */}
            {isAdmin && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-md text-blue-700"><ShieldCheck className="size-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Protocol</p>
                            <p className="text-sm font-bold text-slate-800">RBAC Enabled & Active</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}