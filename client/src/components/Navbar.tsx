import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/berita", label: "Berita" },
    { href: "/informasi-donasi", label: "Informasi Donasi" },
    { href: "/saran", label: "Saran" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background shadow-md"
          : "bg-emerald-800/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <span
              className={`text-3xl font-bold transition-colors duration-300 ${
                isScrolled ? "text-primary" : "text-white"
              }`}
            >
              At-Taqwa
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`link-nav-${link.label
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className={`text-[15px] font-medium transition-colors ${
                  isScrolled
                    ? location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                    : location.pathname === link.href
                      ? "text-white font-semibold"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${
              isScrolled ? "" : "text-white hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-t ${
            isScrolled ? "bg-background" : "bg-emerald-800"
          }`}
        >
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`link-mobile-${link.label
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className={`block py-2 font-medium ${
                  isScrolled
                    ? location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                    : location.pathname === link.href
                      ? "text-white font-semibold"
                      : "text-white/90 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
