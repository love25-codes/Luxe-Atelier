import express from 'express'
import { getAllProducts, getProductById, registerProduct, getCategories, seedProducts } from '../controllers/product.controller.js'

export const productRoutes = express.Router()

productRoutes.post('/register', registerProduct)
productRoutes.get('/categories', getCategories)
productRoutes.post('/seed', seedProducts)
productRoutes.get('/seed', seedProducts)
productRoutes.get('/', getAllProducts)
productRoutes.get('/:id', getProductById)