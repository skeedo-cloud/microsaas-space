import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-[#2563EB] cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            MicroSaaS Space
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium"
            >
              Preview
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium"
            >
              About
            </button>
            <Button
              onClick={() => scrollToSection('signup')}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              Subscribe
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#64748B] hover:text-[#2563EB]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 flex flex-col gap-4 py-4 border-t border-gray-100"
            >
              <button
                onClick={() => scrollToSection('hero')}
                className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('preview')}
                className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium text-left"
              >
                Preview
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium text-left"
              >
                About
              </button>
              <Button
                onClick={() => scrollToSection('signup')}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white w-full"
              >
                Subscribe
              </Button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}