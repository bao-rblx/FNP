import React, { useMemo, useState } from 'react';
import {
  Clock,
  FileText,
  MapPin,
  Package,
  Percent,
  Printer,
  ScanLine,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { DesktopNav } from '../components/DesktopNav';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { products, type Product } from '../data/products';

const SUGGESTED_IDS = ['print-bw', 'print-color', 'print-binding', 'paper-a4'] as const;

export default function Home() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'printing',
      name: t.printingServices,
      icon: Printer,
      color: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
      description: t.printingDesc,
    },
    {
      id: 'paper',
      name: t.paperProducts,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
      description: t.paperDesc,
    },
    {
      id: 'supplies',
      name: t.officeSupplies,
      icon: Package,
      color: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400',
      description: t.officeDesc,
    },
    {
      id: 'services',
      name: t.servicesCategory,
      icon: ScanLine,
      color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
      description: t.servicesCategoryDesc,
    },
    {
      id: 'goods',
      name: t.goodsCategory,
      icon: Sparkles,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
      description: t.goodsCategoryDesc,
    },
  ];

  const ordersPath = user ? '/orders' : '/auth?return=/orders';

  const quickActions = [
    { label: t.reorder, icon: TrendingUp, to: ordersPath, hint: t.myOrders },
    { label: t.trackOrder, icon: Package, to: ordersPath, hint: t.processing_status },
  ];

  const suggestedProducts = useMemo(() => {
    const set = new Set<string>(SUGGESTED_IDS);
    return products.filter((p) => set.has(p.id));
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const blob = [
        p.name,
        p.description,
        p.nameEn,
        p.descriptionEn,
        p.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [searchQuery]);

  const productName = (p: Product) => (language === 'en' && p.nameEn ? p.nameEn : p.name);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const unitLabel = (p: Product) => {
    if (p.unit.includes('trang')) return t.perPage;
    if (p.unit.includes('cuốn')) return t.perBook;
    if (p.unit.includes('bộ')) return t.perSet;
    return t.perPiece;
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-background text-foreground pb-20 md:pb-8 md:pt-16">
        <header className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800')] opacity-10 mix-blend-overlay bg-cover bg-center" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 blur-[80px] rounded-full" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative max-w-6xl mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24 text-center md:text-left"
          >

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 tracking-tight drop-shadow-sm">Flash Print N Ship</h1>
            <p className="text-red-50 text-base md:text-lg max-w-md mx-auto md:mx-0 font-medium">Fast, reliable, and premium delivery across the VLU Campus.</p>
          </motion.div>
        </header>

        <div className="max-w-6xl mx-auto px-4 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="-mt-8 mb-8 md:-mt-10 md:mb-10"
          >
            <label className="sr-only" htmlFor="home-search">
              {t.searchPlaceholder}
            </label>
            <div className="relative group">
              <input
                id="home-search"
                type="search"
                autoComplete="off"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card border-none w-full px-5 py-4 pl-12 pr-12 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 focus:ring-2 focus:ring-red-500 outline-none text-foreground placeholder:text-muted-foreground transition-all duration-300 group-hover:shadow-2xl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-red-500 transition-colors" />
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 bg-muted rounded-md transition-colors"
                >
                  {t.close}
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <div className="mt-2 bg-card rounded-lg shadow-md border border-border max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">{t.homeSearchNoResults}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/product/${p.id}`}
                          className="flex items-center gap-3 p-3 hover:bg-red-500/10 transition-colors"
                          onClick={() => setSearchQuery('')}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm truncate">{productName(p)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(p.price)} · {unitLabel(p)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-800 text-white p-6 md:p-8 shadow-xl relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <Tag className="w-12 h-12 opacity-10 absolute right-4 bottom-4" />
              <p className="text-xs uppercase tracking-widest opacity-90 font-medium mb-2 inline-block bg-white/20 px-2 py-1 rounded-md">{t.limitedOffer}</p>
              <h3 className="text-xl md:text-2xl font-bold mt-2">{t.homePromoTitle1}</h3>
              <p className="text-sm opacity-95 mt-2 leading-relaxed max-w-sm">{t.homePromoBody1}</p>
              <div className="mt-5 inline-block font-mono font-bold text-lg bg-black/30 backdrop-blur-md text-white px-5 py-2.5 rounded-xl border border-white/20">
                {t.homePromoCode1}
              </div>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-3xl bg-gradient-to-br from-amber-500 to-rose-600 text-white p-6 md:p-8 shadow-xl relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <Percent className="w-12 h-12 opacity-10 absolute right-4 bottom-4" />
              <p className="text-xs uppercase tracking-widest opacity-90 font-medium mb-2 inline-block bg-white/20 px-2 py-1 rounded-md">{t.popularThisWeek}</p>
              <h3 className="text-xl md:text-2xl font-bold mt-2">{t.homePromoTitle2}</h3>
              <p className="text-sm opacity-95 mt-2 leading-relaxed max-w-sm">{t.homePromoBody2}</p>
              <div className="mt-5 inline-block font-mono font-bold text-lg bg-black/30 backdrop-blur-md text-white px-5 py-2.5 rounded-xl border border-white/20">
                {t.homePromoCode2}
              </div>
            </motion.div>
          </motion.div>


          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <div className="md:col-span-2">
                <h2 className="font-semibold text-lg md:text-2xl mb-4 tracking-tight">{t.ourServices}</h2>
              <div className="space-y-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.div whileHover={{ scale: 1.01 }} key={category.id}>
                      <Link
                        to={`/services/${category.id}`}
                        className="block bg-card rounded-2xl p-5 md:p-6 shadow-sm shadow-black/5 dark:shadow-black/20 border border-border hover:shadow-lg hover:border-red-500/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`${category.color} p-4 rounded-xl`}>
                            <Icon className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base md:text-xl mb-1">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 md:col-span-2 lg:col-span-1">
              <div>
                <h2 className="font-semibold text-lg md:text-xl mb-4 tracking-tight">{t.quickActions}</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.div whileHover={{ scale: 1.02 }} key={action.label}>
                        <Link
                          to={action.to}
                          className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left block"
                        >
                          <Icon className="w-6 h-6 text-red-600 mb-3" />
                          <p className="text-base font-semibold">{action.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{action.hint}</p>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base">{t.homeSameDayTitle}</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.homeSameDayBody}</p>
                  </div>
                </div>
                <Link
                  to="/services/printing"
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  {t.printingServices}
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div>
                <h2 className="font-semibold text-lg md:text-xl mb-1">{t.homeSuggestedTitle}</h2>
                <p className="text-xs text-muted-foreground mb-3">{t.homeSuggestedSubtitle}</p>
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
                  {suggestedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{productName(p)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(p.price)} {unitLabel(p)}
                        </p>
                      </div>
                      <Link
                        to={`/product/${p.id}`}
                        className="text-red-600 text-sm font-medium shrink-0"
                      >
                        {t.add}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-base">{t.pickup}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.libraryA}</p>
                  <Link to="/checkout" className="text-sm text-red-600 font-medium mt-2 inline-flex items-center gap-1">
                    {t.checkout} <span aria-hidden>→</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
