import React from 'react';
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EmptyCartState({ onBrowseProducts }) {
  const { t, i18n } = useTranslation('cart');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl shadow-sm border border-gray-200 text-center">
          <CardContent className="p-12">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">😕</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-3">
              {t('empty')}
            </h2>
            <p className="mb-8 max-w-md mx-auto">
              {t('emptyHint')}
            </p>

            <Button
              onClick={onBrowseProducts}
              className="inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-lg"
            >
              {i18n.language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {t('browseProducts')}
            </Button>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm mb-4">{t('popularCategories')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[t('categories.textbooks'), t('categories.schoolSupplies'), t('categories.studyGuides'), t('categories.digitalResources')].map((category, idx) => (
                  <Button
                    key={idx}
                    variant="secondary"
                    size="sm"
                    className="px-4 py-2 text-sm font-medium rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
