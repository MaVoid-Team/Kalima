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
  const { t } = useTranslation("landing");

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

  return (
    <footer className="bg-background border-t text-muted-foreground py-12">
      <div className="container md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
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
            <div key={section.title}>
              <h3 className="text-foreground font-semibold mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("footer.brand")}.{" "}
            {t("footer.rights")}.
          </p>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <Button
                key={label}
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 hover:text-primary hover:bg-transparent text-muted-foreground"
              >
                <a href={href} aria-label={label}>
                  <Icon className="h-5 w-5 no-flip" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
