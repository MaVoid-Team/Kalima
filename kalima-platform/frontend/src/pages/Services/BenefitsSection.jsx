import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const BenefitsSection = React.memo(({ isRTL }) => {
  const benefits = useMemo(
    () => [
      {
        id: 1,
        number: "01",
        title: isRTL ? "تعلم مرن" : "Flexible Learning",
        italic: isRTL ? "أوقاتك" : "Your Schedule",
        content: isRTL
          ? "تعلم في أي وقت ومن أي مكان مع إمكانية الوصول الكامل إلى جميع المواد التعليمية"
          : "Learn anytime, anywhere with full access to all educational materials",
        gradient: "from-primary/20 to-secondary/20",
      },
      {
        id: 2,
        number: "02",
        title: isRTL ? "معلمون خبراء" : "Expert Teachers",
        italic: isRTL ? "متخصصين" : "Specialists",
        content: isRTL
          ? "فريق من المعلمين المؤهلين ذوي الخبرة في المناهج التعليمية المختلفة"
          : "Team of qualified teachers experienced in various curricula",
        gradient: "from-secondary/20 to-accent/20",
      },
      {
        id: 3,
        number: "03",
        title: isRTL ? "محتوى مميز" : "Premium Content",
        italic: isRTL ? "جودة عالية" : "High Quality",
        content: isRTL
          ? "مناهج مصممة بعناية لتغطية جميع احتياجات الطلاب التعليمية"
          : "Carefully designed curriculum covering all student educational needs",
        gradient: "from-accent/20 to-primary/20",
      },
      {
        id: 4,
        number: "04",
        title: isRTL ? "متابعة مستمرة" : "Continuous Support",
        italic: isRTL ? "رعاية" : "Care",
        content: isRTL
          ? "دعم فني وتعليمي متواصل لضمان أفضل تجربة تعليمية"
          : "Continuous technical and educational support to ensure the best learning experience",
        gradient: "from-primary/20 to-secondary/20",
      },
      {
        id: 5,
        number: "05",
        title: isRTL ? "شهادات معتمدة" : "Certified Certificates",
        italic: isRTL ? "اعتماد" : "Accreditation",
        content: isRTL
          ? "شهادات معتمدة بعد إتمام كل مرحلة تعليمية بنجاح"
          : "Certified certificates upon successful completion of each educational stage",
        gradient: "from-secondary/20 to-accent/20",
      },
      {
        id: 6,
        number: "06",
        title: isRTL ? "تقييم وتطوير" : "Assessment & Development",
        italic: isRTL ? "تحسين" : "Improvement",
        content: isRTL
          ? "نظام تقييم مستمر لمتابعة التطور الأكاديمي للطلاب"
          : "Continuous assessment system to track students' academic progress",
        gradient: "from-accent/20 to-primary/20",
      },
    ],
    [isRTL]
  );

  return (
    <div className="relative mt-32 py-20 overflow-hidden">
      {/* Giant Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.02, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`text-[15rem] lg:text-[20rem] font-bold leading-none select-none ${
            isRTL ? "font-[family-name:var(--font-laxr)]" : "font-[family-name:var(--font-bigx)]"
          }`}
          style={{
            WebkitTextStroke: "2px currentColor",
            color: "transparent",
          }}
        >
          {isRTL ? "فوائد" : "BENEFITS"}
        </motion.div>
      </div>

      <div className="relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-[family-name:var(--font-malmoom)] text-primary">
              {isRTL ? "لماذا كلمة؟" : "Why Kalima?"}
            </span>
          </div>

          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-[family-name:var(--font-headline)] ${isRTL ? "text-right" : "text-left"} max-w-4xl mx-auto`}>
            {isRTL ? (
              <>
                فوائد الانضمام إلى منصة{" "}
                <span className="text-primary">كلمة</span>
              </>
            ) : (
              <>
                Benefits of Joining{" "}
                <span className="text-primary">Kalima</span>
              </>
            )}
          </h2>

          <p className={`text-lg text-base-content/70 max-w-2xl mx-auto font-[family-name:var(--font-body)] ${isRTL ? "text-right" : "text-left"}`}>
            {isRTL
              ? "اكتشف المزايا التي تجعل منصتنا الخيار الأمثل لرحلتك التعليمية"
              : "Discover the advantages that make our platform the best choice for your educational journey"}
          </p>
        </motion.div>

        {/* Benefits Grid - Editorial Layout */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* First Row - 2 Large Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.slice(0, 2).map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                {/* Gradient Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`} />

                <div className="relative bg-base-100/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border-2 border-base-300/50 group-hover:border-primary/50 transition-colors overflow-hidden">
                  {/* Card Number - Giant Background */}
                  <div className="absolute top-0 right-0 opacity-5 font-[family-name:var(--font-bigx)] text-[12rem] leading-none pointer-events-none">
                    {benefit.number}
                  </div>

                  {/* Content */}
                  <div className={`relative z-10 ${isRTL ? "text-right" : "text-left"}`}>
                    {/* Number Badge */}
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6 shadow-lg">
                      <span className="text-2xl font-bold text-white font-[family-name:var(--font-bigx)]">
                        {benefit.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl lg:text-4xl font-bold mb-3 font-[family-name:var(--font-headline)]">
                      {benefit.title}
                    </h3>

                    {/* Italic Subheading */}
                    <p className="text-xl text-primary mb-4 font-[family-name:var(--font-laxr)] italic">
                      {benefit.italic}
                    </p>

                    {/* Description */}
                    <p className="text-base-content/70 text-lg leading-relaxed font-[family-name:var(--font-body)]">
                      {benefit.content}
                    </p>
                  </div>

                  {/* Decorative Circle */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second Row - 3 Medium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.slice(2, 5).map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                {/* Gradient Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`} />

                <div className="relative bg-base-100/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border-2 border-base-300/50 group-hover:border-primary/50 transition-colors overflow-hidden h-full">
                  {/* Card Number - Background */}
                  <div className="absolute top-0 right-0 opacity-5 font-[family-name:var(--font-bigx)] text-[8rem] leading-none pointer-events-none">
                    {benefit.number}
                  </div>

                  {/* Content */}
                  <div className={`relative z-10 ${isRTL ? "text-right" : "text-left"}`}>
                    {/* Number Badge */}
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl mb-4 shadow-lg">
                      <span className="text-xl font-bold text-white font-[family-name:var(--font-bigx)]">
                        {benefit.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-headline)]">
                      {benefit.title}
                    </h3>

                    {/* Italic Subheading */}
                    <p className="text-lg text-primary mb-3 font-[family-name:var(--font-laxr)] italic">
                      {benefit.italic}
                    </p>

                    {/* Description */}
                    <p className="text-base-content/70 leading-relaxed font-[family-name:var(--font-body)]">
                      {benefit.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Third Row - 1 Full Width Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative group"
          >
            {/* Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${benefits[5].gradient} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`} />

            <div className="relative bg-base-100/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border-2 border-base-300/50 group-hover:border-primary/50 transition-colors overflow-hidden">
              {/* Card Number - Giant Background */}
              <div className="absolute top-0 right-0 opacity-5 font-[family-name:var(--font-bigx)] text-[12rem] leading-none pointer-events-none">
                {benefits[5].number}
              </div>

              {/* Content - Horizontal Layout */}
              <div className={`relative z-10 flex flex-col md:flex-row gap-8 items-start ${isRTL ? "md:flex-row-reverse text-right" : "text-left"}`}>
                <div className="flex-shrink-0">
                  {/* Number Badge */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
                    <span className="text-3xl font-bold text-white font-[family-name:var(--font-bigx)]">
                      {benefits[5].number}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-3xl lg:text-4xl font-bold mb-3 font-[family-name:var(--font-headline)]">
                    {benefits[5].title}
                  </h3>

                  {/* Italic Subheading */}
                  <p className="text-xl text-primary mb-4 font-[family-name:var(--font-laxr)] italic">
                    {benefits[5].italic}
                  </p>

                  {/* Description */}
                  <p className="text-base-content/70 text-lg leading-relaxed font-[family-name:var(--font-body)] max-w-3xl">
                    {benefits[5].content}
                  </p>
                </div>
              </div>

              {/* Decorative Circles */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute top-1/2 right-20 w-20 h-20 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

export default BenefitsSection;