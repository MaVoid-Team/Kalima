import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";


const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlw9H7wQQUgA8DXqQtNFrwnGBPuTz-1Ewo7aWF0iVtFBNSyYB4kPfW5AfmgGgfdvG2j3MW0DJEWoE5EVU1Q3ZStDaOa7DIhXqlAJY32DP1CL54HpLPsFd7ZFHnnrh6cdfPEtx2fC4tH3W-fefuLxrmJoztJSeHJXOst4PkCuTkUxnCFBDhHGqg2emL3ljLvpxU4GYNoFH-XoFuU3zgvrURKhNq7EK8Lqu5wPFFicjeTgWhdeAWtikKY1p4MsASZ9otVYaimDvQQVM";

const AVATAR_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBn8I_oKLn-hvwTs-Tu5VY0mHK3boizTbH0rbXrAHNxubk_3zTzz1wQnaLPPiJ0B5JKY9Em0YG3TdffbtbR37kCfQBQREfKE0ILFW3eG1lV0XhNAnWk-NEm-MJMNgK5ZmQvL2lsmvFNyjCwPW197ainYNLai3UDnGfhC377DqYOotNctqDhNhrEEZhpjigxFawGP8fLk8gvFI6rhD2_SOpSWtSisrv-UPc4ckNDiq2UPEchSsfMAtg2RahKx0Windd9ksZETyJ1lfo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9IFQlupIKpI0sdhqnpE39-Y77kMrwK5IW40_MftVPHc07yHYAyHrQ1NIRI-uhDnvkP3l1RGopWzYN0hVI_k8YqDmrHpw_ypKgRdqwDwxx7KvMjCg8QpqrwQyQWX5uKdXCCgJc6YwctsWopLosQ4ojQ3j9VsTgjXNSzSMKuVv0DVNyxdlmww9OH7UA9Bj29X15afqpw2kHDcDIiiFxPhVMCXvfd3csg_kKv0SDGy8AGstGNQ9Mmy4g3fhD5Wo5Zwhk78KfaQA-CCw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrdZZV3Gwj47GxMKr1vAzyjHuiVYeaRkDLif1Vhdtp4mzxuVgZb-7HVLapiHDiSxHZ2BWVlqRpHnSwWzhH9TXi2GiE-8Rjwwyj1y_vKKbsYVQObJFQ0SJgY4E360BkqXbc5pgB_qW2TuUjwKmL9Nnlrkwan4p5owJaU9U65Sc2pJ1o1eq6xtH7Wcpi_HsFZSwATTKQBP_n0hiJkPxVdUhAdtteMNZMZzKS1aFEAnaQJD6fc5z6CRqXxRf7y9c5yObFlkNzE_Cqeg",
];

export default function WelcomeSection() {
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

  return (
    <section className="w-full bg-background py-12 md:py-24 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 18, 0], y: [0, 12, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-6 h-80 w-80 rounded-full bg-secondary/5 blur-3xl"
          animate={{ x: [0, -16, 0], y: [0, -10, 0], scale: [1.02, 1, 1.02] }}
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
          <div
            className={`flex flex-col justify-center space-y-8 text-left`}
          >
            <motion.div className="space-y-6" variants={itemVariants}>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl xl:text-7xl leading-tight text-balance text-start">
                {t("welcome.title")}{" "}
                <span
                  className='text-primary text-start'
                >
                  {t("welcome.titleHighlight")}
                </span>{" "}
                {t("welcome.titleEnd")}
              </h1>

              <p className="max-w-[600px] text-start text-muted-foreground leading-relaxed font-medium text-lg text-balance">
                {t("welcome.description")}
              </p>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-4 pt-2 justify-start" variants={itemVariants}>
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/market">
                  <Button variant="default" className="w-full sm:w-fit h-12 text-base" data-testid="landing-welcome-browse-courses-button">
                    {t("welcome.market")}
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/samples">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-fit h-12 text-base"
                    data-testid="landing-welcome-teachers-button"
                  >
                    {t("welcome.samples")}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trusted By */}
            <motion.div className="flex items-center justify-start gap-4 pt-4" variants={itemVariants}>
              <AvatarGroup>
                {AVATAR_IMAGES.map((url, index) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.3, y: 16, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 18,
                      mass: 0.7,
                      delay: 0.09 * index,
                    }}
                    whileHover={{ y: -2, scale: 1.04 }}
                  >
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-background">
                      <AvatarImage src={url} alt="User Avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.35, y: 14, rotate: -8 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 18,
                    mass: 0.7,
                    delay: 0.32,
                  }}
                  whileHover={{ y: -2, scale: 1.03 }}
                >
                  <AvatarGroupCount className="h-10 w-10 sm:h-11 sm:w-11 text-[10px] font-bold border-2 border-background">
                    1.7k+
                  </AvatarGroupCount>
                </motion.div>
              </AvatarGroup>
              <p className="text-sm text-muted-foreground font-semibold">
                {t("welcome.trustedBy")}
              </p>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div 
            animate={{ x: [0, 2, 0], y: [0, -2, 0], z: [0, 5, 0], rotateY: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}  
            className="relative mx-auto w-full max-w-[600px] lg:max-w-none" 
            variants={itemVariants}>
            <motion.div
              className="absolute -top-5 left-3 z-20 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-lg backdrop-blur-sm -rotate-6"
              animate={{ y: [0, -5, 0], rotate: [-6, -4, -6] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("welcome.sparkleBadge", "Fresh Content")}</span>
              <TrendingUp className="h-3.5 w-3.5" />
            </motion.div>
            <div className="relative h-[280px] sm:h-[550px] lg:h-[600px] w-full overflow-hidden rounded-4xl shadow-2xl">
              <motion.img
                className="h-full w-full object-cover"
                src={HERO_IMAGE_URL}
                alt={t("welcome.title")}
                transition={{duration: 1}}
                whileHover={{ scale: 1.02 }}
                />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

