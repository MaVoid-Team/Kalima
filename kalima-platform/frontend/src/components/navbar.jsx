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
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const { t, i18n } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const isAr = i18n.language === "ar";
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const fetchUserRole = async () => {
    if (isLoggedIn()) {
      try {
        const result = await getUserDashboard();
        if (result.success) {
          setUserRole(result.data.data.userInfo.role);
          setUserId(result.data.data.userInfo.id);
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
      case "Subadmin":
        return "/dashboard/admin-dashboard";
      case "Assistant":
        return "/dashboard/assistant-dashboard";
      default:
        return "/";
    }
  };

  return (
    <header
      className="sticky top-0 left-0 right-0 z-[100] glass-navbar border-b border-gray-100"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* Right Section (Logo & Store) - RTL */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 rounded-full blur-md group-hover:blur-lg transition-all" />
              <img
                src="/Logo.png"
                alt="Logo"
                className="w-12 h-12 relative z-10"
              />
            </div>
            <span className="text-2xl font-bold font-[family-name:var(--font-headline)] text-gray-900">
              {t("logoText") || "كلمة"}
            </span>
          </Link>

          {/* Store Link - Strict placement next to logo */}
          <Link
            to="/market"
            className="hidden lg:flex items-center gap-2 group/store hover:opacity-80 transition-opacity"
          >
            <div className="bg-gray-100 p-2 rounded-full border border-gray-200 group-hover/store:bg-red-50 group-hover/store:border-red-100 transition-colors">
              <ShoppingBag className="w-4 h-4 text-gray-600 group-hover/store:text-red-600" />
            </div>
            <span className="font-bold text-gray-700 group-hover/store:text-red-700">
              {t("market") || "المتجر"}
            </span>
          </Link>

          {/* User Dashboard Link if Logged In */}
          {userRole && (
            <div className="hidden lg:flex">
              <Link
                to={getDashboardPath(userRole)}
                className="btn btn-ghost rounded-2xl gap-2 font-bold hover:bg-red-50 text-gray-700"
              >
                <Layout className="w-5 h-5 text-[#AF0D0E]" />
                <span>{t("dashboard")}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Left Section (Actions) - RTL */}
        <div className="hidden lg:flex items-center gap-2">
          {userRole ? (
            /* Logged In Actions */
            <div className="flex items-center gap-3">
              {["Admin", "SubAdmin", "Moderator", "Assistant"].includes(
                userRole
              ) && <MonthlyCounter />}
              {["Student", "Parent", "Teacher"].includes(userRole) && (
                <Link
                  to="/my-orders"
                  className="btn btn-ghost btn-sm rounded-xl gap-2 text-gray-700 hover:text-[#AF0D0E]"
                  title={isAr ? "طلباتي" : "My Orders"}
                >
                  <Receipt className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {isAr ? "طلباتي" : "My Orders"}
                  </span>
                </Link>
              )}
              {userId && <NotificationCenter userId={userId} />}
              <button
                onClick={handleLogout}
                className="btn btn-ghost rounded-xl gap-2 text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>{t("logout")}</span>
              </button>
            </div>
          ) : (
            /* Guest Actions - Reordered: Cart -> Lang -> Login -> Register */
            <div className="flex items-center gap-1 xl:gap-4">
              {/* Cart Icon */}
              <div className="relative p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <CartIcon />
              </div>

              {/* Language Switcher */}
              <div className="p-0.5 px-2 bg-gray-50 rounded-2xl border border-gray-100/50">
                <LanguageSwitcher />
              </div>

              {/* Login Link - Ghost */}
              <Link
                to="/login"
                className="btn btn-ghost rounded-2xl gap-2 text-gray-700 font-bold hover:bg-red-50 flex items-center"
              >
                <LogIn className="w-5 h-5 opacity-70" />
                <span>{t("signin") || "تسجيل الدخول"}</span>
              </Link>

              {/* Register Button - Gradient */}
              <Link
                to="/register"
                className="btn h-auto py-2.5 px-6 rounded-2xl text-white font-bold border-none shadow-lg shadow-red-900/10 hover:shadow-red-900/20 active:scale-[0.98] transition-all bg-gradient-to-l from-[#AF0D0E] to-[#FF5C28]"
              >
                <UserPlus className="w-5 h-5" />
                <span>{t("signup") || "التسجيل"}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <CartIcon />
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-[110] transition-all">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: isAr ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? 300 : -300 }}
              className={`absolute top-0 bottom-0 w-80 bg-white shadow-2xl ${
                isAr ? "right-0" : "left-0"
              }`}
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <img src="/Logo.png" alt="Logo" className="w-12 h-12" />
                  <button onClick={() => setMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/market"
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 font-bold"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShoppingBag className="w-6 h-6 text-red-600" />
                    <span>{t("market") || "المتجر"}</span>
                  </Link>
                  {userRole && (
                    <Link
                      to={getDashboardPath(userRole)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 font-bold"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Layout className="w-6 h-6 text-red-600" />
                      <span>{t("dashboard")}</span>
                    </Link>
                  )}
                  <div className="p-4">
                    <LanguageSwitcher />
                  </div>
                </div>

                <div className="pt-8 border-t space-y-4">
                  {userRole ? (
                    <button
                      onClick={handleLogout}
                      className="btn btn-error w-full rounded-2xl text-white font-bold"
                    >
                      {t("logout")}
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="btn w-full h-auto py-4 rounded-2xl bg-gradient-to-r from-[#AF0D0E] to-[#FF5C28] text-white border-none font-bold"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t("signup")}
                      </Link>
                      <Link
                        to="/login"
                        className="btn btn-outline w-full h-auto py-4 rounded-2xl font-bold"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t("signin")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
