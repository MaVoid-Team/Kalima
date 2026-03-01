import { Smartphone, Download, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const APP_IMAGE_URL = "/app-download.png";

export default function AppDownloadSection() {
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
      icon: Smartphone,
      title: t("appDownload.features.anywhere.title"),
      description: t("appDownload.features.anywhere.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Download,
      title: t("appDownload.features.offline.title"),
      description: t("appDownload.features.offline.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
  ];

  return (
    <section className="w-full bg-background py-12 md:py-24 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-8 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 15, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-8 bottom-8 h-80 w-80 rounded-full bg-secondary/5 blur-3xl"
          animate={{ x: [0, -15, 0], y: [0, -10, 0], scale: [1.02, 1, 1.02] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
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

          {/* Content */}
          <motion.div className="space-y-8 order-2 lg:order-0" variants={itemVariants}>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-tight text-balance">
              {t("appDownload.title")}{" "}
              <span className="text-primary">
                {t("appDownload.titleHighlight")}
              </span>
              <br />
              {t("appDownload.titleEnd")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium text-balance">
              {t("appDownload.description")}
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 pt-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: 0.08 * index }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}
                    >
                      <feature.icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`}
                        strokeWidth={2}
                      />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-foreground">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Download Button */}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button variant="default" size="lg" className="w-full sm:w-fit gap-3 h-11 sm:h-12 text-base" data-testid="landing-app-download-button">
                <Download className="h-5 w-5" />
                {t("appDownload.downloadButton")}
              </Button>
            </motion.div>
          </motion.div>
          {/* Image */}
          <motion.div
            animate={{ x: [0, 2, 0], y: [0, -2, 0], z: [0, 5, 0], rotateY: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}  
            className="relative w-full order-1 lg:order-0" 
            variants={itemVariants}>
            <motion.div
              className="absolute -top-5 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-lg backdrop-blur-sm -rotate-3"
              animate={{ y: [0, -5, 0], rotate: [-3, -1, -3] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("appDownload.sparkleBadge", "Download Ready")}</span>
              <TrendingUp className="h-3.5 w-3.5" />
            </motion.div>
            <div className="h-[280px] sm:h-[550px] lg:h-[600px] w-full max-w-[600px] lg:max-w-none mx-auto overflow-hidden rounded-4xl shadow-xl">
              <motion.img
                src={APP_IMAGE_URL}
                alt={t("appDownload.title")}
                className="h-full w-full object-cover"
                transition={{duration: 1}}
                whileHover={{ scale: 1.02 }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
