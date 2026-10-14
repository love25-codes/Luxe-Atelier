import 'dotenv/config';
import mongoose from "mongoose";
import Razorpay from 'razorpay';
import crypto from "crypto";

import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    });
};


// Validate cart, create ShopKart pending order and Razorpay Order
// Create ShopKart pending order and Razorpay Order
export const createPayment = async (req, res) => {
    try {

        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Get shipping address
        const { shippingAddress } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        // 3. Find authenticated customer
        const customer = await Customer.findById(req.customer._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 4. Check cart
        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const orderItems = [];
        let totalAmount = 0;

        // 5. Check every cart item
        for (const cartItem of customer.cart) {

            const product = await Product.findById(cartItem.product);

            // Product was deleted
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // 6. FINAL STOCK VERIFICATION
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            // 7. Calculate price using DATABASE price
            const itemTotal = product.price * cartItem.quantity;

            totalAmount += itemTotal;

            // 8. Create order snapshot
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });
        }

        // 9. Create ShopKart order
        const order = await Order.create({
            user: customer._id,
            items: orderItems,

            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                addressLine1: shippingAddress.addressLine1,
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode
            },
            totalAmount: totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        // 10. Create Razorpay order
        // Razorpay expects amount in paise
        const razorpay = getRazorpayInstance();
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString()
        });

        // 11. Save Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;

        await order.save();

        // 12. Send payment information to frontend
        return res.status(200).json({
            success: true,
            message: "Payment order created",
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {

        console.error("Create payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};




// Verify Razorpay signature and confirm ShopKart order
export const verifyPayment = async (req, res) => {
    try {

        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Get Razorpay details
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        // 3. Create signature
        const generatedSignature = crypto                     //This is Node.js's built-in cryptography module.
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)      //Create a secure signature using SHA-256 and my Razorpay secret key.
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");                         //Now finish creating the signature and give me the result as hexadecimal text.

        /*Razorpay Order ID
                 +
                "|"
                 +
          Razorpay Payment ID
                 ↓
          order_12345|pay_67890
                 ↓
           HMAC + SHA256
                 ↓
        Your Razorpay Secret Key
                 ↓
         Generated Signature*/

        // 4. Compare signatures
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // 5. Find order
        const order = await Order.findOne({
            razorpayOrderId: razorpay_order_id,
            user: req.customer._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // 6. Update payment information
        order.razorpayPaymentId = razorpay_payment_id;

        order.paymentStatus = "PAID";

        order.status = "PLACED";

        await order.save();

        // 7. Find customer
        const customer = await Customer.findById(
            req.customer._id
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 8. CLEAR CART ONLY AFTER SUCCESSFUL PAYMENT
        customer.cart = [];

        await customer.save();

        // 9. Return success
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order
        });

    } catch (error) {

        console.error("Verify payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



// Get current user's orders
export const getAllOrders = async (req, res) => {
    try {
        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Find only this user's orders
        const orders = await Order.find({
            user: req.customer._id            //Find all Orders whose user field is equal to the customer's ID.
        })
        .sort({ createdAt: -1 });

        // 3. Return orders
        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get one order 
export const getOneOrder = async (req, res) => {
    try {
        // 1. Check authentication
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        // 2. Get order ID from URL
        const { id } = req.params;

        // 3. Validate order ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        // 4. Find order belonging to logged-in user
        const order = await Order.findOne({
            _id: id,
            user: req.customer._id
        }).populate(
            "items.product",
            "name price image stock"
        );

        // 5. Order not found
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // 6. Return order
        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get one order error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Delete / cancel an order by ID for the logged in user
export const deleteOrder = async (req, res) => {
    try {
        if (!req.customer) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOneAndDelete({
            _id: id,
            user: req.customer._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            deletedOrderId: id
        });
    } catch (error) {
        console.error("Delete order error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


