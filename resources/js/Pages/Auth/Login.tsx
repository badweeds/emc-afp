import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout'; 
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
            </form>

            {/* --- NEW GOOGLE LOGIN SECTION --- */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-slate-500 font-bold uppercase tracking-wider text-xs">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <a
                        href={route('auth.google')}
                        className="w-full flex justify-center items-center py-3.5 px-4 border-2 border-slate-200 rounded-xl shadow-sm bg-white text-sm font-extrabold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all uppercase tracking-wide"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Sign in with Google
                    </a>
                </div>
            </div>

            {/* THE MISSING PIECE: Link to the Registration page */}
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <Link
                    href={route('register')}
                    className="text-sm font-bold text-[#7B1E1E] hover:text-[#7B1E1E]/80 transition-colors underline decoration-2 underline-offset-4"
                >
                    Need access? Request an account here
                </Link>
            </div>
        </GuestLayout>
    );
}