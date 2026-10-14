import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 3. Check whether product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 4. Find authenticated customer
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // 5. Check if product is already in wishlist
        const alreadyExists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // 6. Add product to wishlist
        customer.wishlist.push(productId);

        await customer.save();

        // 7. Success response
        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            product
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const getWishlist = async (req, res) => {
    try {

        console.log("REQ.CUSTOMER:", req.customer);

        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const customer = await Customer.findById(req.customer._id);

        console.log("CUSTOMER:", customer);
        console.log("WISHLIST IDS:", customer?.wishlist);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const products = await Product.find({
            _id: { $in: customer.wishlist }
        }).select("name price category image stock description");

        console.log("PRODUCTS FOUND:", products);

        return res.status(200).json({
            success: true,
            count: products.length,
            wishlist: products
        });

    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const removeFromWishlist = async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Check whether product exists in wishlist
        const exists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        // Remove product
        customer.wishlist.pull(productId);

        // Save changes
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



/* if field is Mongoose Array...(Array of Objects..) simply push, pull will work

....For a normal JavaScript array, the easiest methods are:

Add → push()
Remove → splice(index, howMany)

....EXAMPLE
If you know the value, use indexOf()

For your wishlist:

let wishlist = ["p1", "p2", "p3"];
const productId = "p2";

const index = wishlist.indexOf(productId);

if (index !== -1) {
    wishlist.splice(index, 1);
}
console.log(wishlist);
// ["p1", "p3"]

*/ 