import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout'; // Using the centralized layout
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Secure Login - EMC" />

            <div className="text-left mb-8">
                <h2 className="text-3xl font-extrabold text-[#1E293B]">Secure Login</h2>
                <p className="text-slate-500 mt-2 font-medium">Please authenticate to access the system</p>
            </div>

            {/* Display "Pending Approval" or "Success" status messages from the backend */}
            {status && (
                <div className="mb-6 font-medium text-sm text-green-600 bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="size-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="pl-11 block w-full rounded-xl border-slate-300 bg-slate-50 border-2 focus:border-[#7B1E1E] focus:ring-[#7B1E1E] sm:text-sm p-3.5 transition-colors font-medium text-slate-900"
                            placeholder="personnel@eastmincom.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2 text-red-600 font-medium" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="size-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="pl-11 block w-full rounded-xl border-slate-300 bg-slate-50 border-2 focus:border-[#7B1E1E] focus:ring-[#7B1E1E] sm:text-sm p-3.5 transition-colors font-medium text-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2 text-red-600 font-medium" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox 
                            name="remember" 
                            checked={data.remember} 
                            onChange={(e) => setData('remember', e.target.checked)} 
                            className="text-[#7B1E1E] focus:ring-[#7B1E1E] rounded shadow-sm border-slate-300 size-4" 
                        />
                        <span className="ml-2 text-sm text-slate-600 font-medium select-none">Remember me</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-extrabold text-white bg-[#1E293B] hover:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E293B] transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                    Log In to Dashboard
                </button>

                {/* THE MISSING PIECE: Link to the Registration page */}
                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <Link
                        href={route('register')}
                        className="text-sm font-bold text-[#7B1E1E] hover:text-[#7B1E1E]/80 transition-colors underline decoration-2 underline-offset-4"
                    >
                        Need access? Request an account here
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}