import { memo } from "react";
import { motion } from "framer-motion";

function AuthAnimatedBackground({ variant = "login" }) {
  const gradientClass = variant === "register"
    ? "from-secondary/20 via-primary/10 to-accent/20"
    : "from-primary/20 via-accent/10 to-secondary/20";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute inset-0 bg-linear-to-br ${gradientClass}`} />

      {[...Array(12)].map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute h-2 w-2 rounded-full bg-primary/40"
          style={{ left: `${8 + index * 8}%`, top: `${12 + (index % 4) * 20}%` }}
          animate={{ y: [0, -18, 0], opacity: [0.25, 0.8, 0.25], scale: [1, 1.3, 1] }}
          transition={{ duration: 5 + (index % 4), repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
        />
      ))}

      <motion.div
        className="absolute start-[-10%] top-[10%] h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 35, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute end-[-8%] bottom-[8%] h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default memo(AuthAnimatedBackground);
