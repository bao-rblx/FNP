import { Home, Package, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { t } = useLanguage();
  const cartCount = getCartItemCount();

  const navItems = [
    { icon: Home, label: t.home, path: '/' },
    { icon: Package, label: t.orders, path: '/orders' },
    { icon: ShoppingCart, label: t.cart, path: '/cart', badge: cartCount > 0 ? cartCount : null },
    { icon: User, label: t.profile, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto" style={{ left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 2rem)' }}>
      <div className="flex justify-around items-center h-16 px-2 rounded-2xl bg-card border border-border shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 relative py-1 gap-0.5"
            >
              <motion.div
                animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`relative w-10 h-8 flex items-center justify-center rounded-xl ${isActive ? 'bg-red-600/10' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-red-600' : 'text-muted-foreground'
                  }`}
                />
                {item.badge != null && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-red-600' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}