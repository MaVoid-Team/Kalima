import { motion } from "framer-motion";

const KalimaLoader = ({ text, fullScreen = true }) => {
  const containerClass = fullScreen
    ? "fixed inset-0 z-[9999] bg-base-100/80 backdrop-blur-md flex items-center justify-center overflow-hidden"
    : "w-full h-full min-h-screen flex items-center justify-center overflow-hidden";

  return (
    <div className={containerClass}>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Loader Container */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Soft Glow Background */}
          <div className="absolute inset-4 rounded-full blur-[20px] opacity-20 bg-gradient-to-tr from-primary to-secondary" />

          {/* The Elegant Gradient Ring (Luxury) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              padding: "4px",
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(var(--color-secondary)) 40%, rgba(var(--color-primary)) 100%)",
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
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(var(--color-primary),0.15)]"
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
            <h3 className="text-base font-bold text-base-content tracking-wider uppercase">
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
                  className="w-1.5 h-1.5 rounded-full bg-primary"
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
