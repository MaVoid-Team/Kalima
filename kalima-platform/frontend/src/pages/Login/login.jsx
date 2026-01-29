import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import WaveBackground from "./WaveBackground";
import { loginUser, getUserDashboard } from "../../routes/auth-services";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
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
            // If there's a redirect URL, go back to that page
            if (redirectTo) {
              navigate(redirectTo);
              return;
            }

            const userRole = dashboardResult.data.data.userInfo.role;

            // Redirect based on user role
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credentials = {
        password: formData.password,
      };

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
      window.dispatchEvent(new Event('user-auth-changed'));

      // If there's a redirect URL saved, go back to that page
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      // Otherwise, redirect based on user role
      const userRole = dashboardResult.data.data.userInfo.role;
      if (userRole === "Admin" || userRole === "SubAdmin" || userRole === "Moderator") {
        navigate("/dashboard/admin-dashboard");
      } else if (userRole === "Lecturer") {
        navigate("/dashboard/lecturer-dashboard");
      } else if (userRole === "Student" || userRole === "Teacher" || userRole === "Parent") {
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
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-base-200"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <WaveBackground />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-4"
      >
        {/* CRIMSON CAP CARD */}
        <div className="card bg-base-100 shadow-[0_30px_60px_-15px_rgba(var(--color-primary),0.2)] overflow-hidden border border-base-200">
          {/* The Crimson Header (Distinctive "White on Red") */}
          <div className="bg-gradient-to-br from-primary to-secondary p-8 pb-8 relative text-primary-content">
            {/* Abstract Pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="flex justify-between items-start relative z-10">
              <div>
                <h1 className="text-3xl font-black mb-1 drop-shadow-md">
                  {t("loginNow", "Welcome Back")}
                </h1>
                <p className="font-medium text-primary-content/80 text-sm">
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
          <div className="p-8 pt-6 relative z-10 bg-base-100">
            {/* Tabs */}
            <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl mb-6 border border-base-300">
              <button
                className={`tab flex-1 rounded-lg transition-all duration-200 font-bold text-sm h-10 ${activeTab === "email_tab"
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
                  }`}
                onClick={() => setActiveTab("email_tab")}
              >
                {t("emailTab", "Email")}
              </button>
              <button
                className={`tab flex-1 rounded-lg transition-all duration-200 font-bold text-sm h-10 ${activeTab === "phone_tab"
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
                  }`}
                onClick={() => setActiveTab("phone_tab")}
              >
                {t("phoneTab", "Phone")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "email_tab" ? (
                <div className="form-control">
                  <label className="text-xs font-bold text-base-content uppercase tracking-wide mb-1.5 ml-1">
                    {t("emailLabel", "Email Address")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered input-primary w-full h-14 rounded-2xl bg-base-200 focus:bg-base-100 font-bold text-base-content"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              ) : (
                <div className="form-control">
                  <label className="text-xs font-bold text-base-content uppercase tracking-wide mb-1.5 ml-1">
                    {t("phoneLabel", "Phone Number")}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="input input-bordered input-primary w-full h-14 rounded-2xl bg-base-200 focus:bg-base-100 font-bold text-base-content"
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-base-content uppercase tracking-wide mb-1.5 ml-1 block">
                  {t("passwordLabel", "Password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input input-bordered input-primary w-full h-14 rounded-2xl bg-base-200 focus:bg-base-100 font-bold text-base-content ${isRTL ? "pr-5 pl-12" : "pl-5 pr-12"
                      }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-4" : "right-4"
                      } text-base-content/40 hover:text-error transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center justify-center`}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="label">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary hover:text-primary-focus transition-colors"
                >
                  {t("forgotPassword", "Forgot password?")}
                </Link>
              </label>

              {error && (
                <div className="alert alert-error text-error-content p-3 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md">
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
                className={`btn btn-primary w-full h-14 rounded-2xl text-lg font-bold tracking-wide shadow-xl shadow-primary/30 hover:shadow-primary/40 text-primary-content ${loading ? "loading" : ""
                  }`}
                disabled={loading}
              >
                {/* Sheen Effect */}
                <div className="absolute inset-0 bg-base-100/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl" />

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
                  <div className="w-full border-t border-base-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-base-100 px-2 text-base-content/40 font-bold tracking-wider">
                    {t("or", "OR")}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-base-content/60 text-sm font-medium">
                  {t("needAccount", "New to Kalima?")}{" "}
                  <Link
                    to={
                      redirectTo
                        ? `/register?redirect=${encodeURIComponent(redirectTo)}`
                        : "/register"
                    }
                    className="text-primary font-black hover:text-primary-focus hover:underline transition-colors decoration-2 underline-offset-4"
                  >
                    {t("register", "Create Account")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div >
      </motion.div >
    </div >
  );
};

export default TeacherLogin;
