import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Leaf } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Become a Dealer', path: '/dealers' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary-600" />
            <span className="font-display font-bold text-2xl text-primary-900">
              ASIM AGRO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition duration-200 hover:text-primary-600 ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : isScrolled
                    ? 'text-gray-800'
                    : 'text-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dealers/login"
              className="flex items-center space-x-1 text-gray-800 hover:text-primary-600 transition duration-200"
            >
              <User className="h-5 w-5" />
              <span>Login</span>
            </Link>
            <Link
              to="/cart"
              className="flex items-center space-x-1 text-gray-800 hover:text-primary-600 transition duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </Link>
            <Link to="/contact" className="btn btn-primary">
              Get a Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-md transition-transform duration-300 transform ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container-custom py-4">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium py-2 transition duration-200 hover:text-primary-600 ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
              <Link
                to="/dealers/login"
                className="flex items-center space-x-1 text-gray-800 hover:text-primary-600 transition duration-200"
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center space-x-1 text-gray-800 hover:text-primary-600 transition duration-200"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </Link>
            </div>
            <Link to="/contact" className="btn btn-primary w-full text-center mt-4">
              Get a Quote
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;