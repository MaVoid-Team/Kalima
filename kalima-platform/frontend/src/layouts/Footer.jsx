import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "../assets/Logo.png";

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Browse Booklets", href: "#" },
      { label: "Lesson Designs", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  const linkClass = "hover:text-primary transition-colors";
  const socialIconClass =
    "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer className="bg-card text-muted-foreground py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <img
                src={logo}
                alt="Kalima Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight">Kalima</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering educators with premium resources and lesson designs.
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
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kalima Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
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
