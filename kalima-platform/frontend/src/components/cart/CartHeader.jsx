import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CartHeader({ itemCount }) {
  const { t, i18n } = useTranslation('cart');
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <Button
          onClick={() => navigate('/market')}
          variant="link"
          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium p-0 h-auto"
        >
          {/* arrow always visible */}
          {i18n.language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {/* hide text on mobile */}
          <span className="hidden md:inline">{t('continueShopping')}</span>
        </Button>
      </div>
      <p className="text-gray-600 text-sm">{t('itemsInCart', { count: itemCount })}</p>
    </div>
  );
}
