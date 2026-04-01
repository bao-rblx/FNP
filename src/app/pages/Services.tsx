import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Tag, TrendingUp } from 'lucide-react';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { getProducts, type ApiProduct } from '../lib/api';
import { translateUnit } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_KEYS = ['all', 'promotion', 'printing', 'paper', 'supplies', 'services', 'goods'] as const;

export default function Services() {
  const { category = 'all' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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

  const categoryLabels = React.useMemo(() => {
    return {
      all: language === 'vi' ? 'Tất cả' : 'All',
      promotion: language === 'vi' ? 'Khuyến mãi' : 'Promotions',
      printing: language === 'vi' ? 'In ấn' : 'Printing',
      paper: language === 'vi' ? 'Giấy in' : 'Paper',
      supplies: language === 'vi' ? 'Văn phòng phẩm' : 'Supplies',
      services: language === 'vi' ? 'Dịch vụ khác' : 'Other Services',
      goods: language === 'vi' ? 'Đồ lưu niệm' : 'Souvenirs',
    };
  }, [language]);

  const categoryProducts = React.useMemo(() => {
    if (category === 'all') return products;
    if (category === 'promotion') return products.filter(p => p.isPromotion || p.category === 'promotion');
    return products.filter((p) => p.category === category);
  }, [category, products]);

  const titleMap: Record<string, string> = categoryLabels;
  const title = titleMap[category as keyof typeof titleMap] || t.services;

  const formatPrice = (price: number) => {
    if (price === 0) return t.free || (language === 'en' ? 'Free' : 'Miễn phí');
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const productName = (p: ApiProduct) =>
    language === 'en' && p.nameEn ? p.nameEn : p.name;

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-background pb-24 md:pb-12 md:pt-16">
        <Header title={title} showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton />
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted relative z-20 no-scrollbar md:no-scrollbar pt-2"
          >
            {CATEGORY_KEYS.map((catKey) => {
              const active = category === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => navigate(`/services/${catKey}`)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-sm flex items-center gap-2 ${
                    active 
                      ? 'bg-red-600 text-white shadow-red-200 ring-2 ring-red-600/20' 
                      : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                  } ${catKey === 'promotion' ? 'relative overflow-hidden group min-w-[120px] bg-gradient-to-r from-red-500 to-rose-600 !text-white border-none' : ''}`}
                >
                  {catKey === 'promotion' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shine_2s_infinite] group-hover:duration-1000" />
                      <Flame className="w-4 h-4 relative z-10 text-yellow-300 animate-pulse" />
                    </>
                  )}
                  <span className="relative z-10">{categoryLabels[catKey as keyof typeof categoryLabels]}</span>
                </button>
              );
            })}
          </motion.div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shine {
              0% { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(200%) skewX(-15deg); }
            }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categoryProducts.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center text-muted-foreground py-12"
            >
              {t.homeSearchNoResults}
            </motion.p>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {categoryProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm shadow-black/5 hover:shadow-xl hover:shadow-black/10 hover:border-red-500/30 transition-all duration-300 flex flex-col group"
                >
                  <Link to={`/product/${product.id}`} className="block h-full flex flex-col">
                    <div className="aspect-square bg-muted overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                      {product.isPromotion && (
                        <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 uppercase tracking-wider animate-bounce">
                          <Flame className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                          SALE
                        </div>
                      )}
                      <img
                        src={product.image}
                        alt={productName(product)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-medium text-sm md:text-base mb-1.5 line-clamp-2 text-card-foreground group-hover:text-red-600 transition-colors">
                        {productName(product)}
                      </h3>
                      <div className="mt-auto">
                        <p className="text-red-600 font-bold text-base">{formatPrice(product.price)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{translateUnit(product.unit, language)}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
