import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationCenter from "./NotificationCenter";
import CartIcon from "./CartIcon";
import MonthlyCounter from "./MonthlyCounter";
import {
  isLoggedIn,
  getUserDashboard,
  logoutUser,
} from "../routes/auth-services";
import {
  ShoppingBag,
  LogIn,
  UserPlus,
  Layout,
  Receipt,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Home,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const { t, i18n } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const isAr = i18n.language === "ar";
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUserRole = async () => {
    if (isLoggedIn()) {
      try {
        const result = await getUserDashboard();
        if (result.success) {
          // Handle different response structures
          const userInfo =
            result.data?.data?.userInfo ||
            result.data?.userInfo ||
            result.data ||
            {};
          setUserRole(userInfo.role || null);
          setUserId(userInfo.id || null);
        } else {
          setUserRole(null);
          setUserId(null);
        }
      } catch (err) {
        setUserRole(null);
        setUserId(null);
        console.error(err);
      }
    } else {
      setUserRole(null);
      setUserId(null);
    }
  };

  useEffect(() => {
    fetchUserRole();
    const handleCustomAuthChange = () => fetchUserRole();
    window.addEventListener("storage", fetchUserRole);
    window.addEventListener("user-auth-changed", handleCustomAuthChange);
    return () => {
      window.removeEventListener("storage", fetchUserRole);
      window.removeEventListener("user-auth-changed", handleCustomAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserRole(null);
      setUserId(null);
      setMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "Student":
      case "Parent":
      case "Teacher":
        return "/dashboard/student-dashboard/promo-codes";
      case "Lecturer":
        return "/dashboard/lecturer-dashboard";
      case "Admin":
      case "Moderator":
      case "SubAdmin":
        return "/dashboard/admin-dashboard";
      case "Assistant":
        return "/dashboard/assistant-dashboard";
      default:
        return "/";
    }
  };

  return (
    <>
      <header
        ref={navbarRef}
        className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? "bg-base-100/95 backdrop-blur-sm shadow-lg shadow-base-200/50 "
          : "bg-base-100/80 backdrop-blur-sm"
          }`}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="container mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* Logo & Primary Navigation */}
            <div className="flex items-center gap-6 lg:gap-10">
              {/* Premium Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  {/* Animated glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur-xl"
                  />
                  <div className="relative w-12 h-12 rounded-2xl  flex items-center justify-center overflow-hidden group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                    <img
                      src="/Logo.png"
                      alt="Logo"
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </motion.div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-black bg-gradient-to-r from-base-content via-base-content/80 to-base-content bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                    {t("logoText") || "كلمة"}
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-2">
                {/* Store Link */}
                <Link
                  to="/market"
                  className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-base-content/70 hover:text-primary transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 rounded-xl transition-all duration-300" />
                  <div className="relative w-9 h-9 rounded-xl bg-base-200 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-secondary/10 flex items-center justify-center transition-all duration-300">
                    <ShoppingBag className="w-4.5 h-4.5 text-base-content/60 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="relative">{t("market") || "المتجر"}</span>
                </Link>

                {/* Dashboard Link */}
                {userRole && (
                  <Link
                    to={getDashboardPath(userRole)}
                    className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-base-content/70 hover:text-primary transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 rounded-xl transition-all duration-300" />
                    <div className="relative w-9 h-9 rounded-xl bg-base-200 group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-secondary/10 flex items-center justify-center transition-all duration-300">
                      <Layout className="w-4.5 h-4.5 text-base-content/60 group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <span className="relative">{t("dashboard")}</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Action Items */}
            <div className="hidden lg:flex items-center gap-3">
              {userRole ? (
                /* Logged In Actions */
                <div className="flex items-center gap-2">
                  {["Admin", "SubAdmin", "Moderator", "Assistant"].includes(
                    userRole,
                  ) && <MonthlyCounter />}

                  {["Student", "Parent", "Teacher"].includes(userRole) && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/my-orders"
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-base-content/70 hover:text-primary font-medium transition-all duration-300 hover:bg-base-200"
                        title={isAr ? "طلباتي" : "My Orders"}
                      >
                        <Receipt className="w-5 h-5" />
                        <span className="hidden xl:inline">
                          {isAr ? "طلباتي" : "My Orders"}
                        </span>
                      </Link>
                    </motion.div>
                  )}

                  {/* Cart Icon */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-xl hover:bg-base-200 transition-colors cursor-pointer"
                  >
                    <CartIcon />
                  </motion.div>

                  {/* Notifications */}
                  {userId && <NotificationCenter userId={userId} />}

                  {/* Divider */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-base-300 to-transparent mx-1" />

                  {/* Language Switcher */}
                  <div className="p-1 px-2 bg-base-200 rounded-xl border border-base-300 hover:border-base-CONTENT/20 transition-colors">
                    <LanguageSwitcher />
                  </div>

                  {/* Logout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-base-content/70 hover:text-primary font-medium transition-all duration-300 hover:bg-error/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("logout")}</span>
                  </motion.button>
                </div>
              ) : (
                /* Guest Actions */
                <div className="flex items-center gap-3">
                  {/* Cart Icon */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-xl hover:bg-base-200 transition-colors cursor-pointer"
                  >
                    <CartIcon />
                  </motion.div>

                  {/* Language Switcher */}
                  <div className="p-1 px-2 bg-base-200 rounded-xl border border-base-300 hover:border-base-content/20 transition-colors">
                    <LanguageSwitcher />
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-base-300 to-transparent" />

                  {/* Login Link */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/login"
                      className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-base-content font-semibold hover:text-primary hover:bg-primary/5 transition-all duration-300"
                    >
                      <LogIn className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                      <span>{t("signin") || "تسجيل الدخول"}</span>
                    </Link>
                  </motion.div>

                  {/* Register Button - Premium Gradient */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 10px 30px rgba(175, 13, 14, 0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/register"
                      className="group relative flex items-center gap-2 px-6 py-3 rounded-xl text-primary-content font-bold overflow-hidden"
                    >
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {/* Content */}
                      <UserPlus className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">
                        {t("signup") || "التسجيل"}
                      </span>
                      <Sparkles className="w-4 h-4 relative z-10 opacity-70" />
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CartIcon />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-11 h-11 rounded-xl bg-base-200 hover:bg-base-300 flex items-center justify-center transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-base-content" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-base-content" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-[110]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-neutral/50"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: isAr ? 320 : -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isAr ? 320 : -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute top-0 bottom-0 w-[85%] max-w-[320px] bg-base-100 shadow-2xl ${isAr ? "right-0" : "left-0"
                }`}
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Drawer Header */}
              <div className="relative p-6 border-b border-base-200">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />

                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-base-200 to-base-100 shadow-lg border border-base-200 flex items-center justify-center">
                      <img src="/Logo.png" alt="Logo" className="w-9 h-9" />
                    </div>
                    <span className="text-xl font-black text-base-content">
                      {t("logoText") || "كلمة"}
                    </span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-base-200 hover:bg-base-300 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-base-content/60" />
                  </motion.button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-180px)]">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider px-2 mb-3">
                    {isAr ? "التنقل" : "Navigation"}
                  </p>

                  <motion.div
                    whileHover={{ x: isAr ? -5 : 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/"
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-base-200 hover:to-transparent font-semibold text-base-content hover:text-primary transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center">
                        <Home className="w-5 h-5 text-base-content/50" />
                      </div>
                      <span>{isAr ? "الرئيسية" : "Home"}</span>
                      <ChevronRight
                        className={`w-5 h-5 text-base-content/30 ${isAr ? "mr-auto rotate-180" : "ml-auto"}`}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: isAr ? -5 : 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/market"
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent font-semibold text-base-content hover:text-primary transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <span>{t("market") || "المتجر"}</span>
                      <ChevronRight
                        className={`w-5 h-5 text-base-content/30 ${isAr ? "mr-auto rotate-180" : "ml-auto"}`}
                      />
                    </Link>
                  </motion.div>

                  {userRole && (
                    <motion.div
                      whileHover={{ x: isAr ? -5 : 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={getDashboardPath(userRole)}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent font-semibold text-base-content hover:text-primary transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <Layout className="w-5 h-5 text-primary" />
                        </div>
                        <span>{t("dashboard")}</span>
                        <ChevronRight
                          className={`w-5 h-5 text-base-content/30 ${isAr ? "mr-auto rotate-180" : "ml-auto"}`}
                        />
                      </Link>
                    </motion.div>
                  )}

                  {["Student", "Parent", "Teacher"].includes(userRole) && (
                    <motion.div
                      whileHover={{ x: isAr ? -5 : 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-base-200 hover:to-transparent font-semibold text-base-content hover:text-primary transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-base-content/50" />
                        </div>
                        <span>{isAr ? "طلباتي" : "My Orders"}</span>
                        <ChevronRight
                          className={`w-5 h-5 text-base-content/30 ${isAr ? "mr-auto rotate-180" : "ml-auto"}`}
                        />
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Settings Section */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider px-2 mb-3">
                    {isAr ? "الإعدادات" : "Settings"}
                  </p>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-base-200">
                    <div className="w-11 h-11 rounded-xl bg-base-100 border border-base-content/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-base-content/50" />
                    </div>
                    <div className="flex-1">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-base-200 bg-base-100">
                {userRole ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-bold hover:from-primary/20 hover:to-secondary/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("logout")}</span>
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-content font-bold shadow-lg shadow-primary/20"
                        onClick={() => setMenuOpen(false)}
                      >
                        <UserPlus className="w-5 h-5" />
                        <span>{t("signup") || "التسجيل"}</span>
                        <Sparkles className="w-4 h-4 opacity-70" />
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-base-200 text-base-content font-bold hover:border-primary/30 hover:text-primary transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5" />
                        <span>{t("signin") || "تسجيل الدخول"}</span>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
