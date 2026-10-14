import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js'
import { createPayment, getAllOrders, getOneOrder, verifyPayment, deleteOrder } from '../controllers/orders.controller.js'

export const orderRoutes = express.Router()

orderRoutes.post("/create-payment-order", isAuthenticated, createPayment)
orderRoutes.post("/verify-payment", isAuthenticated, verifyPayment)
orderRoutes.get("/", isAuthenticated, getAllOrders)
orderRoutes.get("/:id", isAuthenticated, getOneOrder)
orderRoutes.delete("/:id", isAuthenticated, deleteOrder)