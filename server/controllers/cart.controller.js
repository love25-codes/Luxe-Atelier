import mongoose from "mongoose"
import Product from "../models/product.model.js"
import Customer from "../models/customer.model.js"

export const addToCart = async (req, res) => {
    try {
        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Get productId from URL
        const { productId } = req.params;

        // 3. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 4. Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 5. Check stock
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        // 6. Find the customer
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // 7. Check if product already exists in cart
        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        // 8. Product already exists
        if (cartItem) {

            // Don't allow quantity to exceed stock
            if (cartItem.quantity >= product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available`
                });
            }

            // Increase quantity
            cartItem.quantity += 1;

        } else {

            // 9. Product not in cart → add with quantity 1
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        // 10. Save customer
        await customer.save();

        // 11. Return updated cart
        await customer.populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: customer.cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const getCart = async (req, res) => {
    try {
        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Load authenticated customer
        const customer = await Customer.findById(req.customer._id)
            .populate({
                path: "cart.product",
                select: "name description price category image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Filter out any cart items whose product was removed from the database
        const validCart = customer.cart.filter(item => item.product !== null);

        // 3. Return cart
        return res.status(200).json({
            success: true,
            cart: validCart
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};




export const updateCart = async (req, res) => {
    try {
        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Get productId from URL
        const { productId } = req.params;

        // 3. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 4. Get quantity from request body
        const { quantity } = req.body;

        // 5. Quantity must be a number
        if (typeof quantity !== "number") {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a number"
            });
        }

        // 6. Quantity must be at least 1
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // 7. Find product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 8. Check quantity against stock
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available`
            });
        }

        // 9. Find authenticated customer
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // 10. Find product in cart
        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        // 11. Product must already exist in cart
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        // 12. Update quantity
        cartItem.quantity = quantity;

        // 13. Save customer
        await customer.save();

        // 14. Populate product details
        await customer.populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: customer.cart
        });

    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};




export const RemoveFromCart = async (req, res) => {
    try {
        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Get productId
        const { productId } = req.params;

        // 3. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 4. Find customer
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // 5. Check if product exists in cart
        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        // 6. Remove product from cart
        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );

        // 7. Save customer
        await customer.save();

        // 8. Populate product details
        await customer.populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        // 9. Return updated cart
        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        });

    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Deduct purchased quantities from product stock if stock exists
        for (const item of customer.cart) {
            if (item.product && item.quantity) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        customer.cart = [];
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared / Checkout completed successfully",
            cart: []
        });
    } catch (error) {
        console.error("Clear cart error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};