'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, Home } from 'lucide-react';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/workspace" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Studia</h1>
                <p className="text-xs text-gray-500">AI Learning Platform</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                href="/workspace"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  pathname === '/workspace'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home size={20} />
                <span className="font-medium">Accueil</span>
              </Link>

              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Studia - AI-powered learning platform
          </p>
        </div>
      </footer>
    </div>
  );
}