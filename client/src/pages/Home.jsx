import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

function Home() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial values from URL query string
    const urlSearch = searchParams.get('search') || searchParams.get('query') || searchParams.get('q') || '';
    const urlCategory = searchParams.get('category') || searchParams.get('cat') || 'All';
    const urlSort = searchParams.get('sort') || 'newest';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(urlCategory);
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [sortBy, setSortBy] = useState(urlSort);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);

    const debounceRef = useRef(null);

    // Fetch categories on mount
    const fetchCategories = async () => {
        try {
            const res = await productAPI.getCategories();
            if (res.data?.categories) {
                setCategories(res.data.categories);
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    // Central function to fetch filtered products from backend API
    const fetchFilteredProducts = async (searchVal, categoryVal, sortVal) => {
        try {
            setLoading(true);
            setError('');

            const params = {};
            if (searchVal && searchVal.trim() !== '') {
                params.search = searchVal.trim();
            }
            if (categoryVal && categoryVal !== 'All' && categoryVal.trim() !== '') {
                params.category = categoryVal.trim();
            }
            if (sortVal && sortVal !== 'newest') {
                params.sort = sortVal;
            }

            const response = await productAPI.getProducts(params);

            if (response.data?.products) {
                setProducts(response.data.products);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Error fetching filtered products from backend:", err);
            setError("Unable to load products. Please check if server is active.");
        } finally {
            setLoading(false);
        }
    };

    // Sync state with URL query parameters whenever searchParams changes
    useEffect(() => {
        const currentSearch = searchParams.get('search') || searchParams.get('query') || searchParams.get('q') || '';
        const currentCategory = searchParams.get('category') || searchParams.get('cat') || 'All';
        const currentSort = searchParams.get('sort') || 'newest';

        setSearchTerm(currentSearch);
        setSelectedCategory(currentCategory);
        setSortBy(currentSort);

        fetchFilteredProducts(currentSearch, currentCategory, currentSort);
    }, [searchParams]);

    // Fetch category list on initial mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Push new query parameters into URL
    const updateUrlParams = (search, category, sort) => {
        const nextParams = new URLSearchParams();
        if (search && search.trim() !== '') nextParams.set('search', search.trim());
        if (category && category !== 'All') nextParams.set('category', category);
        if (sort && sort !== 'newest') nextParams.set('sort', sort);
        setSearchParams(nextParams);
    };

    // Handle typing in search input (debounced by 300ms)
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateUrlParams(val, selectedCategory, sortBy);
        }, 300);
    };

    // Handle Enter / Form submit on search input
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        updateUrlParams(searchTerm, selectedCategory, sortBy);
        fetchFilteredProducts(searchTerm, selectedCategory, sortBy);
    };

    // Handle Category pill click (Immediate update)
    const handleCategoryClick = (category) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSelectedCategory(category);
        updateUrlParams(searchTerm, category, sortBy);
        fetchFilteredProducts(searchTerm, category, sortBy);
    };


    // Handle Sort change
    const handleSortChange = (e) => {
        const val = e.target.value;
        setSortBy(val);
        updateUrlParams(searchTerm, selectedCategory, val);
    };

    // Clear all filters
    const handleClearFilters = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearchTerm('');
        setSelectedCategory('All');
        setSortBy('newest');
        setSearchParams(new URLSearchParams());
    };

    // Seed dummy products button
    const handleSeedProducts = async () => {
        try {
            setIsSeeding(true);
            await productAPI.seed(true);
            await fetchCategories();
            await fetchFilteredProducts(searchTerm, selectedCategory, sortBy);
        } catch (err) {
            console.error("Failed to seed dummy products:", err);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060B19] text-slate-100 pb-20 relative selection:bg-[#D4AF37]/30">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#0E204D]/40 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-60 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
            
            {/* HERO SECTION */}
            <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/15 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    
                    {/* Chic Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/35 text-[#F3E5AB] text-xs uppercase font-semibold tracking-[0.25em] mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                        Exclusive Member Store
                    </div>

                    {/* Main Title */}
                    <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 max-w-4xl mx-auto mb-4">
                        Refined Luxury & <span className="text-gold-shimmer">Modern Tech</span>
                    </h1>

                    {/* Personalized Welcome */}
                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-6">
                        Welcome back, <span className="text-[#F3E5AB] font-semibold">{user?.fullName || 'Distinguished Member'}</span>. 
                        Explore our hand-selected catalog of premium electronics, fine wearables, and lifestyle essentials.
                    </p>

                    {/* Features Strip */}
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="text-[#D4AF37]">✦</span> 100% Genuine Certified
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[#D4AF37]">✦</span> Insured Express Dispatch
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[#D4AF37]">✦</span> Dedicated Concierge Support
                        </div>
                    </div>
                </div>
            </section>

            {/* FILTER & CONTROLS BAR */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="bg-gradient-to-b from-[#0F1E3D]/80 to-[#0A1226]/90 backdrop-blur-xl border border-[#D4AF37]/25 rounded-2xl p-5 sm:p-6 shadow-xl">
                    
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        
                        {/* Search Input Form */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/80">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder='Search products (e.g., "phone", "keyboard", "watch")...'
                                className="w-full pl-10 pr-20 py-3 bg-[#060B19]/80 border border-[#D4AF37]/30 rounded-xl text-slate-100 text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 placeholder:text-slate-500 transition-all shadow-inner"
                            />
                            
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            updateUrlParams('', selectedCategory, sortBy);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-white text-xs cursor-pointer rounded-lg hover:bg-white/5"
                                        title="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase btn-gold cursor-pointer"
                                    title="Search"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Sort & Quick Seed Controls */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort:</label>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="bg-[#060B19]/80 border border-[#D4AF37]/25 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#D4AF37] cursor-pointer"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>

                            {/* Reset / Reload Products Button */}
                            <button
                                type="button"
                                onClick={handleSeedProducts}
                                disabled={isSeeding}
                                className="px-3 py-2 rounded-xl text-xs font-semibold btn-gold-outline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                title="Re-seed high quality dummy products"
                            >
                                <svg className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Reload Dummy Data'}</span>
                            </button>
                        </div>

                    </div>

                    {/* Quick Search Chips */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">Quick Searches:</span>
                        {['phone', 'keyboard', 'watch', 'headphones', 'camera'].map((term) => (
                            <button
                                key={term}
                                type="button"
                                onClick={() => {
                                    setSearchTerm(term);
                                    updateUrlParams(term, selectedCategory, sortBy);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                                    searchTerm.toLowerCase() === term.toLowerCase()
                                        ? 'bg-[#D4AF37] text-[#060B19] font-bold'
                                        : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/5'
                                }`}
                            >
                                {term}
                            </button>
                        ))}
                    </div>

                    {/* Category Filter Pills (Dynamically Fetched from Backend) */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-[#D4AF37]/80 shrink-0 mr-1">
                            Categories:
                        </span>
                        
                        <button
                            type="button"
                            onClick={() => handleCategoryClick('All')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                                selectedCategory === 'All'
                                    ? 'btn-gold shadow-sm font-bold'
                                    : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
                            }`}
                        >
                            All
                        </button>

                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                                    selectedCategory.toLowerCase() === cat.toLowerCase()
                                        ? 'btn-gold shadow-sm font-bold'
                                        : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                </div>
            </section>

            {/* DYNAMIC PRODUCTS GRID SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                
                {/* Active Filters Summary Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[#D4AF37]/20">
                    <div>
                        <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-gold-shimmer">
                            Products Catalog
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {searchTerm || selectedCategory !== 'All' ? (
                                <span>
                                    Filtered by:{' '}
                                    {searchTerm && <strong className="text-[#F3E5AB]">"{searchTerm}" </strong>}
                                    {selectedCategory !== 'All' && <span>in <strong className="text-[#D4AF37]">{selectedCategory}</strong></span>}
                                </span>
                            ) : (
                                <span>Showing all available catalog products</span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {(searchTerm || selectedCategory !== 'All') && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="text-xs text-rose-300 hover:text-rose-200 underline underline-offset-4 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB]">
                            {products.length} {products.length === 1 ? 'Product Found' : 'Products Found'}
                        </span>
                    </div>
                </div>

                {/* Loading Skeleton State */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="rounded-2xl bg-[#0C152E]/80 border border-[#D4AF37]/15 p-4 animate-pulse">
                                <div className="aspect-[4/3] bg-white/5 rounded-xl mb-4" />
                                <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
                                <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-white/5 rounded w-full mb-4" />
                                <div className="h-8 bg-white/10 rounded-xl" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="p-8 text-center bg-rose-500/10 border border-rose-500/30 rounded-2xl max-w-lg mx-auto my-12">
                        <p className="text-rose-300 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => fetchFilteredProducts(searchTerm, selectedCategory, sortBy)}
                            className="px-4 py-2 rounded-xl text-xs uppercase font-bold btn-gold cursor-pointer"
                        >
                            Retry Loading
                        </button>
                    </div>
                )}

                {/* Empty State when Backend Filter returns 0 products */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20 px-4 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 max-w-xl mx-auto my-8">
                        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4 text-[#D4AF37] text-2xl font-serif-luxury">
                            ✦
                        </div>
                        <h3 className="font-serif-luxury text-xl font-bold text-slate-100 mb-2">
                            No Products Found
                        </h3>
                        <p className="text-xs text-slate-400 mb-6 font-light">
                            No products match your current search or category criteria.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 rounded-xl text-xs uppercase font-bold btn-gold-outline cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                            <button
                                onClick={handleSeedProducts}
                                className="px-4 py-2 rounded-xl text-xs uppercase font-bold btn-gold cursor-pointer"
                            >
                                Seed Dummy Products
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Grid Dynamically Rendered from Backend API Response */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onViewDetails={(prod) => setSelectedProduct(prod)}
                            />
                        ))}
                    </div>
                )}

            </section>

            {/* PRODUCT DETAILS MODAL */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {/* CLASSY FOOTER */}
            <footer className="mt-24 pt-10 border-t border-[#D4AF37]/20 text-center text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-serif-luxury font-bold text-sm text-gold-shimmer">
                            SHOPKART LUXE
                        </span>
                        <span className="text-slate-600">|</span>
                        <span>Curated Excellence &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] text-slate-400">
                        <span className="hover:text-[#F3E5AB] cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-[#F3E5AB] cursor-pointer">Terms of Service</span>
                        <span className="hover:text-[#F3E5AB] cursor-pointer">Concierge Support</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;