import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import logo from "../assets/Logo.png";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  const { t, i18n } = useTranslation("landing");
  const rtl = i18n.dir() === "rtl";

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

  const linkClass = "text-muted-foreground hover:text-brand transition-colors";

  return (
    <footer className="bg-background border-t border-gray-200 text-muted-foreground py-12 ">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className={`space-y-4 ${rtl ? "text-right" : ""}`}>
            <div
              className={`flex items-center gap-2 text-foreground ${rtl ? "flex-row-reverse justify-end" : ""}`}
            >
              <img
                src={logo}
                alt="Kalima Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground/80">
              {t("footer.description")}
            </p>
          </div>

          {/* Footer Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className={rtl ? "text-right" : ""}>
              <h3 className="text-foreground font-semibold mb-4">
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

        <div
          className={` pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${rtl ? "md:flex-row-reverse" : ""}`}
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {rtl ? "منصة كلمة" : "Kalima Platform"}
            . {t("footer.rights")}.
          </p>
          <div className={`flex gap-4 ${rtl ? "flex-row-reverse" : ""}`}>
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <Button
                key={label}
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 hover:text-brand text-muted-foreground"
              >
                <a href={href} aria-label={label}>
                  <Icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
