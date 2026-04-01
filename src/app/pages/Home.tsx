import React, { useMemo, useState, useEffect } from 'react';
import {
  Clock,
  FileText,
  Package,
  Percent,
  Printer,
  ScanLine,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  Flame,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { DesktopNav } from '../components/DesktopNav';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getProducts, type ApiProduct } from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const SUGGESTED_IDS = ['print-a4', 'paper-a4', 'supply-pen'] as const;

export default function Home() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleCopyCoupon = () => {
    if (!user) {
      toast.error(language === 'en' ? 'You have to log in to use this deal' : 'Bạn phải đăng nhập để sử dụng ưu đãi này');
      return;
    }
    void navigator.clipboard.writeText('FREEVLU');
    toast.success(t.copiedToClipboard);
  };

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

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const blob = [p.name, p.description, p.nameEn, p.descriptionEn, p.category]
        .filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    }).slice(0, 6);
  }, [searchQuery, products]);

  const productName = (p: ApiProduct) => (language === 'en' && p.nameEn ? p.nameEn : p.name);
  const formatPrice = (price: number) => {
    if (price === 0) return t.free || (language === 'en' ? 'Free' : 'Miễn phí');
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-background pb-24 md:pb-12 md:pt-16">
        <header className="relative bg-gradient-to-br from-red-600 via-red-500 to-rose-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544650030-3c9baf62427a?h=600')] opacity-10 mix-blend-overlay bg-cover" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">FLASH <span className="text-red-200">N</span> PRINT</h1>
                <p className="text-lg md:text-xl text-red-50 font-medium max-w-xl opacity-90">
                  {language === 'vi' ? 'Dịch vụ in ấn & giao hàng cao cấp cho cộng đồng Văn Lang.' : 'Premium print & campus delivery for Van Lang community.'}
                </p>
              </motion.div>

              {/* Store Announcement (Right side) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-4 px-6 py-5 rounded-3xl border-2 border-dashed border-white/40 bg-white/10 backdrop-blur-sm self-start md:self-center"
              >
                <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-0.5 leading-none">{language === 'vi' ? 'Thông báo' : 'Announcement'}</p>
                  <p className="font-extrabold text-white tracking-wide text-lg leading-tight">
                    {t.storeAnnouncement}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
          {/* Search Box */}
          <Card className="p-2 rounded-3xl shadow-2xl border-none ring-1 ring-black/5 bg-card/80 backdrop-blur-md">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full h-16 pl-14 pr-6 bg-transparent outline-none text-lg font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-5 bg-muted p-1 rounded-full"><Clock className="w-4 h-4 rotate-45" /></button>
              )}
            </div>
            <AnimatePresence>
              {searchQuery && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border/50">
                  <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {loading ? (
                      <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : searchResults.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">{t.homeSearchNoResults}</p>
                    ) : (
                      searchResults.map(p => (
                        <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-4 p-3 hover:bg-muted rounded-2xl transition-colors">
                          <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{productName(p)}</p>
                            <p className="text-xs text-red-600 font-bold">{formatPrice(p.price)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Categories */}
              <section>
                <h2 className="text-2xl font-black mb-8 tracking-tighter uppercase flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-600" />
                  {t.ourServices}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link key={cat.id} to={`/services/${cat.id}`}>
                        <Card className="p-6 h-full rounded-[2rem] border-border/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 flex items-center gap-6 group hover:-translate-y-1">
                          <div className={`${cat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm flex-shrink-0`}><Icon className="w-8 h-8" /></div>
                          <div className="flex flex-col justify-center">
                            <h3 className="font-bold text-lg leading-snug">{cat.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}

                  <Link to="/services/all" className="group">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          '0 0 0px rgba(239, 68, 68, 0)', 
                          '0 0 10px rgba(239, 68, 68, 0.2)', 
                          '0 0 0px rgba(239, 68, 68, 0)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-6 h-full rounded-[2rem] border-2 border-dashed border-red-200 dark:border-red-900/40 bg-red-50/10 dark:bg-red-950/5 flex items-center gap-6 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group hover:-translate-y-1"
                    >
                      <div className="p-4 bg-red-600 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-red-500/20">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-red-600 dark:text-red-400 text-lg leading-snug">{t.viewAllServices}</h3>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">{language === 'en' ? 'Explore 50+' : 'Khám phá 50+'}</p>
                      </div>
                    </motion.div>
                  </Link>
                </div>

              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="p-6 rounded-[2rem] bg-card text-card-foreground border-red-100 dark:border-red-900/40 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors" />
                <div className="relative z-10">
                  <Tag className="w-10 h-10 text-red-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t.homeFirstOrderTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{t.homeFirstOrderBody}</p>
                  <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-800 text-center font-mono text-xl font-bold tracking-widest text-red-600 dark:text-red-400">
                    FREEVLU
                  </div>
                  <Button 
                    className="w-full mt-6 bg-red-600 hover:bg-red-700 h-12 rounded-xl font-bold text-white shadow-lg shadow-red-500/20"
                    onClick={handleCopyCoupon}
                  >
                    {language === 'vi' ? 'Nhận Ngay' : 'Claim Now'}
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="font-bold text-xl px-2">{t.quickActions}</h3>
                {quickActions.map(act => (
                  <Link key={act.label} to={act.to} className="block">
                    <Card className="p-4 rounded-2xl border-border/50 hover:border-red-500/50 flex items-center gap-4 transition-all hover:bg-muted group">
                      <div className="p-3 bg-muted group-hover:bg-card rounded-xl transition-colors"><act.icon className="w-6 h-6 text-red-600" /></div>
                      <div><p className="font-bold text-sm">{act.label}</p><p className="text-xs text-muted-foreground">{act.hint}</p></div>
                    </Card>
                  </Link>
                ))}
              </div>

              <Card className="p-6 rounded-[2rem] border-dashed border-2 border-red-200 bg-red-50/30 dark:bg-red-950/10 dark:border-red-900/40">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600"><Clock className="w-6 h-6" /></div>
                  <div><h3 className="font-bold">{t.homeSameDayTitle}</h3><p className="text-xs text-muted-foreground leading-relaxed">{t.homeSameDayBody}</p></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
