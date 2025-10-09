import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/berita', label: 'Berita' },
    { href: '/informasi-donasi', label: 'Informasi Donasi' },
    { href: '/saran', label: 'Saran' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background shadow-md' : 'bg-background/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <span className="text-3xl font-bold text-primary">
              At-Taqwa
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
              >
                <a
                  data-testid={`link-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  className={`text-[15px] font-medium transition-colors ${
                    location === link.href
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
              >
                <a
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(' ', '-')}`}
                  className={`block py-2 font-medium ${
                    location === link.href
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
