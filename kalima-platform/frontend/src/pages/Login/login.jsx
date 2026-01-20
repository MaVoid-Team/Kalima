import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OrbitalBackground from "./OrbitalBackground";
import { loginUser, getUserDashboard } from "../../routes/auth-services";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getAccessToken } from "../../utils/useLocalStroage";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { t, i18n } = useTranslation("login");
  const isRTL = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("email_tab");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const accessToken = getAccessToken();

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (accessToken) {
        try {
          const dashboardResult = await getUserDashboard();
          if (dashboardResult.success) {
            if (redirectTo) {
              navigate(redirectTo);
              return;
            }
            const userRole = dashboardResult.data.data.userInfo.role;
            if (userRole === "Admin" || userRole === "SubAdmin") {
              navigate("/dashboard/admin-dashboard");
            } else if (userRole === "Lecturer") {
              navigate("/dashboard/lecturer-dashboard");
            } else if (userRole === "Student" || userRole === "Teacher") {
              navigate("/dashboard/student-dashboard/promo-codes");
            } else if (userRole === "Assistant") {
              navigate("/dashboard/assistant-page");
            }
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
          navigate("/login");
        }
      }
    };
    checkAuthStatus();
  }, [accessToken, navigate, redirectTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credentials = { password: formData.password };
      if (activeTab === "email_tab") {
        credentials.email = formData.email;
      } else {
        credentials.phoneNumber = formData.phoneNumber;
      }

      const loginResult = await loginUser(credentials);
      if (!loginResult.success) {
        setError(t("errors.invalidCredentials"));
        return;
      }

      const dashboardResult = await getUserDashboard();
      if (!dashboardResult.success) {
        setError(t("errors.fetchUserDataError"));
        return;
      }
      window.dispatchEvent(new Event("user-auth-changed"));

      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      const userRole = dashboardResult.data.data.userInfo.role;
      if (
        userRole === "Admin" ||
        userRole === "SubAdmin" ||
        userRole === "Moderator"
      ) {
        navigate("/dashboard/admin-dashboard");
      } else if (userRole === "Lecturer") {
        navigate("/dashboard/lecturer-dashboard");
      } else if (
        userRole === "Student" ||
        userRole === "Teacher" ||
        userRole === "Parent"
      ) {
        navigate("/dashboard/student-dashboard/promo-codes");
      } else if (userRole === "Assistant") {
        navigate("/dashboard/assistant-page");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || t("errors.generalError");
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <OrbitalBackground />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-4"
      >
        {/* CRIMSON CAP CARD */}
        <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(220,38,38,0.2)] overflow-hidden border border-gray-100/10">
          {/* The Crimson Header (Distinctive "White on Red") */}
          <div className="bg-gradient-to-br from-[#991b1b] to-[#ef4444] p-8 pb-8 relative text-white">
            {/* Abstract Pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="flex justify-between items-start relative z-10">
              <div>
                <h1 className="text-3xl font-black mb-1 drop-shadow-md">
                  {t("loginNow", "Welcome Back")}
                </h1>
                <p className="font-medium text-red-100 text-sm">
                  {isRTL
                    ? "سجل دخولك إلى المنصة التعليمية"
                    : "Sign in to your account"}
                </p>
              </div>
              <img
                src="/Logo.png"
                alt="Kalima"
                className="h-12 w-auto brightness-0 invert opacity-80"
              />
            </div>
          </div>

          {/* The Body (Seamless flow) */}
          <div className="p-8 pt-6 relative z-10 bg-white">
            {/* Tabs */}
            <div className="tabs tabs-boxed bg-gray-50 p-1 rounded-xl mb-6 border border-gray-100">
              <button
                className={`tab flex-1 rounded-lg transition-all duration-200 font-bold text-sm h-10 ${
                  activeTab === "email_tab"
                    ? "bg-white text-[#b91c1c] shadow-sm ring-1 ring-black/5"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setActiveTab("email_tab")}
              >
                {t("emailTab", "Email")}
              </button>
              <button
                className={`tab flex-1 rounded-lg transition-all duration-200 font-bold text-sm h-10 ${
                  activeTab === "phone_tab"
                    ? "bg-white text-[#b91c1c] shadow-sm ring-1 ring-black/5"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setActiveTab("phone_tab")}
              >
                {t("phoneTab", "Phone")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "email_tab" ? (
                <div className="form-control">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">
                    {t("emailLabel", "Email Address")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50/50 border border-gray-100 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 rounded-2xl transition-all font-bold h-14 text-gray-800 px-5 placeholder:text-gray-400 placeholder:font-normal outline-none shadow-sm hover:bg-white hover:shadow-md hover:border-red-100"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              ) : (
                <div className="form-control">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">
                    {t("phoneLabel", "Phone Number")}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50/50 border border-gray-100 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 rounded-2xl transition-all font-bold h-14 text-gray-800 px-5 placeholder:text-gray-400 placeholder:font-normal outline-none shadow-sm hover:bg-white hover:shadow-md hover:border-red-100"
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1 block">
                  {t("passwordLabel", "Password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-50/50 border border-gray-100 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 rounded-2xl transition-all font-bold h-14 text-gray-800 px-5 placeholder:text-gray-400 placeholder:font-normal outline-none shadow-sm hover:bg-white hover:shadow-md hover:border-red-100 ${
                      isRTL ? "pr-5 pl-12" : "pl-5 pr-12"
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRTL ? "left-4" : "right-4"
                    } text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center justify-center`}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  {t("forgotPassword", "Forgot password?")}
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm font-bold border border-red-100">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444] hover:bg-gradient-to-br text-white h-14 rounded-2xl text-lg font-bold tracking-wide shadow-xl shadow-red-500/30 hover:shadow-red-600/40 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group ${
                  loading ? "loading" : ""
                }`}
                disabled={loading}
              >
                {/* Sheen Effect */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl" />

                {loading ? (
                  t("loggingIn", "Logging in...")
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    {t("login", "Sign In")}
                    {!isRTL ? (
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    ) : (
                      <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                      />
                    )}
                  </span>
                )}
              </button>

              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold tracking-wider">
                    {t("or", "OR")}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-gray-500 text-sm font-medium">
                  {t("needAccount", "New to Kalima?")}{" "}
                  <Link
                    to={
                      redirectTo
                        ? `/register?redirect=${encodeURIComponent(redirectTo)}`
                        : "/register"
                    }
                    className="text-red-600 font-black hover:text-red-700 hover:underline transition-colors decoration-2 underline-offset-4"
                  >
                    {t("register", "Create Account")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherLogin;
