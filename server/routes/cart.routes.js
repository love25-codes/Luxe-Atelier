import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js'
import { addToCart, getCart, RemoveFromCart, updateCart, clearCart } from '../controllers/cart.controller.js'

export const cartRoutes = express.Router()

cartRoutes.get("/", isAuthenticated, getCart)
cartRoutes.post("/checkout", isAuthenticated, clearCart)
cartRoutes.delete("/clear", isAuthenticated, clearCart)
cartRoutes.delete("/all", isAuthenticated, clearCart)
cartRoutes.post("/:productId", isAuthenticated, addToCart)
cartRoutes.patch("/:productId", isAuthenticated, updateCart)
cartRoutes.delete("/:productId", isAuthenticated, RemoveFromCart)