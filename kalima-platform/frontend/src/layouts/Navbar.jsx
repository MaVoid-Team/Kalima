import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/Logo.png";

const NAV_LINKS = [
  { label: "Booklets", href: "#" },
  { label: "Lesson Designs", href: "#" },
  { label: "Professional Dev", href: "#" },
  { label: "Pricing", href: "#" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Kalima Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-2xl font-extrabold text-text-main tracking-tight">
            Kalima
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-10">
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-[15px] font-medium text-text-sub hover:text-text-main transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 pl-2">
            <button className="px-6 py-2.5 text-[15px] font-bold text-text-main bg-white border border-gray-200 rounded-full transition-all cursor-pointer">
              Log In
            </button>
            <button className="px-6 py-2.5 text-[15px] font-bold text-white bg-brand rounded-full  transition-all cursor-pointer">
              Sign Up
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-brand transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 absolute top-20 left-0 right-0 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-base font-medium text-text-sub hover:text-brand transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-100 my-2" />
            <div className="flex flex-col gap-3">
              <button className="w-full px-6 py-3 text-base font-bold text-text-main bg-white border border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer">
                Log In
              </button>
              <button className="w-full px-6 py-3 text-base font-bold text-white bg-brand rounded-full hover:bg-brand-dark shadow-md cursor-pointer">
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
