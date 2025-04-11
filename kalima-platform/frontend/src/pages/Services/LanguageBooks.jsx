"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import LanguageCourseCard from "./LanguageCourseCard"

const LanguageBooks = React.memo(({ books = [], isRTL = false }) => {
  const { i18n } = useTranslation()
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
    [],
  )

  const langContent = content[i18n.language] || content.en
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [expandedBookId, setExpandedBookId] = useState(null)

  // Generate random positions for featured cards
  const [featuredCardPositions] = useState(() => {
    // For desktop view - position between 2-5
    const desktopPosition = Math.floor(Math.random() * 4) + 2
    // For mobile/tablet view - position between 1-3
    const mobilePosition = Math.floor(Math.random() * 3) + 1
    return { desktop: desktopPosition, mobile: mobilePosition }
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleBookClick = (bookId) => {
    if (expandedBookId === bookId) {
      setExpandedBookId(null)
    } else {
      setExpandedBookId(bookId)
    }
  }

  // Create a modified books array that includes the expanded card and featured card at random position
  const renderBooks = useMemo(() => {
    const result = []
    const position = isMobile || isTablet ? featuredCardPositions.mobile : featuredCardPositions.desktop

    // Insert books and expanded cards
    for (let i = 0; i < books.length; i++) {
      // Insert featured card at random position if no book is expanded
      if (!expandedBookId && i === position && i < books.length) {
        result.push({
          id: "featured-card",
          isFeatured: true,
        })
      }

      // Insert the book
      result.push(books[i])

      // Insert expanded card if this book is expanded
      if (books[i].id === expandedBookId) {
        result.push({
          id: `expanded-${books[i].id}`,
          isExpanded: true,
          originalBook: books[i],
        })
      }
    }

    // If position is beyond the books length, add featured card at the end
    if (!expandedBookId && position >= books.length) {
      result.push({
        id: "featured-card",
        isFeatured: true,
      })
    }

    return result
  }, [books, expandedBookId, featuredCardPositions, isMobile, isTablet])

  return (
    <div className="py-6 px-4 sm:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {isMobile || isTablet ? (
          <div className="relative">
            <div className="flex flex-wrap gap-3 sm:gap-4 pb-2">
              {renderBooks.slice(0, expandedBookId ? (isMobile ? 8 : 10) : isMobile ? 6 : 8).map((item) => {
                if (item.isExpanded) {
                  return (
                    <motion.div
                      key={item.id}
                      className="flex-shrink-0 w-[280px] sm:w-[320px]"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: isMobile ? "280px" : "320px", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LanguageCourseCard
                        isRTL={isRTL}
                        title={item.originalBook.title}
                        subtitle={langContent.subtitle}
                        rating={4}
                        imageUrl={item.originalBook.image}
                        buttonText={langContent.buttonText}
                      />
                    </motion.div>
                  )
                }

                if (item.isFeatured) {
                  return (
                    <motion.div
                      key={item.id}
                      className="flex-shrink-0 w-[280px] sm:w-[320px]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <LanguageCourseCard
                        isRTL={isRTL}
                        title={langContent.title}
                        subtitle={langContent.subtitle}
                        rating={5}
                        buttonText={langContent.buttonText}
                      />
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={item.id}
                    className="flex-shrink-0 cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => handleBookClick(item.id)}
                  >
                    <div className="relative w-[65px] sm:w-[80px]">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className={`w-full h-auto rounded-sm ${
                          expandedBookId === item.id ? "shadow-md" : "shadow-xs hover:shadow-sm"
                        } transition-all`}
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                )
              })}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {renderBooks.map((item) => {
              if (item.isExpanded) {
                return (
                  <motion.div
                    key={item.id}
                    className="flex-shrink-0 w-[280px] sm:w-[320px]"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "280px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LanguageCourseCard
                      isRTL={isRTL}
                      title={item.originalBook.title}
                      subtitle={langContent.subtitle}
                      rating={4}
                      imageUrl={item.originalBook.image}
                      buttonText={langContent.buttonText}
                    />
                  </motion.div>
                )
              }

              if (item.isFeatured) {
                return (
                  <motion.div
                    key={item.id}
                    className="flex-shrink-0 w-[280px] sm:w-[320px]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <LanguageCourseCard
                      isRTL={isRTL}
                      title={langContent.title}
                      subtitle={langContent.subtitle}
                      rating={5}
                      buttonText={langContent.buttonText}
                    />
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={item.id}
                  className="flex-shrink-0 cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{
                    y: -10,
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => handleBookClick(item.id)}
                >
                  <div className="relative w-[70px] sm:w-[90px]">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className={`w-full h-auto rounded-sm ${
                        expandedBookId === item.id ? "shadow-md" : "shadow-xs hover:shadow-sm"
                      } transition-all`}
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})

export default LanguageBooks
