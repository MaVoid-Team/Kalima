import { memo } from "react";
import { motion } from "framer-motion";

function LoginAnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 isolate overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 22, 0], scale: [1, 1.16, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 8.5, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
        animate={{ x: [0, -26, 0], y: [0, -18, 0], scale: [1.04, 1.22, 1.04], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 9.5, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-168 w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.16, 0.4, 0.16] }}
        transition={{ duration: 7.5, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute -left-72 -top-72 h-144 w-xl rounded-full border border-primary/20"
          initial={{ scale: 0.16, opacity: 0 }}
          animate={{ rotate: [0, 360], scale: [0.98, 1.06, 0.98], opacity: [0.5, 0.95, 0.5] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-48 -top-48 h-96 w-96 rounded-full border border-accent/25"
          initial={{ scale: 0.14, opacity: 0 }}
          animate={{ rotate: [360, 0], scale: [1, 1.08, 1], opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-28 -top-28 h-56 w-56 rounded-full border border-primary/20"
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ rotate: [0, 360], scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8.5, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-linear-to-br from-primary/30 via-accent/25 to-primary/10 blur-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      <motion.div
        className="absolute left-[20%] top-[22%] h-2.5 w-2.5 rounded-full bg-primary/45"
        animate={{ y: [0, -18, 0], x: [0, 14, 0], scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[22%] top-[30%] h-2 w-2 rounded-full bg-accent/50"
        animate={{ y: [0, 16, 0], x: [0, -12, 0], scale: [1, 1.35, 1], opacity: [0.25, 0.95, 0.25] }}
        transition={{ duration: 5.2, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[30%] bottom-[24%] h-2.5 w-2.5 rounded-full bg-primary/35"
        animate={{ y: [0, 14, 0], x: [0, -10, 0], scale: [1, 1.3, 1], opacity: [0.25, 0.85, 0.25] }}
        transition={{ duration: 5.7, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[36%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-accent/55"
        animate={{ y: [0, -16, 0], x: [0, 10, 0], opacity: [0.2, 0.9, 0.2] }}
        transition={{ duration: 4.9, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[42%] top-[18%] h-1.5 w-1.5 rounded-full bg-primary/55"
        animate={{ y: [0, 14, 0], x: [0, -11, 0], opacity: [0.2, 0.88, 0.2] }}
        transition={{ duration: 5.4, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[12%] top-[34%] h-2 w-2 rounded-full bg-accent/45"
        animate={{ y: [0, -12, 0], x: [0, 9, 0], scale: [1, 1.28, 1], opacity: [0.2, 0.85, 0.2] }}
        transition={{ duration: 5.6, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[17%] bottom-[16%] h-1.5 w-1.5 rounded-full bg-primary/50"
        animate={{ y: [0, 13, 0], x: [0, -9, 0], opacity: [0.18, 0.8, 0.18] }}
        transition={{ duration: 5.1, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[14%] top-[20%] h-2.5 w-2.5 rounded-full bg-primary/40"
        animate={{ y: [0, -15, 0], x: [0, -12, 0], scale: [1, 1.35, 1], opacity: [0.22, 0.9, 0.22] }}
        transition={{ duration: 6.2, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[9%] bottom-[28%] h-2 w-2 rounded-full bg-accent/55"
        animate={{ y: [0, 11, 0], x: [0, 10, 0], opacity: [0.2, 0.84, 0.2] }}
        transition={{ duration: 5.3, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[52%] top-[12%] h-1.5 w-1.5 rounded-full bg-primary/60"
        animate={{ y: [0, 10, 0], x: [0, 8, 0], opacity: [0.2, 0.86, 0.2] }}
        transition={{ duration: 4.7, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[62%] bottom-[14%] h-2.5 w-2.5 rounded-full bg-accent/45"
        animate={{ y: [0, -14, 0], x: [0, -8, 0], scale: [1, 1.32, 1], opacity: [0.18, 0.82, 0.18] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[74%] top-[42%] h-1.5 w-1.5 rounded-full bg-primary/55"
        animate={{ y: [0, 12, 0], x: [0, -10, 0], opacity: [0.2, 0.88, 0.2] }}
        transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute left-[36%] bottom-[10%] h-2 w-2 rounded-full bg-accent/50"
        animate={{ y: [0, -11, 0], x: [0, 9, 0], opacity: [0.18, 0.8, 0.18] }}
        transition={{ duration: 5.8, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.div
        className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/10"
        animate={{ opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default memo(LoginAnimatedBackground);
