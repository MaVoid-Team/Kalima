import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Link } from "react-router-dom";

export default function Footer() {
  const { t, i18n } = useTranslation("footer");
  const isRTL = i18n.language === 'ar';

  return (
    <footer className="py-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-xl font-bold mb-4">{t('contact')}</h3>
            <p className="mb-2">01021554154</p>
            <p className="mb-4">01158551515</p>
            <h4 className="text-lg font-bold mb-2">{t('followUs')}</h4>
            <div className="flex gap-4" style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
              <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link to="/about" className="btn btn-circle btn-sm btn-ghost"> 
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-xl font-bold mb-4">{t('links')}</h3>
            <ul className="space-y-2">
              <li><Link to='/'>{t('home')}</Link></li>
              <li><Link to='/courses'>{t('courses')}</Link></li>
              <li><Link to='/teachers'>{t('teachers')}</Link></li>
              <li><Link to='/'>{t('services')}</Link></li>
              <li><Link to='/'>{t('resources')}</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex justify-center mb-4">
              <img src="/civilco_logo.png" alt="Kalma Logo" className="h-10" />
            </div>
            <p className="text-sm mb-4">
              {t('aboutText')}
            </p>
            <p className="text-sm">
              {t('aboutText')}
            </p>
          </div>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-base-300 "dir='ltr'>
          <p className="text-sm">
            @Copyright 2025 <Link className="text-primary" to={'/'}>Kalma</Link> | Developed by <Link className="text-primary" to={'/'}>Kalma</Link> team, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}