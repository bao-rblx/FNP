import React, { useMemo, useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Tag,
  Flame,
  ChevronRight,
  Box,
  Star,
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
    void navigator.clipboard.writeText('POLY10');
    toast.success(t.copiedToClipboard);
  };

  const categories = [
    {
      id: 'models',
      name: language === 'en' ? '3D Models' : 'Mô hình 3D',
      icon: Box,
      color: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
      description: language === 'en' ? 'Interactive game-ready 3D GLB assets' : 'Tài nguyên GLB tương tác, sẵn sàng sử dụng',
    },
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
      <div className="min-h-screen bg-[#07080e] text-white pb-24 md:pb-12 md:pt-16">
        <header className="relative bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.38),transparent_35%),linear-gradient(135deg,#06070d_0%,#111827_45%,#2e1065_100%)] text-white overflow-hidden border-b border-violet-400/20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                  PolyStore
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">POLY<span className="text-violet-300">STORE</span></h1>
                <p className="text-lg md:text-xl text-violet-50 font-medium max-w-xl opacity-90">
                  {language === 'vi' ? 'Cửa hàng mô hình 3D tương tác dành cho game, hoạt hình và dự án sáng tạo.' : 'Interactive 3D model shopping for games, animation, and creative projects.'}
                </p>
              </motion.div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
          {/* Search Box */}
          <Card className="p-2 rounded-3xl shadow-2xl border border-violet-400/20 bg-[#111827]/90 text-white backdrop-blur-md">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full h-16 pl-14 pr-6 bg-transparent outline-none text-lg font-medium placeholder:text-slate-400"
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
                      <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                    ) : searchResults.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">{t.homeSearchNoResults}</p>
                    ) : (
                      searchResults.map(p => (
                        <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-4 p-3 hover:bg-violet-500/10 rounded-2xl transition-colors">
                          <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{productName(p)}</p>
                             <p className="text-xs text-cyan-300 font-bold">{formatPrice(p.price)}</p>
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
                  <Flame className="w-6 h-6 text-cyan-300" />
                  {t.ourServices}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link key={cat.id} to={`/services/${cat.id}`}>
                        <Card className="p-6 h-full rounded-[2rem] border-violet-400/20 bg-white/[0.04] text-white hover:bg-violet-500/10 transition-all duration-300 flex items-center gap-6 group hover:-translate-y-1">
                          <div className={`${cat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm flex-shrink-0`}><Icon className="w-8 h-8" /></div>
                          <div className="flex flex-col justify-center">
                            <h3 className="font-bold text-lg leading-snug">{cat.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

              </section>
              <section>
                <h2 className="text-2xl font-black mb-6 tracking-tighter uppercase flex items-center gap-2">
                  <Star className="w-6 h-6 text-violet-300" />
                  {language === 'en' ? 'Featured 3D Models' : 'Mô hình 3D nổi bật'}
                </h2>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.filter((p) => p.category === 'models').slice(0, 6).map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group overflow-hidden rounded-[1.75rem] border border-violet-400/20 bg-white/[0.04] shadow-xl shadow-black/20 transition-all hover:-translate-y-1 hover:border-cyan-300/50">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={p.image} alt={productName(p)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#07080e] via-transparent to-transparent" />
                        <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-md">GLB</div>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">{p.subName}</p>
                        <h3 className="mt-2 line-clamp-2 text-lg font-black leading-tight">{productName(p)}</h3>
                        <p className="mt-3 text-cyan-200 font-black">{formatPrice(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="p-6 rounded-[2rem] bg-white/[0.04] text-white border-violet-400/20 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-violet-500/10 group-hover:bg-violet-500/15 transition-colors" />
                <div className="relative z-10">
                   <Tag className="w-10 h-10 text-cyan-300 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t.homeFirstOrderTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{t.homeFirstOrderBody}</p>
                   <div className="bg-black/30 p-4 rounded-2xl border border-cyan-300/30 text-center font-mono text-xl font-bold tracking-widest text-cyan-200">
                    POLY10
                  </div>
                  <Button 
                     className="w-full mt-6 bg-violet-600 hover:bg-violet-500 h-12 rounded-xl font-bold text-white shadow-lg shadow-violet-500/20"
                    onClick={handleCopyCoupon}
                  >
                    {language === 'vi' ? 'Nhận Ngay' : 'Claim Now'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
