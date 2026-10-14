import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#060B19]/90 border-b border-[#D4AF37]/25 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Brand / Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#8C6D1F] p-[1px] shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_22px_rgba(212,175,55,0.6)] transition-all">
                        <div className="w-full h-full bg-[#070D1F] rounded-[11px] flex items-center justify-center">
                            <span className="font-serif-luxury font-black text-lg text-gold-gradient">
                                SK
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className="font-serif-luxury font-bold text-xl sm:text-2xl tracking-[0.2em] text-gold-shimmer block">
                            SHOPKART
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-semibold block -mt-1">
                            Luxe Atelier
                        </span>
                    </div>
                </Link>

                {/* Right Actions & Auth */}
                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2 sm:gap-4">

                            {/* Orders Link */}
                            <Link
                                to="/orders"
                                className="relative px-3 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#F3E5AB] hover:text-white hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all flex items-center gap-1.5"
                                title="My Orders"
                            >
                                <span className="text-sm leading-none text-[#D4AF37]">
                                    📦
                                </span>
                                <span className="hidden sm:inline">
                                    Orders
                                </span>
                            </Link>

                            {/* Wishlist Link */}
                            <Link
                                to="/wishlist"
                                className="relative px-3 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#F3E5AB] hover:text-white hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all flex items-center gap-1.5"
                                title="My Wishlist"
                            >
                                <span className="text-base leading-none text-[#D4AF37]">
                                    ♡
                                </span>

                                <span className="hidden sm:inline">
                                    Wishlist
                                </span>
                            </Link>

                            {/* Cart Link with Live Counter Badge */}
                            <Link
                                to="/cart"
                                className="relative px-3 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#F3E5AB] hover:text-white hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all flex items-center gap-2"
                                title="My Cart"
                            >
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-[#DFB15B] to-[#D4AF37] text-[#060B19] shadow-sm leading-none min-w-[15px] text-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>

                                <span className="hidden sm:inline">
                                    Cart
                                </span>
                            </Link>
                            
                            {/* User Profile Pill */}
                            <div className="hidden sm:flex items-center gap-3 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-white/[0.03] to-white/[0.06] border border-[#D4AF37]/30 shadow-inner">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#DFB15B] to-[#996515] flex items-center justify-center text-[#060B19] font-black text-xs font-serif-luxury shadow-sm">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-slate-100 leading-tight">
                                        {user.fullName}
                                    </p>
                                    <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="px-3.5 py-2 rounded-xl text-xs font-medium tracking-wider uppercase text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-400/50 transition-all cursor-pointer flex items-center gap-1.5"
                                title="Sign Out"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-200 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase btn-gold"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Navbar;