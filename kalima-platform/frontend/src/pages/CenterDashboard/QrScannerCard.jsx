import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, BookOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const QrScannerCard = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="bg-base-100 p-6 rounded-lg relative overflow-hidden max-w-md mx-auto"
      dir={dir}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-primary/5"></div>
      <div className="absolute bottom-2 left-0 w-full h-1 bg-primary/10"></div>
      <div className="absolute bottom-4 left-0 w-full h-1 bg-primary/10"></div>
      <div className="absolute bottom-6 left-0 w-full h-1 bg-primary/10"></div>

      {/* Top Navigation */}
      <motion.div 
        className="flex justify-start mb-8"
        variants={itemVariants}
      >
        <button className="flex items-center text-base-content/70 hover:text-base-content transition-colors">
          <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span className="text-sm">{isRTL ? 'عرض الكل' : 'Show All'}</span>
        </button>
      </motion.div>

      {/* QR Scanner Section */}
      <div className="flex flex-col items-center mb-8">
        {/* QR Scanner Button */}
        <motion.button 
          className="btn btn-primary rounded-lg px-6 py-3 mb-2 flex items-center"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Camera className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'مسح QR' : 'QR Scanner'}
        </motion.button>
        
        <motion.p 
          className="text-base-content/50 mb-6 text-sm"
          variants={itemVariants}
        >
          {isRTL ? 'اضغط هنا لمسح الكود' : 'Click here to scan code'}
        </motion.p>

        {/* Speech Bubble */}
        <motion.div 
          className={`
            relative bg-base-100 border border-primary p-4 rounded-lg mb-4  
            ${isRTL ? 'text-right' : 'text-left'}
            before:content-[''] before:absolute before:top-full before:left-1/2 
            before:-translate-x-1/2 before:w-4 before:h-4 before:bg-base-100 
            before:border-b before:border-r before:border-primary before:rotate-45
          `}
          variants={itemVariants}
        >
          <p className="font-medium text-base-content">{isRTL ? 'الطالب محمد محمود' : 'Student: Mahmoud Mohamed'}</p>
          <p className="text-base-content/70 text-sm mt-1">[المدفوع 1500 جنيه]</p>
          <p className="text-base-content/70 text-sm mt-1">[وقت الدخول 4:15pm]</p>
        </motion.div>

        {/* Register Entry Button */}
        <motion.button 
          className="btn btn-primary rounded-lg px-6 py-2 flex items-center"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="w-2 h-2 bg-success rounded-lg mr-2"></span>
          {isRTL ? 'تسجيل الدخول' : 'Register Entry'}
        </motion.button>
      </div>

      {/* Summary Card */}
      <motion.div 
        className="bg-base-200 rounded-lg p-6 border border-base-300"
        variants={itemVariants}
      >
        {/* Centered Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center mb-2">
            <svg 
              className="h-5 w-5 text-base-content" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-base-content">{isRTL ? 'ملخص الإيرادات' : 'Revenue Summary'}</h3>
        </div>

        <div className={`flex items-center mb-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <BookOpen className={`h-5 w-5 text-base-content/70 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <p className="text-base-content">{isRTL ? 'درس الرياضيات - الصف الخامس' : 'Math Lesson - Grade 5'}</p>
        </div>

        <div className={`${isRTL ? 'text-right' : 'text-left'} space-y-2 mb-6`}>
          <p className="text-base-content">{isRTL ? '120 طالباً' : '120 students'}</p>
          <p className="text-base-content">{isRTL ? '150 جنيه' : '150 EGP'}</p>
          <p className="font-medium text-base-content">{isRTL ? 'إجمالي الإيرادات 18000 جنيه' : 'Total revenue: 18000 EGP'}</p>
        </div>

        <motion.button 
          className="btn btn-primary rounded-lg px-6 py-2 w-full flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'تحميل التقرير' : 'Download Report'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default QrScannerCard;