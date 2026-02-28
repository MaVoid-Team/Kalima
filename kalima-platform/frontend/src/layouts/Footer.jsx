import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "../assets/Logo.png";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "https://www.facebook.com/kalima010", label: "Facebook" },
  { Icon: Youtube, href: "https://www.youtube.com/@kalima1", label: "Youtube" },
];

export default function Footer() {
  const { t } = useTranslation("landing");

  const FOOTER_SECTIONS = [
    {
      title: t("footer.platform"),
      links: [
        { label: t("footer.market"), href: "/market" },
        { label: t("footer.samples"), href: "/samples" },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t text-muted-foreground py-8 md:py-12">
      <div className="container px-6 md:px-6">
        <div className="flex flex-row justify-between items-center">
          {/* Brand */}
          <div className="space-y-4 flex flex-col items-start">
            <div className="flex items-center gap-2 text-foreground">
              <img
                src={logo}
                alt="Kalima Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground/80 max-w-xs text-start mb-4">
              {t("footer.description")}
            </p>
          </div>

          {/* Footer Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col items-start">
              <h3 className="text-foreground font-semibold mb-4 text-start">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm text-start">
                {section.links.map((link) => (
                  <li key={link.label} className="mb-4">
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t flex flex-row flex-wrap justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-left">
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
                <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
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
