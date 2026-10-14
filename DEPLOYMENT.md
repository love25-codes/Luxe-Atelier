# 🚀 ShopKart Luxe — Deployment Guide

This guide walks you step-by-step through deploying **ShopKart Luxe** (MERN Stack: React + Vite, Node.js + Express, MongoDB Atlas, Razorpay).

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

### 1. MongoDB Atlas Network Access (CRITICAL)
Cloud hosting platforms (Render, Vercel, Railway) use dynamic IP addresses. If you do not whitelist all IPs, your backend will fail with connection timeout errors:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left navigation, select **Network Access** (under Security).
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.
6. Ensure your database user has read and write privileges and you have your connection string (`DBURL`).

### 2. Razorpay API Keys
1. Go to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** → **API Keys**.
3. Generate or copy your `Key Id` (`rzp_test_...` or `rzp_live_...`) and `Key Secret`.

### 3. Generate a Strong JWT Secret
Generate a secure random string for JWT token encryption:
```bash
# In terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌟 Option 1: Decoupled Deployment (Vercel + Render) — *Recommended*

This is the standard architecture for modern MERN apps. The React frontend is served by Vercel's global CDN, and the Express backend runs on Render.

### Part A: Deploy Backend on Render

1. Go to [Render.com](https://render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository (`shop_kart_mern`).
3. Configure the service settings:
   - **Name**: `shopkart-backend` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add **Environment Variables** in Render:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production cookie flags & optimizations |
   | `PORT` | `10000` | (Render sets this automatically) |
   | `DBURL` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_generated_secret` | Random secure secret string |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` | Razorpay Key ID |
   | `RAZORPAY_KEY_SECRET` | `...` | Razorpay Key Secret |
   | `CLIENT_URL` | `https://your-shopkart.vercel.app` | Vercel frontend URL (you can update this once Vercel deploys) |
5. Click **Create Web Service**.
6. Once deployed, test the health check in your browser:
   ```
   https://shopkart-backend.onrender.com/health
   ```
   You should see: `{"status":"ok","uptime":...}`

---

### Part B: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com/) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://shopkart-backend.onrender.com` *(your Render backend URL without trailing slash)* |
5. Click **Deploy**.
6. Once deployment finishes, copy your live Vercel URL (e.g. `https://shopkart-luxe.vercel.app`) and update `CLIENT_URL` in your Render backend environment variables!

---

## ⚡ Option 2: Unified Monolith on Render (All-in-One Free Service)

If you prefer to host both Frontend and Backend on **a single free service**:

The server is pre-configured to detect `client/dist` and serve the React SPA directly alongside the API!

1. Go to [Render.com](https://render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Leave **Root Directory** blank (run from repository root).
4. Configure commands:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DBURL` | `mongodb+srv://...` |
   | `JWT_SECRET` | `your_secret` |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` |
   | `RAZORPAY_KEY_SECRET` | `...` |
6. Render will automatically build the client, compile assets into `client/dist`, and launch Express to serve both your API and your React app on one single URL!

> **Automated Blueprint**: You can also select **New +** → **Blueprint** on Render and point it to the included `render.yaml`.

---

## 🐳 Option 3: Docker / Self-Hosted VPS / Railway

The repository includes a multi-stage `Dockerfile` and `docker-compose.yml`.

### Running with Docker Compose:
```bash
# 1. Create .env with DBURL, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
# 2. Build and run container
docker compose up -d --build
```
The application will be accessible at `http://localhost:8000`.

---

## 🧪 Post-Deployment Verification Checklist

1. [ ] **Health Endpoint**: Navigate to `https://your-api-url/health` — should return HTTP 200 `{"status":"ok"}`.
2. [ ] **Seed Products (if DB is empty)**:
   - Visit `https://your-api-url/products/seed` in your browser (or use the *Admin Seed* button if logged in).
   - Verifies 14 curated luxury catalog items with Unsplash images are populated in MongoDB Atlas.
3. [ ] **User Registration & Login**: Register a test account on the frontend. Check that session persists on refresh (via JWT stored in localStorage & httpOnly cookies).
4. [ ] **Cart & Wishlist**: Add products to cart and wishlist, adjust quantities, verify state syncs across refreshes.
5. [ ] **Checkout & Razorpay**: Proceed to checkout, enter shipping address, and confirm the Razorpay checkout modal opens with the expected amount in INR.

---

## 🔒 Security & Best Practices in Production
- **Never commit `.env` files**: All secrets must stay in hosting dashboard environment variables.
- **Cross-Domain Cookies**: In production, cookies are set with `secure: true` and `sameSite: 'none'`. Browsers require HTTPS for cross-domain cookies to be stored.
- **Authorization Header Fallback**: The client also automatically stores the JWT token in `localStorage` and attaches `Authorization: Bearer <token>` to every request, ensuring full functionality even in browsers blocking third-party cookies.
