import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axiosInstance.get('/orders');
            if (response.data?.success) {
                setOrders(response.data.orders || []);
            } else {
                setError(response.data?.message || 'Unable to fetch orders.');
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError(err?.response?.data?.message || 'Failed to load your orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeleteOrder = async (orderId, e) => {
        if (e) e.stopPropagation();
        try {
            setDeletingId(orderId);
            const response = await axiosInstance.delete(`/orders/${orderId}`);
            if (response.data?.success) {
                setOrders(prev => prev.filter(o => o._id !== orderId));
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder(null);
                }
            } else {
                alert(response.data?.message || 'Failed to delete order.');
            }
        } catch (err) {
            console.error('Delete order error:', err);
            alert(err?.response?.data?.message || 'Could not delete order.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PLACED':
            case 'CONFIRMED':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        ● {status}
                    </span>
                );
            case 'SHIPPED':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 border border-sky-500/30 text-sky-300">
                        ● {status}
                    </span>
                );
            case 'DELIVERED':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        ● {status}
                    </span>
                );
            case 'PENDING_PAYMENT':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
                        ● PENDING PAYMENT
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 border border-slate-500/30 text-slate-300">
                        ● {status || 'PROCESSING'}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#060B19] text-slate-100 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#D4AF37]/20">
                    <div>
                        <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-1">
                            Purchase History
                        </p>
                        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-gold-shimmer">
                            My Orders
                        </h1>
                    </div>
                    {!loading && !error && orders.length > 0 && (
                        <div className="text-xs text-slate-400">
                            Showing <span className="text-[#F3E5AB] font-bold">{orders.length}</span> {orders.length === 1 ? 'order' : 'orders'}
                        </div>
                    )}
                </div>

                {/* 1. LOADING STATE */}
                {loading && (
                    <div className="space-y-6">
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="bg-gradient-to-b from-[#0F1E3D]/60 to-[#0A1226]/80 border border-[#D4AF37]/15 rounded-2xl p-6 sm:p-8 animate-pulse shadow-md"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-3">
                                    <div className="space-y-2">
                                        <div className="h-5 w-36 bg-slate-700/50 rounded"></div>
                                        <div className="h-3.5 w-24 bg-slate-800/60 rounded"></div>
                                    </div>
                                    <div className="h-6 w-24 bg-slate-700/50 rounded-full"></div>
                                </div>
                                <div className="my-5 space-y-3">
                                    <div className="h-4 w-48 bg-slate-700/40 rounded"></div>
                                    <div className="h-4 w-36 bg-slate-700/30 rounded"></div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="h-5 w-28 bg-slate-700/50 rounded"></div>
                                    <div className="h-9 w-28 bg-slate-700/40 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. ERROR STATE */}
                {!loading && error && (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center border border-rose-500/25 rounded-2xl bg-rose-500/5 p-8">
                        <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4 text-2xl text-rose-400">
                            ✕
                        </div>
                        <h2 className="font-serif-luxury text-2xl font-bold text-slate-100 mb-2">
                            Failed to Load Orders
                        </h2>
                        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={fetchOrders}
                            className="px-6 py-3 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* 3. EMPTY STATE */}
                {!loading && !error && orders.length === 0 && (
                    <div className="min-h-[450px] flex flex-col items-center justify-center text-center border border-[#D4AF37]/15 rounded-2xl bg-gradient-to-b from-[#0F1E3D]/40 to-[#0A1226]/60 p-8 shadow-inner">
                        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-3xl text-[#D4AF37]">
                            📦
                        </div>
                        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
                            You have not placed any orders yet.
                        </h2>
                        <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed font-light">
                            Discover our catalog of exclusive, premier products and elevate your lifestyle today.
                        </p>
                        <Link
                            to="/"
                            className="px-8 py-3.5 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl cursor-pointer"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}

                {/* 4. ORDERS LIST */}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const orderNumber = order._id ? `#${order._id.slice(-8)}` : `#${order._id}`;
                            const isDetailOpen = selectedOrder?._id === order._id;
                            const isDeleting = deletingId === order._id;

                            return (
                                <div
                                    key={order._id}
                                    className={`bg-gradient-to-b from-[#0F1E3D] to-[#0A1226] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 shadow-xl transition-all relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {/* Top-Right Cross (Remove) Icon on the Order Card */}
                                    <button
                                        type="button"
                                        title="Remove order summary"
                                        disabled={isDeleting}
                                        onClick={(e) => handleDeleteOrder(order._id, e)}
                                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer z-10"
                                    >
                                        ✕
                                    </button>

                                    {/* Card Header: Order Number & Date */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-3 pr-10">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-mono text-base sm:text-lg font-bold text-gold-shimmer">
                                                    Order {orderNumber}
                                                </h3>
                                                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                                                    ({order._id})
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {formatDate(order.createdAt)} {formatTime(order.createdAt) && `• ${formatTime(order.createdAt)}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="py-4 space-y-2">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between text-sm py-1 text-slate-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-9 h-9 rounded-lg object-cover bg-[#070D1F] border border-[#D4AF37]/20"
                                                            />
                                                        )}
                                                        <span className="font-medium text-xs sm:text-sm">
                                                            {item.name} <span className="text-slate-400">× {item.quantity}</span>
                                                        </span>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-semibold text-[#F3E5AB]">
                                                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No item details available</p>
                                        )}
                                    </div>

                                    {/* Total & Action */}
                                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <span className="text-xs uppercase tracking-wider text-slate-400 block">
                                                Total
                                            </span>
                                            <span className="text-xl sm:text-2xl font-bold text-gold-gradient font-sans">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrder(isDetailOpen ? null : order)}
                                                className="px-5 py-2.5 rounded-xl btn-gold-outline text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
                                            >
                                                <span>{isDetailOpen ? 'Hide Details' : 'View Details'}</span>
                                                <span className="text-xs transition-transform duration-200" style={{ transform: isDetailOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                    ▼
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* EXPANDED DETAILS / MODAL SECTION */}
                                    {isDetailOpen && (
                                        <div className="mt-6 pt-6 border-t border-[#D4AF37]/25 bg-black/20 rounded-xl p-5 sm:p-6 space-y-5 animate-in fade-in duration-200 relative">
                                            {/* Header with Cross Icon inside Order Details */}
                                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                                <h4 className="text-sm uppercase tracking-wider font-bold text-gold-shimmer">
                                                    Order Summary & Details
                                                </h4>
                                                <button
                                                    type="button"
                                                    title="Remove this order summary"
                                                    disabled={isDeleting}
                                                    onClick={(e) => handleDeleteOrder(order._id, e)}
                                                    className="w-7 h-7 rounded-full bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {/* Shipping Information */}
                                            <div>
                                                <h5 className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] mb-2">
                                                    Shipping Information
                                                </h5>
                                                {order.shippingAddress ? (
                                                    <div className="text-xs text-slate-300 space-y-1">
                                                        <p className="font-semibold text-slate-100">{order.shippingAddress.fullName}</p>
                                                        <p>{order.shippingAddress.addressLine1}</p>
                                                        <p>
                                                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                        </p>
                                                        {order.shippingAddress.phone && (
                                                            <p className="text-slate-400">Phone: {order.shippingAddress.phone}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">No shipping address recorded</p>
                                                )}
                                            </div>

                                            {/* Payment & Order Tracking Metadata */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs text-slate-300">
                                                <div>
                                                    <span className="text-slate-400 block text-[11px] uppercase">Payment Status</span>
                                                    <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {order.paymentStatus || 'PENDING'}
                                                    </span>
                                                </div>

                                                {order.razorpayPaymentId && (
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px] uppercase">Razorpay Payment ID</span>
                                                        <span className="font-mono text-slate-200 text-[11px] select-all">
                                                            {order.razorpayPaymentId}
                                                        </span>
                                                    </div>
                                                )}

                                                {order.razorpayOrderId && (
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px] uppercase">Razorpay Order ID</span>
                                                        <span className="font-mono text-slate-200 text-[11px] select-all">
                                                            {order.razorpayOrderId}
                                                        </span>
                                                    </div>
                                                )}

                                                <div>
                                                    <span className="text-slate-400 block text-[11px] uppercase">Order Created</span>
                                                    <span className="text-slate-200">
                                                        {new Date(order.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Remove Button in Details */}
                                            <div className="pt-3 border-t border-white/5 flex justify-end">
                                                <button
                                                    type="button"
                                                    disabled={isDeleting}
                                                    onClick={(e) => handleDeleteOrder(order._id, e)}
                                                    className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <span>✕</span>
                                                    <span>{isDeleting ? 'Removing...' : 'Remove Order'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Orders;
