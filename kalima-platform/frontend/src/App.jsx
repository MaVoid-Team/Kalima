import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Outlet } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/loading-spinner";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute"; // REPLACED AdminRoute
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
const WizardCheckoutPage = lazy(
  () => import("./pages/checkout/WizardCheckoutPage"),
);
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const FastBuyCheckoutPage = lazy(
  () => import("./pages/checkout/FastBuyCheckoutPage"),
);
const ProductDetailsPage = lazy(
  () => import("./pages/product/ProductDetailsPage"),
);
const BookletDetailsPage = lazy(
  () => import("./pages/booklet/BookletDetailsPage"),
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));

// Admin lazy-loaded pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/dashboard/DashboardPage"));
const OrdersPage = lazy(() => import("./pages/admin/orders/OrdersPage"));
const OrderDetailPage = lazy(
  () => import("./pages/admin/orders/OrderDetailPage"),
);
const ProductsPage = lazy(() => import("./pages/admin/products/ProductsPage"));
const CreateProductPage = lazy(() => import("./pages/admin/products/CreateProductPage"));
const ProductDetailPage = lazy(() => import("./pages/admin/products/ProductDetailPage"));
const EditProductPage = lazy(() => import("./pages/admin/products/EditProductPage"));
const CategoriesPage = lazy(
  () => import("./pages/admin/categories/CategoriesPage"),
);
const UsersPage = lazy(() => import("./pages/admin/users/UsersPage"));
const UserDetailPage = lazy(() => import("./pages/admin/users/UserDetailPage"));
const AdminSamplesPage = lazy(() => import("./pages/admin/samples/AdminSamplesPage"));
const AdminSampleSectionDetailPage = lazy(() => import("./pages/admin/samples/AdminSampleSectionDetailPage"));
const SettingsPage = lazy(() => import("./pages/admin/settings/SettingsPage"))
const PaymentMethodsPage = lazy(() => import("./pages/admin/payment-methods/PaymentMethodsPage"));
const RequiredFieldsPage = lazy(() => import("./pages/admin/required-fields/RequiredFieldsPage"));
const AnalyticsPage = lazy(() => import("./pages/admin/analytics/AnalyticsPage"));
const EmployeePerformancePage = lazy(() => import("./pages/admin/employee-performance/EmployeePerformancePage"));

// Public viewer (no layout)
const SamplePage = lazy(() => import("./pages/sample/SamplePage"));
const SamplesDirectoryPage = lazy(() => import("./pages/sample/SamplesDirectoryPage"));
const SamplePreview = lazy(() => import("./pages/sample/SamplePreviewPage"))
// User lazy-loaded pages
const MyOrdersPage = lazy(() => import("./pages/orders/MyOrdersPage"));

// Teacher lazy-loaded pages
const TeacherLayout = lazy(() => import("./layouts/TeacherLayout"));
const TeacherProfilePage = lazy(() => import("./pages/teacher/profile/TeacherProfilePage"));
const TeacherSettingsPage = lazy(() => import("./pages/teacher/settings/TeacherSettingsPage"));

// Student lazy-loaded pages
const StudentLayout = lazy(() => import("./layouts/StudentLayout"));
const StudentProfilePage = lazy(() => import("./pages/student/profile/StudentProfilePage"));
const StudentSettingsPage = lazy(() => import("./pages/student/settings/StudentSettingsPage"));

// Parent lazy-loaded pages
const ParentLayout = lazy(() => import("./layouts/ParentLayout"));
const ParentProfilePage = lazy(() => import("./pages/parent/profile/ParentProfilePage"));
const ParentSettingsPage = lazy(() => import("./pages/parent/settings/ParentSettingsPage"));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner className="h-8 w-8 text-primary" />
  </div>
);

function Root() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      {/* Public Routes with MainLayout (Navbar & Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        
        {/* Market and Product Routes - Restricted for Students and Parents */}
        <Route element={<RoleRoute excludedRole={["Student", "Parent"]} />}>
          <Route path="/market" element={<MarketPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/booklet/:id" element={<BookletDetailsPage />} />
        </Route>
        {/* Samples Routes - Restricted for Students and Parents */}
        <Route element={<RoleRoute excludedRole={["Student", "Parent"]} />}>
          <Route path="/samples" element={<SamplesDirectoryPage />} />
          <Route path="/samples/:id" element={<SamplePage />} />
          <Route path="/samples/:id/preview" element={<SamplePreview />} />
        </Route>

        {/* Protected Store Routes (Auth Required) - Also Restricted for Students and Parents */}
        <Route element={<RoleRoute excludedRole={["Student", "Parent"]} />}>
          <Route element={<ProtectedRoute requireAuth={true} />}>
            <Route path="/cart" element={<WizardCheckoutPage />} />
            <Route path="/checkout" element={<WizardCheckoutPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route
              path="/fast-buy/checkout"
              element={<FastBuyCheckoutPage />}
            />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* Admin Routes */}
      <Route element={<RoleRoute requiredRole={["Admin", "SubAdmin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/products/create" element={<CreateProductPage />} />
          <Route path="/admin/products/:id" element={<ProductDetailPage />} />
          <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/payment-methods" element={<PaymentMethodsPage />} />
          <Route path="/admin/required-fields" element={<RequiredFieldsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/users/:id" element={<UserDetailPage />} />
          <Route path="/admin/samples" element={<AdminSamplesPage />} />
          <Route path="/admin/samples/:id" element={<AdminSampleSectionDetailPage />} />
          <Route path="/admin/coupons" element={<CouponsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/employee-performance" element={<EmployeePerformancePage />} />
        </Route>
      </Route>

      {/* Teacher Routes */}
      <Route element={<RoleRoute requiredRole={["Teacher"]} />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />
          <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<RoleRoute requiredRole={["Student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/settings" element={<StudentSettingsPage />} />
        </Route>
      </Route>

      {/* Parent Routes */}
      <Route element={<RoleRoute requiredRole={["Parent"]} />}>
        <Route element={<ParentLayout />}>
          <Route path="/parent/profile" element={<ParentProfilePage />} />
          <Route path="/parent/settings" element={<ParentSettingsPage />} />
        </Route>
      </Route>

      {/* Guest-only routes with AuthLayout (No Navbar/Footer) */}
      <Route element={<MainLayout />}>
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
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
