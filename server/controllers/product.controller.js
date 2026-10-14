import Product from "../models/product.model.js"



export const registerProduct = async (req, res) => {
    try {

        const {name, description, price, category, image, stock} = req.body

        if(!name || !description || !price || !category || !image || !stock){
            return res.status(400).json({message: "All fields are required!"})
        }

        if(price <= 0){
            return res.status(400).json({message: "Price must be greater than 0"})
        }

        if(stock < 0){
            return res.status(400).json({message: "Stock quantity must be atleast 0"})
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        })

        await newProduct.save()

        return res.status(201).json({message: "New Product created Successfully!", newProduct: newProduct})
        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }

}

const escapeRegex = (string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const getAllProducts = async (req, res) => {
    try {
        const searchTerm = (req.query.search || req.query.query || req.query.q || '').trim();
        const categoryTerm = (req.query.category || req.query.cat || '').trim();
        const sort = req.query.sort;

        let query = {};

        if (searchTerm !== '') {
            const safeSearch = escapeRegex(searchTerm);
            query.$or = [
                { name: { $regex: safeSearch, $options: 'i' } },
                { description: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        if (categoryTerm !== '' && categoryTerm.toLowerCase() !== 'all') {
            const safeCategory = escapeRegex(categoryTerm);
            query.category = { $regex: `^${safeCategory}$`, $options: 'i' };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'name') sortOption = { name: 1 };

        const products = await Product.find(query).sort(sortOption).select('name description price category image stock createdAt');
        return res.status(200).json({ success: true, message: "Products found", products, count: products.length });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "No Product Found!" });
        }

        return res.status(200).json({ success: true, message: "Product Found!", product });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const seedProducts = async (req, res) => {
    try {
        const dummyProducts = [
            {
                name: "Titanium Pro Smartphone",

                description: "Flagship 5G smartphone with aerospace titanium frame, 120Hz LTPO display, triple 50MP cameras, and all-day endurance battery.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
                price: 64999,
                stock: 7
            },
            {
                name: "Gold-Edition Luxury Smartphone",
                description: "Artisan smartphone featuring 24k gold galvanic accents, encrypted biometric security, and magnetic wireless fast charging.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
                price: 89999,
                stock: 3
            },
            {
                name: "Mechanical Keyboard",
                description: "RGB mechanical keyboard with custom blue switches, golden accents, and aircraft-grade aluminum frame.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
                price: 2999,
                stock: 10
            },

            {
                name: "Aura Chronograph Gold Watch",
                description: "Luxury sapphire crystal analog chronograph with 18k gold accents, midnight navy dial, and genuine Italian leather strap.",
                category: "Wearables",
                image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
                price: 14999,
                stock: 5
            },
            {
                name: "Studio Hi-Fi Wireless Headphones",
                description: "Audiophile-grade active noise cancellation headphones with custom titanium drivers and 40-hour ultra-endurance battery.",
                category: "Audio",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                price: 8499,
                stock: 15
            },
            {
                name: "Minimalist Smart Fitness Band Ultra",
                description: "Titanium alloy fitness tracker with AMOLED always-on display, ECG heart tracking, and 100m water resistance.",
                category: "Wearables",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                price: 4999,
                stock: 8
            },
            {
                name: "Precision Optical Pro Gaming Mouse",
                description: "26,000 DPI optical sensor, ultra-lightweight golden chassis with lag-free 2.4GHz wireless connection.",
                category: "Gaming",
                image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
                price: 3499,
                stock: 19
            },
            {
                name: "Vintage 4K Mirrorless Digital Camera",
                description: "Classic retro styling paired with full-frame sensor technology, 4K 60fps video, and dual stabilization.",
                category: "Cameras",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
                price: 54999,
                stock: 4
            },
            {
                name: "Aerospace Aluminium Laptop Riser",
                description: "Ergonomic foldable desktop stand engineered from CNC-machined aerospace alloy with silicone protection.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
                price: 1999,
                stock: 20
            },
            {
                name: "Full-Grain Leather Weekender Bag",
                description: "Timeless travel duffle handcrafted from vegetal-tanned leather with antique brass hardware and shoe compartment.",
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
                price: 11999,
                stock: 6
            },
            {
                name: "Polarized Gold-Frame Aviators",
                description: "Premium optical-grade polarized sunglasses with 24k gold galvanic plating and 100% UV400 protection.",
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
                price: 3799,
                stock: 18
            },
            {
                name: "Artisan Ceramic Pour-Over Kettle Set",
                description: "Handcrafted matte ceramic coffee brewer with precision gooseneck spout and thermal insulation.",
                category: "Home & Living",
                image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
                price: 2499,
                stock: 14
            },
            {
                name: "Carbon Fiber Pro Camera Tripod",
                description: "Ultra-compact 8-layer carbon fiber tripod with fluid 360-degree ball head and rapid twist locks.",
                category: "Cameras",
                image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&auto=format&fit=crop&q=80",
                price: 6999,
                stock: 12
            },
            {
                name: "Aromatherapy Ultrasonic Marble Diffuser",
                description: "Sculpted stone ceramic diffuser with ambient warm-gold halo illumination and whisper-quiet operation.",
                category: "Home & Living",
                image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
                price: 2899,
                stock: 0
            }
        ];

        const count = await Product.countDocuments();
        if (req.query.force === 'true' || count === 0) {
            if (req.query.force === 'true') {
                await Product.deleteMany({});
            }
            await Product.insertMany(dummyProducts);
            return res.status(201).json({ success: true, message: `Seeded ${dummyProducts.length} dummy products successfully!` });
        }

        return res.status(200).json({ success: true, message: `Database already has ${count} products. Use ?force=true to re-seed.` });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};