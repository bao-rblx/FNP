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
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-slate-950/90 text-slate-100 border-b border-slate-800/80 backdrop-blur-md z-50 h-16 shadow-lg shadow-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400">PolyStore</div>
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">3D Vault</span>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all relative font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'hover:bg-slate-900 text-slate-300 hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-sm">
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
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-900 rounded-xl text-slate-300 hover:text-slate-100 transition-colors ml-2 border border-slate-800"
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="uppercase text-xs font-bold tracking-wider">{language}</span>
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
  if (!mounted) return <div className="w-9 h-9 shrink-0" aria-hidden />;
  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => triggerTransition(dark ? 'theme-to-light' : 'theme-to-dark', () => setTheme(dark ? 'light' : 'dark'))}
      className="flex items-center justify-center p-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-slate-100 transition-colors border border-slate-800"
      aria-label={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
    </button>
  );
}
