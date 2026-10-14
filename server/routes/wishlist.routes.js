import express from 'express'
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

export const wishlistRoutes = express.Router()

wishlistRoutes.get("/", isAuthenticated, getWishlist)     //get wishlist
wishlistRoutes.post("/:productId", isAuthenticated, addToWishlist)      //add item in the wishlist
wishlistRoutes.delete("/:productId", isAuthenticated, removeFromWishlist)
