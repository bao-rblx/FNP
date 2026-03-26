import React, { useEffect, useState } from 'react';
import { Home, Package, ShoppingCart, User, Globe, LayoutDashboard, MessageCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { triggerTransition } from './TransitionOverlay';

export function DesktopNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { getCartItemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const cartCount = getCartItemCount();

  const navItems = [
    { icon: Home, label: t.home, path: '/' },
    { icon: Package, label: t.orders, path: '/orders' },
    { icon: ShoppingCart, label: t.cart, path: '/cart', badge: cartCount },
    { icon: User, label: t.profile, path: '/profile' },
    ...(user?.role === 'admin'
      ? [{ icon: LayoutDashboard, label: t.adminPanel, path: '/admin' as const }]
      : []),
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-gradient-to-r from-red-700 to-red-600 text-white border-b border-red-800 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">Flash Print N Ship</div>
            <span className="text-xs text-red-100 bg-red-800 px-2 py-1 rounded">VLU</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'bg-red-800 text-white' 
                    : 'hover:bg-red-700 text-red-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <NavThemeToggle />

          <button
            type="button"
            onClick={() => triggerTransition('language', () => setLanguage(language === 'vi' ? 'en' : 'vi'))}
            className="flex items-center gap-2 px-4 py-2 hover:bg-red-700 rounded-lg text-red-100 transition-colors ml-2"
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <Globe className="w-5 h-5" />
            <span className="uppercase font-medium">{language}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10 shrink-0" aria-hidden />;
  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => triggerTransition(dark ? 'theme-to-light' : 'theme-to-dark', () => setTheme(dark ? 'light' : 'dark'))}
      className="flex items-center justify-center p-2 rounded-lg hover:bg-red-700 text-red-100 transition-colors"
      aria-label={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
