import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductModal({ product, onClose }) {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [toastMessage, setToastMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    if (!product) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    const handleAddToCart = async () => {
        try {
            setActionLoading(true);
            await addToCart(product._id, quantity);
            setToastMessage(`✓ Added ${quantity} × ${product.name} to your cart!`);
            setTimeout(() => setToastMessage(''), 3500);
        } catch (err) {
            setToastMessage(err.message || 'Failed to add to cart');
            setTimeout(() => setToastMessage(''), 3500);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBuyNow = async () => {
        try {
            setActionLoading(true);
            await addToCart(product._id, quantity);
            if (onClose) onClose();
            navigate('/cart');
        } catch (err) {
            setToastMessage(err.message || 'Failed to process item');
            setTimeout(() => setToastMessage(''), 3500);
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#0F1E3D] to-[#081024] border border-[#D4AF37]/50 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.25)] overflow-hidden z-10 transition-all my-8">
                
                {/* Header Gold Line */}
                <div className="h-1 bg-gradient-to-r from-[#DFB15B] via-[#F3E5AB] to-[#B8860B]" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#070D1C]/80 border border-[#D4AF37]/30 text-slate-300 hover:text-white hover:border-[#D4AF37] flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Close dialog"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
                    
                    {/* Image Column */}
                    <div className="flex flex-col gap-3">
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#060B19] border border-[#D4AF37]/30 flex items-center justify-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
                                }}
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#060B19]/90 text-[#F3E5AB] border border-[#D4AF37]/50 backdrop-blur-md">
                                    {product.category}
                                </span>
                            </div>
                        </div>

                        {/* Badges / Guarantees */}
                        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-slate-400">
                            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center gap-1.5">
                                <span className="text-[#D4AF37]">✦</span> 100% Authentic
                            </div>
                            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center gap-1.5">
                                <span className="text-[#D4AF37]">✦</span> Insured Delivery
                            </div>
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="flex flex-col justify-between">
                        <div>
                            {/* Category Subtitle */}
                            <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
                                ShopKart Collection • {product.category}
                            </span>

                            {/* Product Name */}
                            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-100 mt-1 mb-3">
                                {product.name}
                            </h2>

                            {/* Price and Stock status row */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-[#D4AF37]/20 mb-4">
                                <div>
                                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block">
                                        Price
                                    </span>
                                    <span className="text-2xl font-bold text-gold-gradient font-sans">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div>
                                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block">
                                        Stock Status
                                    </span>
                                    <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                                        {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-5">
                                <h4 className="text-xs uppercase font-semibold text-slate-300 tracking-wider mb-1.5">
                                    Description
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-light">
                                    {product.description}
                                </p>
                            </div>

                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="flex items-center gap-3 mb-6">
                                    <label className="text-xs text-slate-400 font-medium">Quantity:</label>
                                    <div className="flex items-center border border-[#D4AF37]/40 rounded-lg bg-[#081024]">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 text-sm font-bold text-slate-100 min-w-8 text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                            className="px-3 py-1 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        Total: <span className="text-[#F3E5AB] font-semibold">{formatPrice(product.price * quantity)}</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="space-y-2.5">
                            {toastMessage && (
                                <div className="p-2.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] text-[#FFF4CC] text-xs font-medium text-center animate-pulse">
                                    ✓ {toastMessage}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    disabled={product.stock === 0 || actionLoading}
                                    onClick={handleAddToCart}
                                    className="py-3 px-4 rounded-xl text-xs uppercase font-bold tracking-wider btn-gold-outline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {actionLoading ? 'Updating...' : 'Add to Cart'}
                                </button>
                                <button
                                    type="button"
                                    disabled={product.stock === 0 || actionLoading}
                                    onClick={handleBuyNow}
                                    className="py-3 px-4 rounded-xl text-xs uppercase font-bold tracking-wider btn-gold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProductModal;
