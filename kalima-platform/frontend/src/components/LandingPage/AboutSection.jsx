import { GraduationCap, Award, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function AboutSection() {
  const { t } = useTranslation("landing");

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const features = [
    {
      icon: GraduationCap,
      title: t("about.features.interactive.title"),
      description: t("about.features.interactive.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Award,
      title: t("about.features.quality.title"),
      description: t("about.features.quality.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
  ];

  return (
    <section className="w-full bg-background py-12 md:py-24 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 14, 0], y: [0, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-8 h-80 w-80 rounded-full bg-secondary/5 blur-3xl"
          animate={{ x: [0, -14, 0], y: [0, 10, 0], scale: [1.03, 1, 1.03] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-16">
        <motion.div
          className="grid gap-12 lg:gap-20 lg:grid-cols-2 lg:items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
        >
          {/* Image */}
          <motion.div
              animate={{ x: [0, 2, 0], y: [0, -2, 0], z: [0, 5, 0], rotateY: [0, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative hidden w-full lg:block" 
              variants={itemVariants}>
            <motion.div
              className="absolute -top-5 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-background/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-lg backdrop-blur-sm rotate-6"
              animate={{ y: [0, -5, 0], rotate: [6, 4, 6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("about.sparkleBadge", "Top Rated")}</span>
              <TrendingUp className="h-3.5 w-3.5" />
            </motion.div>
            <motion.div className="h-[280px] sm:h-[550px] lg:h-[600px] w-full max-w-[600px] lg:max-w-none mx-auto overflow-hidden rounded-4xl shadow-xl">
              <motion.img
                src={'/about.png'}
                alt={t("about.title")}
                className="h-full w-full object-cover"
                transition={{duration: 1}}
                whileHover={{ scale: 1.02 }}
                />
            </motion.div>
          </motion.div>
          {/* Content */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-tight text-balance">
              {t("about.title")}{" "}
              <span className="text-primary">
                {t("about.titleHighlight")}
              </span>
              <br />
              {t("about.titleEnd")}
            </h2>
            <p className="max-w-[500px] text-muted-foreground text-lg leading-relaxed font-medium text-balance">
              {t("about.description")}
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: 0.08 * index }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}
                    >
                      <feature.icon
                        className={`h-6 w-6 ${feature.iconColor}`}
                        strokeWidth={2}
                      />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
