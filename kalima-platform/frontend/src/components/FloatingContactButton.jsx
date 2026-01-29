"use client";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingContactButton() {
  return (
    <div className="container">
      <motion.button
        onClick={() =>
          window.open(
            "https://wa.me/+201061165403",
            "_blank",
            "noopener,noreferrer"
          )
        }
        animate={{ y: [0, -8, 0] }}
        transition={{
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
        className="fixed bottom-16 right-8 z-50 flex items-center justify-center w-16 h-16 btn btn-success text-success-content rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <FaWhatsapp className="w-8 h-8" />
      </motion.button>
    </div>
  );
};