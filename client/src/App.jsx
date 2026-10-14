import React from 'react'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import Wishlist from './components/Wishlist'
import Cart from './components/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import './App.css'

// Redirect fallback that preserves URL search parameters if any undefined path is accessed
function CatchAllRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: '/', search: location.search }} replace />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#060B19] text-slate-100">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Product Store Routes: / , /products , /home all render protected Home component */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />

              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Catch-all route preserving any search query parameters */}
              <Route path="*" element={<CatchAllRedirect />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  )
}

export default App
