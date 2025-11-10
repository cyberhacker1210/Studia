'use client';

import Link from 'next/link';
import { Github, Mail, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-white">Studia</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              {t.footer.description}
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/cyberhacker1210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Github size={20} />
              </Link>
              <Link
                href="mailto:contact@studia.com"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Mail size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="hover:text-primary-400 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-primary-400 transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-primary-400 transition-colors">
                  {t.nav.features}
                </Link>
              </li>
              <li>
                <Link href="#why" className="hover:text-primary-400 transition-colors">
                  {t.nav.why}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-primary-400 transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-400 transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-400 transition-colors">
                  {t.footer.cookies}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 Studia. {t.footer.rights}
          </p>
          <p className="text-gray-400 text-sm flex items-center space-x-1 mt-4 md:mt-0">
            <span>{t.footer.madeWith}</span>
            <Heart size={16} className="text-red-500 fill-current" />
            <span>{t.footer.by}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}