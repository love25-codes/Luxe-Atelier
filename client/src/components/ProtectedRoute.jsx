import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060B19] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[130px] pointer-events-none" />
                <div className="relative flex flex-col items-center gap-4 z-10">
                    <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                    <div className="text-center">
                        <span className="font-serif-luxury text-xl tracking-[0.25em] text-gold-shimmer font-bold block">
                            SHOPKART
                        </span>
                        <p className="text-xs text-slate-400 tracking-wider mt-1 uppercase">
                            Authenticating Access...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060B19] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};
