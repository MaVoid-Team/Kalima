import React from "react";
import { motion } from "framer-motion";

const KalimaLoader = ({ text, fullScreen = true }) => {
  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-50 bg-white/80 backdrop-blur-md"
          : "w-full h-full min-h-[80vh]"
      } flex items-center justify-center relative overflow-hidden`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Loader Container */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Soft Glow Background */}
          <div className="absolute inset-4 rounded-full blur-[20px] opacity-20 bg-gradient-to-tr from-[#AF0D0E] to-[#FF5C28]" />

          {/* The Elegant Gradient Ring (Luxury) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              padding: "4px", // Thickness of the ring
              background:
                "conic-gradient(from 0deg, transparent 0%, #FF5C28 40%, #AF0D0E 100%)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
            }}
          />

          {/* Central Logo Container */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-32 h-32 flex items-center justify-center"
          >
            <img
              src="/Logo.png"
              alt="Loading..."
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(175,13,14,0.15)]"
            />
          </motion.div>
        </div>

        {/* Text Section (Optional) */}
        {text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-col items-center"
          >
            <h3 className="text-base font-bold text-gray-800 tracking-wider uppercase">
              {text}
            </h3>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#AF0D0E]"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default KalimaLoader;
