import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            await login(form);
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#060B19] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Ambient Classy Gold & Midnight Blue Glows */}
            <div className="absolute -top-32 left-1/3 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#1A365D]/30 rounded-full blur-[140px] pointer-events-none" />

            {/* Subtle decorative grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#d4af3708_1px,transparent_1px),linear-gradient(to_bottom,#d4af3708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Main Glass Card */}
            <div className="w-full max-w-md bg-gradient-to-b from-[#0F1E3D]/80 to-[#0A1226]/95 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.18)] z-10 relative">

                {/* Top Metallic Gold Accent Trim */}
                <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB] text-[10px] uppercase font-bold tracking-[0.25em] mb-3">
                        ✦ Exclusive Access
                    </div>
                    <h1 className="font-serif-luxury text-3xl font-bold text-gold-shimmer mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-xs text-slate-300 font-light">
                        Sign in to explore your personalized shopping collection.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[#F3E5AB]/90 tracking-wide flex justify-between">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="name@domain.com"
                                required
                                className="w-full px-4 py-3 bg-[#060B19]/80 border border-[#D4AF37]/25 rounded-xl text-slate-100 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[#F3E5AB]/90 tracking-wide">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-[#060B19]/80 border border-[#D4AF37]/25 rounded-xl text-slate-100 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3.5 px-4 rounded-xl text-xs uppercase font-bold tracking-widest btn-gold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-[#060B19] border-t-transparent rounded-full animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400">
                        New to ShopKart Luxe?{' '}
                        <Link
                            to="/register"
                            className="text-[#D4AF37] hover:text-[#FFF4CC] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                        >
                            Create an Account
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;