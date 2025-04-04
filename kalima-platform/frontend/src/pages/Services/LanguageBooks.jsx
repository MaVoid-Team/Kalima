import React, { useState, useEffect,  useMemo } from "react";
import { useTranslation } from "react-i18next";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import LanguageCourseCard from "./LanguageCourseCard";

const LanguageBooks = React.memo(({ books = [], isRTL = false }) => {
  const { i18n } = useTranslation();
  const content = useMemo(
    () => ({
      en: {
        title: "Learn All Languages",
        subtitle: "Through our platform",
        buttonText: "View Details",
        seeAll: "See All",
      },
      ar: {
        title: "تعلم جميع اللغات",
        subtitle: "من خلال منصتنا",
        buttonText: "عرض التفاصيل",
        seeAll: "عرض الكل",
      },
    }),
    []
  );

  const langContent = content[i18n.language] || content.en;
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="py-6 px-4 sm:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {isMobile || isTablet ? (
          <div className="relative">
            <div className="flex flex-wrap gap-3 sm:gap-4 pb-2">
              {books.slice(0, isMobile ? 4 : 6).map((book) => (
                <motion.div
                  key={book.id}
                  className="flex-shrink-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: book.id * 0.1 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <div className="relative w-[65px] sm:w-[80px]">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-auto rounded-sm shadow-xs hover:shadow-sm transition-all"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-3 flex ${isRTL ? "justify-start" : "justify-end"}`}
            >
              <Link
                to="/courses"
                className={`text-xs sm:text-sm font-medium ${
                  isRTL ? "text-left pl-2" : "text-right pr-2"
                } text-primary hover:text-primary-dark flex items-center gap-1`}
              >
                {langContent.seeAll}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 ${isRTL ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {books.map((book) => (
              <motion.div
                key={book.id}
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: book.id * 0.1 }}
                whileHover={{
                  y: -10,
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="relative w-[70px] sm:w-[90px]">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-auto rounded-sm shadow-xs hover:shadow-sm transition-all"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
            <motion.div
              className="flex-shrink-0 h-[50%] w-[280px] sm:w-[320px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <LanguageCourseCard
                isRTL={isRTL}
                title={langContent.title}
                subtitle={langContent.subtitle}
                rating={4}
                buttonText={langContent.buttonText}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
})
export default LanguageBooks;
