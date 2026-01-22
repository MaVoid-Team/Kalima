import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Linkedin, Music2,Youtube } from 'lucide-react';
import { Link } from "react-router-dom";

export default function Footer() {
  const { t, i18n } = useTranslation("footer");
  const isRTL = i18n.language === 'ar';

  return (
    <footer
      className="relative  bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-white pt-20 pb-10 overflow-hidden font-sans border-t-4 border-red-500"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 max-w-[1500px] sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column (Span 4) */}
          <div
            className={`md:col-span-4 flex flex-col items-center md:items-start ${isRTL ? "md:text-right" : "md:text-left"} text-center md:text-start space-y-6`}
          >
            <div className="flex flex-col items-center md:items-start gap-4">
              <img
                src="/Logo.png"
                alt="Kalima"
                className="h-16 w-auto brightness-0 invert drop-shadow-lg"
              />
              <p className="text-red-100/90 text-sm leading-relaxed max-w-xs font-medium">
                {t(
                  "aboutText",
                  "Kalima platform is an electronic learning platform that provides resources for students from the fourth primary grade to the third secondary grade.",
                )}
              </p>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {[
                {
                  Icon: Facebook,
                  link: "https://www.facebook.com/kalima010",
                  label: "Facebook",
                },
                { Icon: Instagram, link: "#", label: "Instagram" },
                {
                  Icon: Youtube,
                  link: "https://www.youtube.com/@kalima1",
                  label: "Youtube",
                },
                { Icon: Twitter, link: "#", label: "Twitter" },
                { Icon: Music2, link: "#", label: "TikTok" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-red-700 flex items-center justify-center transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-white/20 hover:-translate-y-1 group"
                  aria-label={social.label}
                >
                  <social.Icon
                    size={20}
                    className="transform group-hover:scale-110 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            {/* <h3 className="text-xl font-bold mb-4">{t('links')}</h3> */}
            <ul className="space-y-2">
              <li><Link to='/'>{t('home')}</Link></li>
              <li><Link to='/courses'>{t('courses')}</Link></li>
              <li><Link to='/teachers'>{t('teachers')}</Link></li>
              <li><Link to='/packages'>{t('services')}</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex justify-center mb-4">
              <img src="/Kalima.png" alt="Kalima Logo" className="h-10" />
            </div>
            <p className="text-base font-semibold mb-4">
              {t('aboutText')}
            </p>
          </div>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-base-300 "dir='ltr'>
          <p className="text-sm">
            @Copyright 2025 <Link className="text-primary" to={'/'}>Kalima</Link> | Developed by <Link className="text-primary" to={'/'}>Kalima</Link> team, All rights reserved.
          </p>
          <p className='font-bold text-sm'><Link to={"/privacy-policy"} className='underline text-blue-600'>Privacy Policy</Link></p>
        </div>
      </div>
    </footer>
  );
}