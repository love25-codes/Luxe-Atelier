import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dns from 'node:dns';
import cors from 'cors';

import { customerRoutes } from './routes/customer.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { wishlistRoutes } from './routes/wishlist.routes.js';
import { cartRoutes } from './routes/cart.routes.js';
import { orderRoutes } from './routes/orders.routes.js';

dns.setServers([
  '8.8.8.8',
  '[2001:4860:4860::8888]',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]);

const app = express()
const PORT = 8000

//Connecting to Database..
mongoose.connect(process.env.DBURL)
.then(() => {
    console.log("DB Connected!")
}).catch((err) => {
    console.log("Some error Found ",err)
})

app.use(express.json())
app.use(cookieParser())   

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}))


app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)


//Staring Server
app.listen(PORT, ()=>{
    console.log("Server started!")
})