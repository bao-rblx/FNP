import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Box, CheckCircle2, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { QuantityInput } from '../components/QuantityInput';
import { getProducts, type ApiProduct } from '../lib/api';
import { translateUnit } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { PolyModelViewer } from '../components/PolyModelViewer';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [flyAnim, setFlyAnim] = useState<{ src: string; from: DOMRect; to: DOMRect } | null>(null);
  const [cartBounce, setCartBounce] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        const found = data.find(p => p.id === id);
        if (found) {
          setProduct(found);
          if (found.variants && found.variants.length > 0) {
            setSelectedVariant(found.variants[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (loading) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted flex items-center justify-center md:pt-16">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted flex items-center justify-center md:pt-16">
          <p className="text-xl font-bold text-muted-foreground">{t.homeSearchNoResults}</p>
        </div>
      </>
    );
  }

  const minQty = product.minQuantity || 1;
  const isModelProduct = product.category === 'models' && Boolean(product.modelViewerUrl);
  const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDesc = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  
  const categoryLabel = 
    product.category === 'models' ? (language === 'en' ? '3D Models' : 'Mô hình 3D') :
    (language === 'en' ? '3D Models' : 'Mô hình 3D');

  const handleAddToCart = () => {
    if (imageRef.current && cartBtnRef.current) {
      const from = imageRef.current.getBoundingClientRect();
      const to = cartBtnRef.current.getBoundingClientRect();
      setFlyAnim({ src: product.image, from, to });
      setTimeout(() => {
        setFlyAnim(null);
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 600);
      }, 700);
    }
    // We cast it to any for simplicity here to avoid deep type matching issues with products.ts vs api.ts
    addToCart(product as any, quantity, undefined, selectedVariant);
    toast.success(`${t.addToCart}: ${quantity} × ${displayName}`);
  };

  const handleCheckout = () => {
    addToCart(product as any, quantity, undefined, selectedVariant);
    navigate('/cart');
  };

  return (
    <>
      <DesktopNav />
      <div className={`min-h-screen pb-32 md:pb-8 md:pt-16 ${isModelProduct ? 'bg-[#07080e] text-white' : 'bg-muted'}`}>
        <Header title={t.services} showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className={`rounded-3xl overflow-hidden shadow-xl sticky top-24 ${isModelProduct ? 'border border-violet-400/20 bg-white/[0.04]' : 'bg-card border border-border'}`}>
                {isModelProduct ? (
                  <>
                    <img ref={imageRef} src={product.image} alt={displayName} className="hidden" />
                    <PolyModelViewer modelUrl={product.modelViewerUrl!} accentColor={product.accentColor} name={displayName} />
                  </>
                ) : (
                  <div className="aspect-square bg-muted/20 relative group">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                    <img
                      ref={imageRef}
                      src={product.image}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className={`rounded-[2rem] p-8 shadow-xl border ${isModelProduct ? 'bg-white/[0.04] border-violet-400/20' : 'bg-card border-border'}`}>
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${isModelProduct ? 'border border-cyan-300/30 bg-cyan-300/10 text-cyan-200' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  <Box className="h-4 w-4" />
                  {categoryLabel}
                </div>
                <h1 className="text-3xl font-black mb-3 tracking-tight">{displayName}</h1>
                {product.subName && <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-violet-300">{product.subName}</p>}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`text-4xl font-bold ${isModelProduct ? 'text-cyan-200' : 'text-indigo-400'}`}>
                    {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
                  </span>
                  <span className="text-muted-foreground font-medium">/ {translateUnit(product.unit, language)}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">{displayDesc}</p>
              </div>

              {isModelProduct && (
                <div className="rounded-[2rem] border border-violet-400/20 bg-white/[0.04] p-8 shadow-xl">
                  <h2 className="mb-5 flex items-center gap-2 text-lg font-black uppercase tracking-tight">
                    <Star className="h-5 w-5 text-violet-300" />
                    PolyStore Asset Specs
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Rating', `${product.rating ?? 4.9} / 5 (${product.reviewCount ?? 0})`],
                      ['Polygons', product.polyCount],
                      ['Vertices', product.vertexCount],
                      ['Textures', product.textures],
                      ['Rigged', product.rigged ? 'Yes' : 'No'],
                      ['Animated', product.animated ? 'Yes' : 'No'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                        <p className="mt-1 font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(product.formats ?? ['GLB']).map((format) => (
                      <span key={format} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200">{format}</span>
                    ))}
                    {(product.tags ?? []).map((tag) => (
                      <span key={tag} className="rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1 text-xs font-bold text-violet-200">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {product.variants && product.variants.length > 0 && (
                <div className="bg-card rounded-[2rem] p-8 shadow-xl border border-border">
                  <h3 className="font-bold mb-4 text-lg">Tùy chọn:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                          selectedVariant?.id === v.id
                            ? 'border-indigo-600 bg-indigo-500/10 text-indigo-400 font-bold'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {v.name} - {formatPrice(v.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`rounded-[2rem] p-8 shadow-xl border ${isModelProduct ? 'bg-white/[0.04] border-violet-400/20' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold text-lg">{t.quantity}:</span>
                  <QuantityInput value={quantity} onChange={setQuantity} min={minQty} />
                </div>
                <div className="flex gap-4">
                  <motion.button
                    ref={cartBtnRef}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    animate={cartBounce ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
                    onClick={handleAddToCart}
                    className={`flex-1 border-2 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${isModelProduct ? 'border-cyan-300 text-cyan-200 hover:bg-cyan-300/10' : 'border-indigo-600 text-indigo-400 hover:bg-indigo-500/10'}`}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {t.addToCart}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className={`flex-[1.5] text-white py-4 rounded-2xl font-bold shadow-lg ${isModelProduct ? 'bg-violet-600 shadow-violet-600/30 hover:bg-violet-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-600/30 hover:from-indigo-700 hover:to-purple-700'}`}
                  >
                    {t.checkout}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {flyAnim && (
          <motion.img
            src={flyAnim.src}
            initial={{
              position: 'fixed', zIndex: 9999, borderRadius: 20, objectFit: 'cover',
              left: flyAnim.from.left + flyAnim.from.width/2 - 50,
              top: flyAnim.from.top + flyAnim.from.height/2 - 50,
              width: 100, height: 100, opacity: 1
            }}
            animate={{
              left: flyAnim.to.left + flyAnim.to.width/2 - 20,
              top: flyAnim.to.top + flyAnim.to.height/2 - 20,
              width: 40, height: 40, opacity: 0.5, borderRadius: 100
            }}
            transition={{ duration: 0.7, ease: "anticipate" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}