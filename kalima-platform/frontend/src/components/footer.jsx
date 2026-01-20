import { useTranslation } from "react-i18next";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Music2,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const { t, i18n } = useTranslation("footer");
  const isRTL = i18n.language === "ar";

  return (
    <footer
      className="relative bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-white pt-20 pb-10 overflow-hidden font-sans border-t-4 border-red-500"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
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

          {/* Links Column (Span 4) */}
          <div
            className={`md:col-span-4 flex flex-col items-center md:items-start ${isRTL ? "md:text-right" : "md:text-left"}`}
          >
            <h3 className="text-lg font-black uppercase tracking-wider mb-8 relative inline-block">
              {t("links", "Quick Links")}
              <span
                className={`absolute -bottom-2 ${isRTL ? "right-0" : "left-0"} w-12 h-1 bg-white/30 rounded-full`}
              ></span>
            </h3>
            <ul className="space-y-4 font-bold text-red-50/80 w-full max-w-[200px]">
              {[
                { to: "/", label: t("home", "Home") },
                { to: "/courses", label: t("courses", "Courses") },
                { to: "/teachers", label: t("teachers", "Teachers") },
                { to: "/packages", label: t("services", "Services") },
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 hover:text-white transition-all duration-300 hover:pl-2"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-red-400 group-hover:bg-white transition-colors ${isRTL ? "ml-2" : "mr-2"}`}
                    ></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column (Span 4) */}
          <div
            className={`md:col-span-4 flex flex-col items-center md:items-start ${isRTL ? "md:text-right" : "md:text-left"}`}
          >
            <h3 className="text-lg font-black uppercase tracking-wider mb-8 relative inline-block">
              {t("contact", "Contact Us")}
              <span
                className={`absolute -bottom-2 ${isRTL ? "right-0" : "left-0"} w-12 h-1 bg-white/30 rounded-full`}
              ></span>
            </h3>

            <ul className="space-y-6">
              <li className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-inner border border-red-500/30">
                  <Phone size={20} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-red-300 uppercase tracking-widest">
                    {t("callUs", "Call Us")}
                  </span>
                  <span className="text-lg font-black text-white group-hover:text-red-200 transition-colors">
                    01061165403
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-red-100/60"
          dir="ltr"
        >
          <p className="tracking-wide">
            © 2025 <span className="font-bold text-white">Kalima</span>. All
            rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition-colors hover:underline"
            >
              Privacy Policy
            </Link>
            <span>|</span>
            <Link
              to="#"
              className="hover:text-white transition-colors hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
