"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../../../routes/cart";
import { useTranslation } from "react-i18next";

export default function Overlay() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  /** 🛒 Fetch cart count from server */
  const fetchCartCount = async () => {
    try {
      const result = await getCart();
      if (result.success) {
        const itemCount = result.data?.data?.itemCount || 0;
        setCartCount(itemCount);
        if (itemCount === 1 && !localStorage.getItem("overlayShown")) {
          setShowOverlay(true);
          localStorage.setItem("overlayShown", "true");
        }
        if (itemCount === 0) {
          localStorage.removeItem("overlayShown");
          setShowOverlay(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
    }
  };
  //
  useEffect(() => {
    fetchCartCount();
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  useEffect(() => {
    if (location.pathname === "/cart") setShowOverlay(false);
  }, [location.pathname]);

  /** 💬 Show motivational popup every few seconds */
  useEffect(() => {
    if (cartCount > 0) {
      const messages = isRTL
        ? [
          "🛒 لديك منتجات في سلتك!",
          "⏰ أكمل عملية الشراء الآن!",
          "💸 لا تفوّت الفرصة! ادفع الآن!",
        ]
        : [
          "🛒 You have items in your cart!",
          "⏰ Complete your purchase now!",
          "💸 Don’t miss out — pay today!",
        ];

      const interval = setInterval(() => {
        const random = messages[Math.floor(Math.random() * messages.length)];
        setPopupText(random);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [cartCount, isRTL]);

  return (
    <>
      {/* 🛍️ Floating Cart Icon */}
      <motion.div
        onClick={() => navigate("/cart")}
        className="fixed bottom-36 w-16 h-16 rounded-full 
          bg-gradient-to-br from-warning via-warning to-accent
          text-warning-content flex items-center justify-center 
          shadow-lg cursor-pointer z-[60]"
        style={{
          right: "2rem",
          left: "auto",
          direction: "ltr",
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, repeatDelay: 6, duration: 1 }}
      >
        <ShoppingCart size={30} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-error-content text-xs font-bold px-2 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </motion.div>

      {/* 💬 Motivational Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-56 bg-base-100/95 text-warning-content border border-warning shadow-xl
              text-sm font-semibold px-4 py-2 rounded-lg z-[55]"
            style={{
              right: "1.5rem",
              left: "auto",
              direction: "ltr",
            }}
          >
            {popupText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🕶️ Overlay when first product is added */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            dir={isRTL ? "rtl" : "ltr"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 
              backdrop-blur-md flex items-center justify-center z-[70]"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative bg-base-100/95 backdrop-blur-md rounded-3xl p-8 w-[90%] max-w-md text-center 
              shadow-2xl border border-warning/50"
            >
              {/* ❌ Close Button */}
              <button
                onClick={() => setShowOverlay(false)}
                className={`absolute top-4 ${isRTL ? "left-4" : "right-4"
                  } text-base-content/40 hover:text-base-content/70 transition-all duration-200`}
              >
                <X
                  size={30}
                  className="hover:rotate-90 transition-transform duration-300"
                />
              </button>

              {/* 🛒 Icon (Always Centered) */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 10 }}
                className="mx-auto w-20 h-20 flex items-center justify-center 
  rounded-full bg-gradient-to-br from-warning via-warning to-accent shadow-lg"
              >
                <ShoppingCart className="text-warning-content w-10 h-10" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-extrabold text-warning-content mt-4 mb-2 tracking-wide">
                {isRTL
                  ? "🎉 تم إضافة أول منتج إلى السلة"
                  : "🎉 First product added to your cart"}
              </h2>

              {/* Description */}
              <p className="text-base-content/60 mb-6 leading-relaxed text-base">
                {isRTL
                  ? "يمكنك الدفع الآن أو إغلاق النافذة لإضافة المزيد من المنتجات."
                  : "You can pay now or close this window to add more products."}
              </p>

              {/* 💳 Pay Now Button */}
              <motion.button
                onClick={() => navigate("/cart")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-warning via-warning/90 to-warning
                  text-warning-content font-bold text-lg rounded-xl shadow-lg hover:shadow-warning/40 
                  transition-all duration-300"
              >
                {isRTL ? "ادفع الآن" : "Pay Now"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}