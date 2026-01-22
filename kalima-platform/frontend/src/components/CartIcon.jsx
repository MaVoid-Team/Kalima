"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { getCart } from "../routes/cart";
import { isLoggedIn } from "../routes/auth-services";

const CartIcon = () => {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCartCount = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      setItemCount(0);
      setLoading(false);
      return;
    }

    try {
      // Get cart which returns: {"status":"success","data":{"cart":null,"itemCount":0}}
      const cartResult = await getCart();
      if (cartResult.success) {
        // Extract itemCount from response
        const itemCount = cartResult.data?.data?.itemCount || 0;
        setItemCount(itemCount);
      } else {
        setItemCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartCount();

    // Refresh cart count when user logs in/out
    const handleAuthChange = () => {
      fetchCartCount();
    };

    window.addEventListener("user-auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("cart-updated", handleAuthChange);

    // Poll for cart updates every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);

    return () => {
      window.removeEventListener("user-auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("cart-updated", handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  // No longer hiding for guests in this specific design
  // if (!isLoggedIn()) {
  //   return null;
  // }

  return (
    <Link
      to="/cart"
      className="btn btn-ghost btn-circle relative overflow-visible"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#AF0D0E] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
      {loading && itemCount === 0 && (
        <span className="absolute -top-1 -right-1 loading loading-spinner loading-xs"></span>
      )}
    </Link>
  );
};

export default CartIcon;
