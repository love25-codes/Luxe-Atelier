import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
    const { cart, error, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
    const [updatingId, setUpdatingId] = useState(null);

    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    const handleQuantityChange = async (productId, currentQty, delta, maxStock) => {
        const nextQty = currentQty + delta;
        if (nextQty < 1) return;
        if (maxStock !== undefined && maxStock !== null && nextQty > maxStock) {
            alert(`Only ${maxStock} units available in stock.`);
            return;
        }

        try {
            setUpdatingId(productId);
            await updateQuantity(productId, nextQty);
        } catch (err) {
            console.error("Failed to update quantity", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            setUpdatingId(productId);
            await removeFromCart(productId);
        } catch (err) {
            console.error("Failed to remove item", err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#060B19] text-slate-100 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#D4AF37]/20">
                    <div>
                        <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                            Curated Bag
                        </p>
                        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-gold-shimmer">
                            Shopping Cart
                        </h1>
                    </div>
                    <div className="text-sm text-slate-400">
                        {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                    </div>
                </div>

                {/* ERROR ALERT */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                        {error}
                    </div>
                )}

                {/* EMPTY STATE */}
                {cart.length === 0 ? (
                    <div className="min-h-[450px] flex flex-col items-center justify-center text-center border border-[#D4AF37]/15 rounded-2xl bg-gradient-to-b from-[#0F1E3D]/40 to-[#0A1226]/60 p-8">
                        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-3xl text-[#D4AF37]">
                            🛍️
                        </div>
                        <h2 className="font-serif-luxury text-2xl font-semibold text-slate-100 mb-2">
                            Your shopping cart is empty
                        </h2>
                        <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed font-light">
                            Explore our hand-selected catalog of fine electronics and luxury items to add products to your bag.
                        </p>
                        <Link
                            to="/"
                            className="px-8 py-3.5 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider shadow-lg"
                        >
                            Explore Collections
                        </Link>
                    </div>
                ) : (
                    /* CART CONTENT GRID */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT: CART ITEMS LIST */}
                        <div className="lg:col-span-8 space-y-4">
                            {cart.map((item) => {
                                const prod = item.product;
                                if (!prod) return null;
                                const isItemUpdating = updatingId === prod._id;

                                return (
                                    <div
                                        key={prod._id || item._id}
                                        className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-gradient-to-b from-[#0F1C3B]/90 to-[#0A1228]/95 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all shadow-md"
                                    >
                                        {/* Product Image */}
                                        <div className="w-full sm:w-28 sm:h-28 aspect-square rounded-xl bg-[#070D1F] overflow-hidden border border-[#D4AF37]/20 shrink-0 relative">
                                            <img
                                                src={prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"}
                                                alt={prod.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#D4AF37]/80">
                                                        {prod.category || 'Luxury'}
                                                    </span>
                                                    <h3 className="font-heading text-lg font-bold text-slate-100 line-clamp-1 mt-0.5">
                                                        {prod.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Unit Price: <span className="text-[#F3E5AB] font-semibold">{formatPrice(prod.price)}</span>
                                                    </p>
                                                </div>

                                                {/* Line Total */}
                                                <div className="text-left sm:text-right">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Total</span>
                                                    <span className="text-lg font-bold text-gold-gradient font-sans">
                                                        {formatPrice(prod.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quantity and Actions Controls */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/5">
                                                {/* Quantity Pill and Live Stock Counter */}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400 font-medium">Qty:</span>
                                                    <div className="flex items-center border border-[#D4AF37]/40 rounded-lg bg-[#081024]">
                                                        <button
                                                            type="button"
                                                            disabled={isItemUpdating || item.quantity <= 1}
                                                            onClick={() => handleQuantityChange(prod._id, item.quantity, -1, prod.stock)}
                                                            className="px-3 py-1 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Decrease quantity"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-3 py-1 text-xs font-bold text-slate-100 min-w-8 text-center">
                                                            {isItemUpdating ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={isItemUpdating || (prod.stock !== undefined && prod.stock !== null && item.quantity >= prod.stock)}
                                                            onClick={() => handleQuantityChange(prod._id, item.quantity, 1, prod.stock)}
                                                            className="px-3 py-1 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title={prod.stock !== undefined && item.quantity >= prod.stock ? "Max stock reached" : "Increase quantity"}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Dynamic Stock Left on UI */}
                                                    {prod.stock !== undefined && prod.stock !== null && (() => {
                                                        const stockLeft = Math.max(0, prod.stock - item.quantity);
                                                        const isMaxReached = item.quantity >= prod.stock;

                                                        if (isMaxReached) {
                                                            return (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                                                                    Max stock reached (0 left)
                                                                </span>
                                                            );
                                                        }
                                                        if (stockLeft <= 3) {
                                                            return (
                                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-300">
                                                                    Only {stockLeft} left in stock!
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <span className="text-[11px] text-slate-400 font-medium">
                                                                ({stockLeft} units left in stock)
                                                            </span>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    disabled={isItemUpdating}
                                                    onClick={() => handleRemoveItem(prod._id)}
                                                    className="text-xs font-medium text-rose-300 hover:text-rose-200 hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-4 flex justify-between items-center">
                                <Link
                                    to="/"
                                    className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-2"
                                >
                                    <span>←</span> Continue Browsing Products
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT: ORDER SUMMARY CARD */}
                        <div className="lg:col-span-4">
                            <div className="bg-gradient-to-b from-[#0F1E3D] to-[#0A1226] border border-[#D4AF37]/35 rounded-2xl p-6 shadow-xl sticky top-28">
                                <h2 className="font-serif-luxury text-xl font-bold text-gold-shimmer pb-4 border-b border-white/10 mb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 text-xs text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Subtotal ({cartCount} items)</span>
                                        <span className="font-semibold text-slate-100">{formatPrice(cartTotal)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Luxury Express Dispatch</span>
                                        <span className="text-emerald-400 font-semibold uppercase tracking-wider">Free</span>
                                    </div>

                                    <div className="flex justify-between text-slate-400">
                                        <span>Estimated Taxes (GST)</span>
                                        <span>Included</span>
                                    </div>
                                </div>

                                {/* TOTAL */}
                                <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 flex items-baseline justify-between">
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-slate-400 block">
                                            Estimated Total
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Taxes & shipping included
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-gold-gradient font-sans">
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>

                                {/* CHECKOUT BUTTON */}
                                <button
                                    type="button"
                                    onClick={() => navigate('/checkout')}
                                    disabled={cart.length === 0}
                                    className="w-full mt-6 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider btn-gold shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <span>Proceed to Checkout</span>
                                    <span>→</span>
                                </button>

                                {/* GUARANTEES */}
                                <div className="mt-6 pt-5 border-t border-white/5 space-y-2 text-[11px] text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#D4AF37]">✦</span> 100% Guaranteed Authenticity
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#D4AF37]">✦</span> End-to-End Insured Delivery
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#D4AF37]">✦</span> 256-Bit Encrypted Secure Checkout
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default Cart;
