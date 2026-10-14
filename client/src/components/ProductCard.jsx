import React, { useState } from 'react';
import { axiosInstance } from '../axiosCalls/axios';
import { useCart } from '../context/CartContext';

function ProductCard({ product, onViewDetails }) {
    const { addToCart, getProductQuantity } = useCart();
    const [imgSrc, setImgSrc] = useState(product?.image);
    const [imageLoaded, setImageLoaded] = useState(false);

    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistError, setWishlistError] = useState('');

    const [cartLoading, setCartLoading] = useState(false);
    const [cartMessage, setCartMessage] = useState('');

    const inCartQuantity = getProductQuantity(product?._id);

    const fallbackImage =
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

    const formatPrice = (price) => {
        if (price === undefined || price === null) return "₹0";

        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getStockDisplay = (stock) => {
        if (stock === undefined || stock === null) {
            return {
                text: "In Stock",
                color: "text-amber-300 bg-amber-500/10 border-amber-500/30"
            };
        }

        if (stock === 0) {
            return {
                text: "Out of Stock",
                color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
                isOutOfStock: true
            };
        }

        if (stock <= 5) {
            return {
                text: `Only ${stock} left!`,
                color: "text-amber-300 bg-amber-500/15 border-amber-400/40"
            };
        }

        return {
            text: `${stock} in stock`,
            color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
        };
    };

    const handleAddToWishlist = async () => {
        if (wishlistLoading || isWishlisted) return;

        try {
            setWishlistLoading(true);
            setWishlistError('');

            const response = await axiosInstance.post(
                `/wishlist/${product._id}`
            );

            if (response.data?.success) {
                setIsWishlisted(true);
            }
        } catch (error) {
            console.error("Wishlist error:", error);
            const message =
                error?.response?.data?.message ||
                "Unable to add product to wishlist.";
            setWishlistError(message);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async (e) => {
        if (e) e.stopPropagation();
        if (cartLoading || product.stock === 0) return;

        try {
            setCartLoading(true);
            setCartMessage('');
            await addToCart(product._id);
            setCartMessage('✓ Added to cart');
            setTimeout(() => setCartMessage(''), 2500);
        } catch (error) {
            console.error("Add to cart error:", error);
            setCartMessage(error.message || "Failed to add to cart");
            setTimeout(() => setCartMessage(''), 3000);
        } finally {
            setCartLoading(false);
        }
    };

    const stockInfo = getStockDisplay(product.stock);

    return (
        <div className="group relative flex flex-col bg-gradient-to-b from-[#0F1C3B]/90 to-[#0A1228]/95 border border-[#D4AF37]/25 hover:border-[#D4AF37]/65 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(212,175,55,0.3)] transition-all duration-300">

            {/* Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* PRODUCT IMAGE */}
            <div className="relative w-full aspect-[4/3] bg-[#070D1F] overflow-hidden flex items-center justify-center">

                {!imageLoaded && (
                    <div className="absolute inset-0 bg-[#0C1630] animate-pulse flex items-center justify-center">
                        <span className="font-serif-luxury text-xs text-[#D4AF37]/50 tracking-widest">
                            SHOPKART LUXE
                        </span>
                    </div>
                )}

                <img
                    src={imgSrc || fallbackImage}
                    alt={product.name}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImgSrc(fallbackImage);
                        setImageLoaded(true);
                    }}
                    className={`w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1228] via-transparent to-black/30 pointer-events-none" />

                {/* Category & Stock Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#060B19]/80 backdrop-blur-md text-[#F3E5AB] border border-[#D4AF37]/40 shadow-md">
                        {product.category || 'Featured'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide backdrop-blur-md border shadow-md ${stockInfo.color}`}>
                        {stockInfo.text}
                    </span>
                </div>

                {/* Floating Quick Add-To-Cart Icon Button on Image */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={cartLoading || product.stock === 0}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-xl cursor-pointer z-10 flex items-center justify-center ${
                        inCartQuantity > 0
                            ? 'bg-[#D4AF37] text-[#060B19] border-[#F3E5AB] scale-105 shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                            : 'bg-[#060B19]/85 text-[#F3E5AB] border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-[#060B19] hover:scale-110'
                    } ${cartLoading ? 'opacity-70 animate-pulse' : ''} ${product.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={
                        product.stock === 0
                            ? 'Out of Stock'
                            : inCartQuantity > 0
                            ? `In Cart (${inCartQuantity}) - Click to add another`
                            : 'Add to Cart'
                    }
                >
                    {cartLoading ? (
                        <span className="text-xs animate-spin">⏳</span>
                    ) : inCartQuantity > 0 ? (
                        <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="text-[10px] font-black leading-none">{inCartQuantity}</span>
                        </div>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* CARD BODY */}
            <div className="p-5 flex flex-col flex-grow justify-between border-t border-[#D4AF37]/15">

                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-[#D4AF37]/80 mb-1.5">
                        {product.category}
                    </p>

                    <h3 className="font-heading text-lg font-bold text-slate-100 group-hover:text-[#FFF1B8] transition-colors line-clamp-1 mb-2">
                        {product.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-light">
                        {product.description}
                    </p>
                </div>

                <div>

                    {/* PRICE */}
                    <div className="flex items-baseline justify-between pt-3 pb-4 border-t border-white/5">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                                Price
                            </span>

                            <span className="text-xl font-bold text-gold-gradient font-sans">
                                {formatPrice(product.price)}
                            </span>
                        </div>

                        <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                                Availability
                            </span>

                            <span className={`text-xs font-semibold ${
                                stockInfo.isOutOfStock
                                    ? 'text-rose-400'
                                    : 'text-amber-300'
                            }`}>
                                {stockInfo.text}
                            </span>
                        </div>
                    </div>

                    {/* NOTIFICATION FEEDBACK */}
                    {cartMessage && (
                        <div className="mb-2 p-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFF4CC] text-[11px] font-medium text-center animate-fade-in">
                            {cartMessage}
                        </div>
                    )}

                    {/* ACTION BUTTONS (VIEW & ADD TO CART) */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => onViewDetails(product)}
                            className="py-2.5 px-2 rounded-xl font-medium text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer btn-gold shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            <span>Details</span>
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={cartLoading || product.stock === 0}
                            className={`py-2.5 px-2 rounded-xl font-medium text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 border cursor-pointer ${
                                inCartQuantity > 0
                                    ? 'text-[#060B19] bg-gradient-to-r from-[#DFB15B] to-[#D4AF37] border-[#F3E5AB] font-bold shadow-md'
                                    : 'text-[#F3E5AB] bg-white/5 border-[#D4AF37]/30 hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]/60'
                            } ${cartLoading ? 'opacity-70 cursor-not-allowed' : ''} ${product.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            {cartLoading ? (
                                <span>Adding...</span>
                            ) : inCartQuantity > 0 ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>In Cart ({inCartQuantity})</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>Add Cart</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* WISHLIST BUTTON */}
                    <button
                        type="button"
                        onClick={handleAddToWishlist}
                        disabled={wishlistLoading || isWishlisted}
                        className={`w-full mt-2 py-2 px-3 rounded-xl font-medium text-[11px] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 border ${
                            isWishlisted
                                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                                : 'text-slate-400 bg-transparent border-white/10 hover:bg-white/[0.04] hover:border-[#D4AF37]/30 hover:text-[#F3E5AB]'
                        } ${
                            wishlistLoading
                                ? 'opacity-70 cursor-not-allowed'
                                : 'cursor-pointer'
                        }`}
                    >
                        {wishlistLoading ? (
                            <>
                                <span>⏳</span>
                                <span>Saving...</span>
                            </>
                        ) : isWishlisted ? (
                            <>
                                <span>♥</span>
                                <span>In Wishlist</span>
                            </>
                        ) : (
                            <>
                                <span>♡</span>
                                <span>Add to Wishlist</span>
                            </>
                        )}
                    </button>

                    {/* ERROR MESSAGE */}
                    {wishlistError && (
                        <p className="mt-2 text-xs text-rose-400 text-center">
                            {wishlistError}
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}

export default ProductCard;