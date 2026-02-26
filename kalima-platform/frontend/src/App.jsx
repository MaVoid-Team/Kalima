import { Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/loading-spinner";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./layouts/MainLayout";
import CouponsPage from "./pages/admin/coupons/CouponsPage";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const MarketPage = lazy(() => import("./pages/market/MarketPage"));
const WizardCheckoutPage = lazy(() => import("./pages/checkout/WizardCheckoutPage"));
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const FastBuyCheckoutPage = lazy(() => import("./pages/checkout/FastBuyCheckoutPage"));
const ProductDetailsPage = lazy(() => import("./pages/product/ProductDetailsPage"));
const BookletDetailsPage = lazy(() => import("./pages/booklet/BookletDetailsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));

// Admin lazy-loaded pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const OrdersPage = lazy(() => import("./pages/admin/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/admin/orders/OrderDetailPage"));
const ProductsPage = lazy(() => import("./pages/admin/products/ProductsPage"));
const CreateProductPage = lazy(() => import("./pages/admin/products/CreateProductPage"));
const ProductDetailPage = lazy(() => import("./pages/admin/products/ProductDetailPage"));
const EditProductPage = lazy(() => import("./pages/admin/products/EditProductPage"));
const UsersPage = lazy(() => import("./pages/admin/users/UsersPage"));
const UserDetailPage = lazy(() => import("./pages/admin/users/UserDetailPage"));
const AdminSamplesPage = lazy(() => import("./pages/admin/samples/AdminSamplesPage"));

// Public viewer (no layout)
const SamplePage = lazy(() => import("./pages/sample/SamplePage"));
const SamplesDirectoryPage = lazy(() => import("./pages/sample/SamplesDirectoryPage"));


// User lazy-loaded pages
const MyOrdersPage = lazy(() => import("./pages/orders/MyOrdersPage"));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner className="h-8 w-8 text-primary" />
  </div>
);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes with MainLayout (Navbar & Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/samples" element={<SamplesDirectoryPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/booklet/:id" element={<BookletDetailsPage />} />

            {/* Protected Routes inside MainLayout */}
            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route path="/cart" element={<WizardCheckoutPage />} />
              <Route path="/checkout" element={<WizardCheckoutPage />} />
              <Route path="/orders" element={<MyOrdersPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/fast-buy/checkout" element={<FastBuyCheckoutPage />} />
            </Route >

            {/* 404 Fallback */}
            < Route path="*" element={< NotFoundPage />} />
          </Route >

          {/* Admin Routes */}
          < Route element={< AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/orders" element={<OrdersPage />} />
              <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/products/create" element={<CreateProductPage />} />
              <Route path="/admin/products/:id" element={<ProductDetailPage />} />
              <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/:id" element={<UserDetailPage />} />
              <Route path="/admin/samples" element={<AdminSamplesPage />} />
              <Route path="/admin/coupons" element={<CouponsPage />} />
            </Route>
          </Route >

          {/* Public sample viewer — standalone, no MainLayout, no auth */}
          <Route path="/samples/:id" element={<SamplePage />} />

          {/* Guest-only routes with AuthLayout (No Navbar/Footer) */}
          < Route element={< MainLayout />}>
            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/auth/reset-password"
                element={<ResetPasswordPage />}
              />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            </Route>
          </Route >
        </Routes >
      </Suspense >
    </ErrorBoundary >
  );
}

export default App;
