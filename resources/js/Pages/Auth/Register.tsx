import { useEffect, FormEventHandler } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Request Access - EMC" />

            <div className="text-left mb-8">
                <h2 className="text-3xl font-extrabold text-[#1E293B] flex items-center gap-2">
                    <ShieldCheck className="size-8 text-[#7B1E1E]" /> Request Access
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                    Create your account. All new registrations require <span className="text-[#7B1E1E] font-bold underline">Admin approval</span> before access is granted.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* Full Name / Rank */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Name / Rank</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <User className="size-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="pl-11 block w-full rounded-xl border-slate-300 bg-slate-50 border-2 focus:border-[#7B1E1E] focus:ring-[#7B1E1E] sm:text-sm p-3.5 font-medium text-slate-900"
                            placeholder="e.g. CPT JUAN DELA CRUZ"
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="size-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="pl-11 block w-full rounded-xl border-slate-300 bg-slate-50 border-2 focus:border-[#7B1E1E] focus:ring-[#7B1E1E] sm:text-sm p-3.5 font-medium text-slate-900"
                            placeholder="personnel@eastmincom.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="size-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="pl-11 block w-full rounded-xl border-slate-300 bg-slate-50 border-2 focus:border-[#7B1E1E] focus:ring-[#7B1E1E] sm:text-sm p-3.5 font-medium text-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="size-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="pl-11 block w-full rounded-xl border-slate-300 bg-slate-50 border-2 focus:border-[#7B1E1E] focus:ring-[#7B1E1E] sm:text-sm p-3.5 font-medium text-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-extrabold text-white bg-[#1E293B] hover:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E293B] transition-all disabled:opacity-50 uppercase tracking-widest"
                    >
                        Submit Access Request
                    </button>
                </div>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <Link
                        href={route('login')}
                        className="text-sm font-bold text-[#7B1E1E] hover:text-[#7B1E1E]/80 transition-colors underline decoration-2 underline-offset-4"
                    >
                        Already registered? Log in here
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}