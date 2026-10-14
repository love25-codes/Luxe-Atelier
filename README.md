# ✨ Luxe-Atelier — Luxury MERN E-Commerce Platform 🛍️

<div align="center">

![Luxe Atelier Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

<p align="center">
  <strong>An ultra-premium, full-stack luxury e-commerce experience crafted with the MERN stack.</strong><br>
  Featuring Midnight Navy & Imperial Gold aesthetics, seamless JWT authentication, dynamic catalog browsing, personalized wishlist & cart, and secure Razorpay payment integration.
</p>

[🌟 Key Features](#-key-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Quick Start & Setup](#-quick-start--setup) • [🔑 Environment Variables](#-environment-variables) • [📡 API Reference](#-api-reference) • [🌐 Deployment Guide](DEPLOYMENT.md) • [📂 Project Architecture](#-project-architecture)

</div>

---

## 🌟 Key Features

### 👑 Premium Luxury Aesthetic & UI/UX
- **Midnight Navy & Imperial Gold Theme**: Styled with a tailored color palette (`#060B19` deep midnight background with `#D4AF37` / `#F5E8C7` gold accents).
- **Refined Typography**: Infused with Google Fonts — **Cinzel** & **Playfair Display** for high-fashion elegance paired with **Plus Jakarta Sans** for readability.
- **Glassmorphic Components**: Polished frosted glass modals, gradient borders, glowing hover transitions, and fluid animations.
- **Fully Responsive**: Mobile-first architecture adapting seamlessly from mobile viewports to ultra-wide displays.

### 🔐 Authentication & Security
- **JWT (JSON Web Tokens)**: Secure token creation and transmission through both HTTP-only cookies and `Authorization: Bearer` headers.
- **Bcrypt Password Hashing**: Industry-standard salt-hashed user credentials.
- **Protected Client Routes**: Client-side route guarding redirecting unauthorized users while preserving navigational state.
- **Customer Profile Management**: Secure password changing and authenticated `/customers/me` state checks.

### 💎 Catalog, Search & Filtering
- **Dynamic Search**: Instant multi-field querying (title and description) with regex sanitization against injection.
- **Category Filtering & Sorting**: Filter items across luxury categories (Audio, Wearables, Electronics, Gaming, Cameras) with low-to-high, high-to-low, and alphabetical sorting.
- **Quick-View Product Modal**: High-resolution image preview, live stock status indicators, quantity selector, and one-click actions.
- **Database Seeder**: Built-in `/products/seed` endpoint populating sample luxury products.

### 💖 Wishlist & 🛒 Real-Time Cart
- **Persistent Wishlist**: Save favorite items directly to customer accounts with instant visual state toggling.
- **Interactive Cart**: Increment, decrement, and remove items with dynamic subtotal, taxes, shipping computation, and stock boundaries.
- **Context API Sync**: Synchronized React Context providers (`AuthContext`, `CartContext`) ensuring instantaneous state updates across components without page reloads.

### 💳 Razorpay Payments & Order Fulfillment
- **Integrated Checkout Experience**: Multi-step checkout validating delivery address, pincode, and contact details.
- **Server-Side Order Creation**: Creates linked orders in MongoDB and Razorpay simultaneously.
- **HMAC SHA-256 Verification**: Server-side cryptographic signature verification ensuring payments cannot be forged or tampered with.
- **Order Tracking & History**: Visual order history dashboard displaying real-time shipment status badges (`PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`).

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Library/Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with request interceptors for token attachment)
- **Payment Gateway**: [Razorpay Checkout JS SDK](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- **Linter**: [Oxlint](https://oxc.rs/)

### Backend (`/server`)
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Web Framework**: [Express.js 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: [JSONWebToken (JWT)](https://jwt.io/), [bcrypt](https://www.npmjs.com/package/bcrypt), [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- **CORS Management**: [cors](https://www.npmjs.com/package/cors) with dynamic origin validation and credential support
- **Payment Verification**: [Razorpay Node SDK](https://github.com/razorpay/razorpay-node) + Node.js Native `crypto` module
- **Development Tooling**: [Nodemon](https://nodemon.io/)

---

## 📂 Project Architecture

```plaintext
Luxe-Atelier/
│
├── client/                               # React 19 + Vite Frontend
│   ├── public/                           # Static assets & favicons
│   ├── src/
│   │   ├── assets/                       # Images, logos, and vector graphics
│   │   ├── axiosCalls/
│   │   │   └── axios.js                  # Configured Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Cart.jsx                  # Sliding cart drawer & modal
│   │   │   ├── Navbar.jsx                # Luxury header with live badge counts & search
│   │   │   ├── ProductCard.jsx           # Interactive luxury product card
│   │   │   ├── ProductModal.jsx          # Detailed product view modal
│   │   │   ├── ProtectedRoute.jsx        # Route guard wrapper for authenticated pages
│   │   │   └── Wishlist.jsx              # Saved items grid with one-click cart transfer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Global user authentication provider
│   │   │   └── CartContext.jsx           # Global shopping cart state provider
│   │   ├── pages/
│   │   │   ├── Checkout.jsx              # Address input, order review & payment trigger
│   │   │   ├── Home.jsx                  # Hero showcase, filter bar & product catalog
│   │   │   ├── Login.jsx                 # User login page
│   │   │   ├── Orders.jsx                # Order history & invoice summary dashboard
│   │   │   └── Register.jsx              # Customer registration page
│   │   ├── App.jsx                       # Application router and layout tree
│   │   ├── index.css                     # Tailwind CSS imports & custom styles
│   │   └── main.jsx                      # DOM mount point
│   ├── index.html                        # Razorpay script & Google Fonts preloads
│   ├── package.json                      # Client dependencies & scripts
│   └── vite.config.js                    # Vite build & Tailwind plugin config
│
├── server/                               # Node.js + Express Backend
│   ├── controllers/
│   │   ├── cart.controller.js            # Cart add, increment, decrement, clear operations
│   │   ├── customer.controller.js        # Register, login, me, logout, password change
│   │   ├── orders.controller.js          # Razorpay order generation & crypto verification
│   │   ├── product.controller.js         # Product query, filter, detail & seeding
│   │   └── wishlist.controller.js        # Wishlist add, remove, and fetch operations
│   ├── middlewares/
│   │   └── auth.middleware.js            # JWT validation middleware
│   ├── models/
│   │   ├── customer.model.js             # Customer schema with embedded cart & wishlist
│   │   ├── order.model.js                # Order schema with shipping info & Razorpay IDs
│   │   └── product.model.js              # Product schema with price, category, stock
│   ├── routes/
│   │   ├── cart.routes.js                # /cart endpoints
│   │   ├── customer.routes.js            # /customers endpoints
│   │   ├── orders.routes.js              # /orders endpoints
│   │   ├── product.routes.js             # /products endpoints
│   │   └── wishlist.routes.js            # /wishlist endpoints
│   ├── utils/
│   │   └── generateToken.js              # JWT token generator
│   ├── .env.example                      # Sample backend environment configuration
│   ├── index.js                          # Express app entry, DB connect & middleware
│   └── package.json                      # Server dependencies & scripts
│
└── README.md                             # Project documentation
```

---

## 🚀 Quick Start & Setup

Follow these step-by-step instructions to get **Luxe-Atelier** up and running on your local machine.

### 📋 Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended) 👉 [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn**
- **MongoDB** (A local MongoDB instance or a free [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas))
- **Razorpay Account** (Sign up at [Razorpay](https://razorpay.com/) to obtain free Test Key ID and Secret)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/love25-codes/Luxe-Atelier.git
cd Luxe-Atelier
```

*(Or navigate into your existing project root folder)*

---

### 2️⃣ Backend Configuration & Setup

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory (you can copy the provided `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in your actual credentials:
   ```env
   # MongoDB Connection String (Atlas or local: mongodb://localhost:27017/luxe_atelier)
   DBURL=your_mongodb_connection_string

   # JWT Secret Key
   JWT_SECRET=your_super_secret_jwt_key_here

   # Razorpay API Credentials (Test Mode)
   RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Optional: Server Port (defaults to 8000)
   PORT=8000
   ```

4. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   > 🚀 The server will start on `http://localhost:8000` and connect to MongoDB!

---

### 3️⃣ Frontend Configuration & Setup

1. **Open a new terminal window** and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   > 🌐 The frontend client will run at `http://localhost:5173` (or the port specified by Vite).

---

### 4️⃣ Seed Sample Luxury Products 🌱

To immediately populate the store with curated luxury products (Watches, Headphones, Mechanical Keyboards, Cameras):

- Make a `GET` or `POST` request to:
  ```http
  GET http://localhost:8000/products/seed
  ```
- Or open `http://localhost:8000/products/seed` directly in your browser.
- You should receive:
  ```json
  {
    "message": "Sample products seeded successfully!",
    "count": 9
  }
  ```

---

### 5️⃣ Explore the Application 🎉

1. Open your browser and navigate to **`http://localhost:5173`**.
2. Click **Create an Account** to register a new user or log in.
3. Browse products, filter by categories, or search in real time.
4. Add items to your **Wishlist** or **Cart**.
5. Proceed to **Checkout**, provide shipping details, and test the **Razorpay Payment Gateway** in Test Mode!
6. View your placed orders in the **Orders** page.

---

## 🔑 Environment Variables

The server requires the following environment variables defined in `server/.env`:

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :---: |
| `DBURL` | MongoDB connection URI string | `mongodb+srv://user:pass@cluster0.mongodb.net/dbname` | **Yes** |
| `JWT_SECRET` | Secret key used to sign and verify JWT authentication tokens | `super_secure_random_string_123` | **Yes** |
| `RAZORPAY_KEY_ID` | Public Key ID from Razorpay Dashboard | `rzp_test_XXXXXXXXXXXXXXXXXX` | **Yes** |
| `RAZORPAY_KEY_SECRET` | Secret Key from Razorpay Dashboard | `YYYYYYYYYYYYYYYYYYYYYYYY` | **Yes** |
| `PORT` | Port number on which Express server listens | `8000` | No |

> ⚠️ **Security Notice**: Never commit your actual `.env` file with live credentials to Git. Ensure `.env` is listed in your `.gitignore`.

---

## 📡 API Reference

All backend endpoints are hosted with the base URL: `http://localhost:8000`

### 👤 Customer & Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/customers/register` | Register a new customer | ❌ No |
| `POST` | `/customers/login` | Authenticate customer and issue JWT | ❌ No |
| `GET` | `/customers/me` | Fetch authenticated customer profile | ✅ Yes |
| `POST` | `/customers/logout` | Clear session cookie & log out | ❌ No |
| `PATCH` | `/customers/change` | Update user password | ✅ Yes |

### 🛍️ Products (`/products`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/products` | Fetch all products (supports `?search=`, `?category=`, `?sort=`) | ❌ No |
| `GET` | `/products/categories` | Fetch distinct product categories | ❌ No |
| `GET` | `/products/:id` | Fetch single product by ID | ❌ No |
| `POST` | `/products/register` | Create a new product (Admin) | ❌ No |
| `GET/POST`| `/products/seed` | Populate database with sample luxury catalog | ❌ No |

### 🛒 Shopping Cart (`/cart`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/cart` | Get current customer's cart | ✅ Yes |
| `POST` | `/cart/:productId` | Add product to cart or increment quantity | ✅ Yes |
| `PATCH` | `/cart/:productId` | Update item quantity in cart | ✅ Yes |
| `DELETE` | `/cart/:productId` | Remove specific product from cart | ✅ Yes |
| `DELETE` | `/cart/clear` | Clear all items from cart | ✅ Yes |

### 💖 Wishlist (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/wishlist` | Retrieve all items in customer's wishlist | ✅ Yes |
| `POST` | `/wishlist/:productId` | Add product to wishlist | ✅ Yes |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist | ✅ Yes |

### 💳 Orders & Payments (`/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/orders/create-payment-order` | Validate cart & generate Razorpay order ID | ✅ Yes |
| `POST` | `/orders/verify-payment` | Verify HMAC-SHA256 signature & mark order as PAID | ✅ Yes |
| `GET` | `/orders` | Get all orders placed by authenticated user | ✅ Yes |
| `GET` | `/orders/:id` | Get details of a single order | ✅ Yes |
| `DELETE` | `/orders/:id` | Cancel/delete an order | ✅ Yes |

---

## 📜 Available Scripts

### In the Root directory:
- `npm run install:all`: Installs dependencies for both `server` and `client`.
- `npm run build`: Installs all dependencies and compiles the client production bundle.
- `npm start`: Starts the production Express server (serves both API & React client if compiled).
- `npm run server`: Launches the backend server in development mode with Nodemon.
- `npm run client`: Launches the Vite frontend development server.

### In the `client` directory:
- `npm run dev`: Launches the Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles production-ready optimized assets into the `dist` folder.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs Oxlint code analysis.

### In the `server` directory:
- `npm run dev`: Runs the Express server with Nodemon for automatic restarting on file edits.
- `npm start`: Runs the server with production Node.js.

---

## 🌐 Production Deployment

Ready to go live? The codebase is pre-configured for instant zero-friction deployment on any modern platform:

- **Option 1 (Recommended)**: [Vercel (Frontend)](https://vercel.com/) + [Render (Backend)](https://render.com/) — Free tier, global CDN edge performance.
- **Option 2 (Single Service)**: [Render All-in-One](https://render.com/) — Deploy both frontend and backend on one single free Render Web Service using the included `render.yaml`.
- **Option 3 (Containers)**: Deploy anywhere using the included `Dockerfile` and `docker-compose.yml`.

👉 **See the complete step-by-step guide in [DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## 🛡️ Testing Razorpay in Test Mode

When testing payments in the local development environment:
1. Make sure your `RAZORPAY_KEY_ID` begins with `rzp_test_`.
2. When the Razorpay modal opens on the Checkout page:
   - Choose **Netbanking**, **Card**, or **UPI**.
   - For Card: Use Razorpay test card numbers (e.g., `4111 1111 1111` with any future date and CVV `123`).
   - Click **Success** to simulate a successful payment transaction.
3. The cryptographic verification will confirm the payment, clear the cart, and display your completed order in the **Orders** tab.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

Crafted with ❤️ and passion by **[Lovepreet Kaur](https://github.com/love25-codes)**

*Excellence in every pixel. Elegance in every line of code.* ✨

</div>
