import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import ProductModal from './ProductModal';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError('');

            console.log("Calling wishlist API...");

            const response = await axiosInstance.get('/wishlist');

            console.log("Wishlist response:", response.data);

            if (response.data?.success) {
                setWishlist(response.data.wishlist || []);
            }

        } catch (error) {
            console.error("Wishlist fetch error:", error);
            console.error("Response:", error?.response);
            console.error("Status:", error?.response?.status);
            console.error("Message:", error?.message);

            if (error?.response?.status === 401) {
                navigate('/login');
                return;
            }

            setError(
                error?.response?.data?.message ||
                "Unable to load wishlist."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId) => {
        try {
            await axiosInstance.delete(`/wishlist/${productId}`);

            // Remove from UI immediately after successful API call
            setWishlist((prevWishlist) =>
                prevWishlist.filter(
                    (product) => product._id !== productId
                )
            );

        } catch (error) {
            console.error("Remove wishlist error:", error);

            alert(
                error?.response?.data?.message ||
                "Unable to remove product from wishlist."
            );
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#060B19] text-slate-100 flex items-center justify-center">
                <p className="text-[#D4AF37] text-sm tracking-wider">
                    Loading your wishlist...
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#060B19] text-slate-100 flex flex-col items-center justify-center gap-4">
                <p className="text-rose-400">
                    Unable to load wishlist.
                </p>

                <button
                    onClick={fetchWishlist}
                    className="px-5 py-2.5 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060B19] text-slate-100">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* HEADER */}
                <div className="mb-8">

                    <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                        Your Collection
                    </p>

                    <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-gold-shimmer">
                        My Wishlist
                    </h1>

                    <p className="text-slate-400 mt-2 text-sm">
                        {wishlist.length} {
                            wishlist.length === 1
                                ? 'product'
                                : 'products'
                        } saved
                    </p>

                </div>

                {/* EMPTY STATE */}
                {wishlist.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center border border-[#D4AF37]/15 rounded-2xl bg-[#0A1228]/50">

                        <div className="text-5xl mb-5">
                            ❤️
                        </div>

                        <h2 className="text-xl font-semibold text-slate-100 mb-2">
                            Your wishlist is empty ❤️
                        </h2>

                        <p className="text-sm text-slate-400 mb-6">
                            Start saving products you love.
                        </p>

                        <Link
                            to="/"
                            className="px-6 py-3 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider"
                        >
                            Browse Products
                        </Link>

                    </div>
                ) : (

                    /* PRODUCTS */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                        {wishlist.map((product) => (

                            <div
                                key={product._id}
                                className="group relative flex flex-col bg-gradient-to-b from-[#0F1C3B]/90 to-[#0A1228]/95 border border-[#D4AF37]/25 hover:border-[#D4AF37]/65 rounded-2xl overflow-hidden shadow-xl transition-all duration-300"
                            >

                                {/* IMAGE */}
                                <div className="relative w-full aspect-[4/3] bg-[#070D1F] overflow-hidden">

                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#060B19]/80 backdrop-blur-md text-[#F3E5AB] border border-[#D4AF37]/40">
                                            {product.category}
                                        </span>
                                    </div>

                                </div>

                                {/* DETAILS */}
                                <div className="p-5 flex flex-col flex-grow">

                                    <h2 className="text-lg font-bold text-slate-100 mb-2">
                                        {product.name}
                                    </h2>

                                    <p className="text-xl font-bold text-[#D4AF37] mb-1">
                                        {formatPrice(product.price)}
                                    </p>

                                    <p className="text-xs text-slate-400 mb-5">
                                        {product.category}
                                    </p>

                                    <div className="text-xs text-slate-400 mb-5">
                                        {product.stock > 0
                                            ? `${product.stock} units left`
                                            : 'Out of Stock'
                                        }
                                    </div>

                                    {/* BUTTONS */}
                                    <div className="mt-auto flex gap-2">

                                        <button
                                            type="button"
                                            onClick={() => setSelectedProduct(product)}
                                            className="flex-1 py-2.5 rounded-xl btn-gold text-xs font-semibold uppercase tracking-wider cursor-pointer"
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRemove(product._id)}
                                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* PRODUCT DETAILS MODAL */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}

export default Wishlist;