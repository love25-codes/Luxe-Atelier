import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dns from 'node:dns';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { customerRoutes } from './routes/customer.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { wishlistRoutes } from './routes/wishlist.routes.js';
import { cartRoutes } from './routes/cart.routes.js';
import { orderRoutes } from './routes/orders.routes.js';

// Resolve custom DNS servers safely in development to bypass ISP SRV query blocks (e.g. Jio/Airtel)
// In production cloud hosts (Render/Railway), system datacenter DNS is used by default.
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CUSTOM_DNS === 'true') {
  try {
    dns.setServers([
      '8.8.8.8',
      '[2001:4860:4860::8888]',
      '8.8.8.8:1053',
      '[2001:4860:4860::8888]:1053',
    ]);
  } catch (dnsErr) {
    console.warn('DNS server override skipped, using system DNS:', dnsErr?.message || dnsErr);
  }
}

const app = express();
const PORT = process.env.PORT || 8000;

// Connecting to Database
if (!process.env.DBURL) {
  console.error("CRITICAL CONFIGURATION ERROR: DBURL environment variable is missing!");
  console.error("Please set DBURL in your .env or hosting environment variables.");
} else {
  mongoose
    .connect(process.env.DBURL)
    .then(() => {
      console.log("DB Connected!");
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
    });
}

app.use(express.json());
app.use(cookieParser());

// Allowed origins for CORS (supports comma-separated list in CLIENT_URL)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin is localhost or 127.0.0.1
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Check if origin matches allowedOrigins or if CLIENT_URL was not set
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel, Netlify, Render preview / deployment domains
      if (/\.(vercel\.app|netlify\.app|onrender\.com)$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }

      // Default allow with origin reflection for credentialed requests
      return callback(null, true);
    },
    credentials: true,
  })
);

// Health check endpoint for monitoring & deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Optional: Serve frontend static build if client/dist exists (Unified full-stack deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all frontend client routes in Express 5
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/customers') &&
      !req.path.startsWith('/products') &&
      !req.path.startsWith('/wishlist') &&
      !req.path.startsWith('/cart') &&
      !req.path.startsWith('/orders') &&
      !req.path.startsWith('/health')
    ) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Starting Server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});