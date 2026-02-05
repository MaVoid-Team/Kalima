import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../assets/Logo.png";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  const { t, i18n } = useTranslation("landing");
  const isRTL = i18n.language === "ar";

  const FOOTER_SECTIONS = [
    {
      title: t("footer.platform"),
      links: [
        { label: t("footer.browseCourses"), href: "/courses" },
        { label: t("footer.teachers"), href: "/teachers" },
        { label: t("footer.pricing"), href: "/pricing" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.aboutUs"), href: "/about" },
        { label: t("footer.contact"), href: "/contact" },
        { label: t("footer.careers"), href: "/careers" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacyPolicy"), href: "/privacy" },
        { label: t("footer.termsOfService"), href: "/terms" },
      ],
    },
  ];

  const linkClass = "hover:text-brand transition-colors";
  const socialIconClass = "text-gray-400 hover:text-brand transition-colors";

  return (
    <footer className="bg-white text-gray-500 py-12 border-t border-gray-100" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className={`space-y-4 ${isRTL ? "text-right" : ""}`}>
            <div className={`flex items-center gap-2 text-text-main ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
              <img
                src={logo}
                alt="Kalima Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight">
                {isRTL ? "كلمة" : "Kalima"}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {t("footer.description")}
            </p>
          </div>

          {/* Footer Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className={isRTL ? "text-right" : ""}>
              <h3 className="text-text-main font-semibold mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {isRTL ? "منصة كلمة" : "Kalima Platform"}. {t("footer.rights")}.
          </p>
          <div className={`flex gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className={socialIconClass}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
