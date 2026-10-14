import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../axiosCalls/axios';

// Helper to load Razorpay checkout script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function Checkout() {
    const { cart, cartTotal, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [verifiedOrder, setVerifiedOrder] = useState(null);

    // Track active created order ID in case of failure / cancellation
    const activeOrderIdRef = useRef(null);

    // Synchronize full name if user loads after mount
    useEffect(() => {
        if (user?.fullName && !formData.fullName) {
            setFormData(prev => ({ ...prev, fullName: user.fullName }));
        }
    }, [user]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (apiError) setApiError('');
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\+?[0-9]{10,14}$/.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
            errors.phone = 'Please enter a valid phone number (e.g. 9876543210)';
        }
        if (!formData.address.trim()) errors.address = 'Street address is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.pincode.trim()) {
            errors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{4,8}$/.test(formData.pincode.trim())) {
            errors.pincode = 'Please enter a valid pincode';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Helper to delete pending order if user cancels or payment fails
    const cleanupPendingOrder = async (orderId) => {
        if (!orderId) return;
        try {
            await axiosInstance.delete(`/orders/${orderId}`);
        } catch (err) {
            console.warn('Failed to cleanup pending order:', err?.message);
        }
    };

    // Cancel order action - returns back to cart and clears any pending order
    const handleCancelOrder = async () => {
        if (activeOrderIdRef.current) {
            await cleanupPendingOrder(activeOrderIdRef.current);
            activeOrderIdRef.current = null;
        }
        navigate('/cart');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!cart || cart.length === 0) {
            setApiError('Your cart is empty. Please add items before placing an order.');
            return;
        }

        setLoading(true);
        setApiError('');

        try {
            // 1. Ensure Razorpay checkout script is loaded
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                setApiError('Razorpay SDK failed to load. Please check your internet connection.');
                setLoading(false);
                return;
            }

            // 2. Create pending order on backend and get Razorpay order details
            const payload = {
                shippingAddress: {
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.trim(),
                    addressLine1: formData.address.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                }
            };

            const { data } = await axiosInstance.post('/orders/create-payment-order', payload);

            if (!data.success) {
                throw new Error(data.message || 'Failed to initiate payment.');
            }

            // Save order ID reference for cleanup in case of cancellation/failure
            activeOrderIdRef.current = data.orderId;

            // 3. Configure Razorpay options
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'ShopKart Luxe',
                description: 'Order Payment Checkout',
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // 4. Verify payment signature on backend
                        const verifyRes = await axiosInstance.post('/orders/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data?.success) {
                            // Successfully paid & verified, clear reference
                            activeOrderIdRef.current = null;
                            // Update cart context
                            await fetchCart();
                            setVerifiedOrder(verifyRes.data.order);
                            setPaymentSuccess(true);
                        } else {
                            // Payment verification failed: cleanup and redirect to cart
                            if (activeOrderIdRef.current) {
                                await cleanupPendingOrder(activeOrderIdRef.current);
                                activeOrderIdRef.current = null;
                            }
                            navigate('/cart');
                        }
                    } catch (verifyErr) {
                        console.error('Payment verification error:', verifyErr);
                        // Clean up order and return back to cart
                        if (activeOrderIdRef.current) {
                            await cleanupPendingOrder(activeOrderIdRef.current);
                            activeOrderIdRef.current = null;
                        }
                        navigate('/cart');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: user?.email || '',
                    contact: formData.phone
                },
                theme: {
                    color: '#D4AF37'
                },
                modal: {
                    ondismiss: async function () {
                        // User dismissed modal / cancelled payment: delete pending order and redirect back to cart
                        setLoading(false);
                        if (activeOrderIdRef.current) {
                            await cleanupPendingOrder(activeOrderIdRef.current);
                            activeOrderIdRef.current = null;
                        }
                        navigate('/cart');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', async function (response) {
                console.error('Razorpay Payment Failed:', response.error);
                setLoading(false);
                // On payment failure, delete pending order and return to cart
                if (activeOrderIdRef.current) {
                    await cleanupPendingOrder(activeOrderIdRef.current);
                    activeOrderIdRef.current = null;
                }
                navigate('/cart');
            });
            rzp.open();

        } catch (err) {
            console.error('Place order error:', err);
            setApiError(err?.response?.data?.message || err.message || 'Could not initiate checkout process.');
            setLoading(false);
        }
    };

    // Render Success Screen after successful order placement
    if (paymentSuccess) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full bg-gradient-to-b from-[#0F1E3D] to-[#0A1226] border border-[#D4AF37]/50 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(212,175,55,0.2)] animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center mx-auto mb-6 text-4xl text-[#D4AF37]">
                        ✓
                    </div>
                    <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-1">
                        Payment Successful
                    </p>
                    <h1 className="font-serif-luxury text-3xl font-bold text-gold-shimmer mb-3">
                        Order Confirmed!
                    </h1>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed font-light">
                        Thank you for your purchase. Your order has been placed successfully and is being prepared for express delivery.
                    </p>

                    {verifiedOrder && (
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6 text-left text-xs space-y-2.5">
                            <div className="flex justify-between text-slate-400">
                                <span>Order ID:</span>
                                <span className="text-[#F3E5AB] font-mono font-bold">#{verifiedOrder._id}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Total Paid:</span>
                                <span className="text-emerald-400 font-bold">{formatPrice(verifiedOrder.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Status:</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {verifiedOrder.status}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Deliver To:</span>
                                <span className="text-slate-200 text-right truncate max-w-[200px]">
                                    {verifiedOrder.shippingAddress?.fullName}, {verifiedOrder.shippingAddress?.city}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/orders')}
                            className="flex-1 py-3.5 px-4 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl"
                        >
                            View My Orders
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 py-3.5 px-4 rounded-xl btn-gold-outline text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Empty Cart Warning
    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-3xl text-[#D4AF37]">
                    🛒
                </div>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
                    Your Cart is Empty
                </h2>
                <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed font-light">
                    You do not have any items in your bag to checkout. Please explore our collections and add products.
                </p>
                <Link
                    to="/"
                    className="px-8 py-3.5 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060B19] text-slate-100 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page Title */}
                <div className="mb-8 pb-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
                    <div>
                        <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-1">
                            Secure Payment
                        </p>
                        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-gold-shimmer">
                            Checkout
                        </h1>
                    </div>
                    <Link
                        to="/cart"
                        className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1.5 transition-colors"
                    >
                        <span>← Back to Cart</span>
                    </Link>
                </div>

                {/* Error Banner */}
                {apiError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                        <span className="text-base leading-none">⚠️</span>
                        <div>
                            <p className="font-semibold">Checkout Alert</p>
                            <p className="mt-0.5 opacity-90">{apiError}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Shipping Details Card */}
                        <div className="lg:col-span-7">
                            <div className="bg-gradient-to-b from-[#0F1E3D] to-[#0A1226] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-xl">
                                <div className="flex items-center gap-3 pb-5 border-b border-white/10 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                                        1
                                    </div>
                                    <h2 className="font-serif-luxury text-xl font-bold text-slate-100">
                                        Shipping Details
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                            Full Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className={`w-full px-4 py-3 bg-[#060B19]/80 border ${formErrors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'} rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all`}
                                        />
                                        {formErrors.fullName && (
                                            <p className="mt-1 text-xs text-rose-400">{formErrors.fullName}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                            Phone <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 9876543210"
                                            className={`w-full px-4 py-3 bg-[#060B19]/80 border ${formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'} rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all`}
                                        />
                                        {formErrors.phone && (
                                            <p className="mt-1 text-xs text-rose-400">{formErrors.phone}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                            Address <span className="text-rose-400">*</span>
                                        </label>
                                        <textarea
                                            name="address"
                                            rows="2"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Flat / House No., Street, Landmark"
                                            className={`w-full px-4 py-3 bg-[#060B19]/80 border ${formErrors.address ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'} rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all resize-none`}
                                        />
                                        {formErrors.address && (
                                            <p className="mt-1 text-xs text-rose-400">{formErrors.address}</p>
                                        )}
                                    </div>

                                    {/* City & State (Row) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                                City <span className="text-rose-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Mumbai"
                                                className={`w-full px-4 py-3 bg-[#060B19]/80 border ${formErrors.city ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'} rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all`}
                                            />
                                            {formErrors.city && (
                                                <p className="mt-1 text-xs text-rose-400">{formErrors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                                State <span className="text-rose-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Maharashtra"
                                                className={`w-full px-4 py-3 bg-[#060B19]/80 border ${formErrors.state ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'} rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all`}
                                            />
                                            {formErrors.state && (
                                                <p className="mt-1 text-xs text-rose-400">{formErrors.state}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pincode */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                                            Pincode <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 400001"
                                            className={`w-full px-4 py-3 bg-[#060B19]/80 border ${formErrors.pincode ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'} rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all`}
                                        />
                                        {formErrors.pincode && (
                                            <p className="mt-1 text-xs text-rose-400">{formErrors.pincode}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Order Summary Card */}
                        <div className="lg:col-span-5">
                            <div className="bg-gradient-to-b from-[#0F1E3D] to-[#0A1226] border border-[#D4AF37]/35 rounded-2xl p-6 sm:p-8 shadow-xl sticky top-28">
                                <div className="flex items-center gap-3 pb-5 border-b border-white/10 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                                        2
                                    </div>
                                    <h2 className="font-serif-luxury text-xl font-bold text-gold-shimmer">
                                        Order Summary
                                    </h2>
                                </div>

                                {/* Items Breakdown */}
                                <div className="space-y-3.5 mb-6 max-h-[300px] overflow-y-auto pr-1">
                                    {cart.map((item) => {
                                        const prod = item.product;
                                        if (!prod) return null;
                                        const lineTotal = (prod.price || 0) * (item.quantity || 1);

                                        return (
                                            <div
                                                key={prod._id || item._id}
                                                className="flex items-center justify-between gap-3 text-sm py-2 border-b border-white/5 last:border-0"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {prod.image && (
                                                        <img
                                                            src={prod.image}
                                                            alt={prod.name}
                                                            className="w-10 h-10 rounded-lg object-cover bg-[#070D1F] border border-[#D4AF37]/20 shrink-0"
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-200 truncate text-xs sm:text-sm">
                                                            {prod.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {item.quantity} × {formatPrice(prod.price)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="font-bold text-[#F3E5AB] text-xs sm:text-sm">
                                                        {formatPrice(lineTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Calculation Rows */}
                                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Items Subtotal</span>
                                        <span className="font-semibold text-slate-100">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping & Handling</span>
                                        <span className="text-emerald-400 font-semibold uppercase tracking-wider">Free</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Estimated Taxes (GST)</span>
                                        <span>Included</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="mt-5 pt-4 border-t border-[#D4AF37]/35 flex items-baseline justify-between">
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
                                            Total
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            All taxes included
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-gold-gradient font-sans">
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 py-4 px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider btn-gold shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin text-base">✦</span>
                                            <span>Processing Order...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Place Order</span>
                                            <span>({formatPrice(cartTotal)})</span>
                                        </>
                                    )}
                                </button>

                                {/* Cancel Order Button Just Below Place Order */}
                                <button
                                    type="button"
                                    onClick={handleCancelOrder}
                                    disabled={loading}
                                    className="w-full mt-3 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <span>✕</span>
                                    <span>Cancel Order</span>
                                </button>

                                {/* Security Badges */}
                                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="text-[#D4AF37]">🔒</span> Razorpay Secured
                                    </span>
                                    <span>•</span>
                                    <span>256-Bit SSL</span>
                                    <span>•</span>
                                    <span>Fast Delivery</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

            </div>
        </div>
    );
}

export default Checkout;
