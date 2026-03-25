import React from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { products } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_KEYS = ['printing', 'paper', 'supplies', 'services', 'goods'] as const;

export default function Services() {
  const { category } = useParams<{ category: string }>();
  const { t, language } = useLanguage();

  const categoryProducts = products.filter((p) => p.category === category);

  const titleMap: Record<string, string> = {
    printing: t.printingServices,
    paper: t.paperProducts,
    supplies: t.officeSupplies,
    services: t.servicesCategory,
    goods: t.goodsCategory,
  };

  const title = (category && titleMap[category]) || t.services;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const productName = (p: (typeof products)[number]) =>
    language === 'en' && p.nameEn ? p.nameEn : p.name;

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-16">
        <Header title={title} showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted"
          >
            {CATEGORY_KEYS.map((key) => (
              <Link
                key={key}
                to={`/services/${key}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  category === key
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-card text-foreground border border-border hover:border-red-300 hover:bg-accent'
                }`}
              >
                {titleMap[key]}
              </Link>
            ))}
          </motion.div>

          {categoryProducts.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-12">{t.homeSearchNoResults}</motion.p>
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
                        <p className="text-xs text-muted-foreground mt-0.5">{product.unit}</p>
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
