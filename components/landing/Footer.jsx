import React from 'react';
import { Mail, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white mb-4">
              MicroSaaS Weekly
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Curated, expert-validated SaaS ideas delivered to your inbox every week. 
              Built for founders, by founders.
            </p>
            <div className="flex gap-4">
              <a
                href="mailto:hello@microsaasweekly.com"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#2563EB] flex items-center justify-center transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#2563EB] flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#2563EB] flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#2563EB] flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button className="hover:text-white transition-colors">About Us</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Archive</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Blog</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Contact</button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button className="hover:text-white transition-colors">Privacy Policy</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Terms of Service</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Cookie Policy</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">GDPR</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} MicroSaaS Weekly. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with ❤️ for founders worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}