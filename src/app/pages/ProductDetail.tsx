import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Upload, FileText, X } from 'lucide-react';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { QuantityInput } from '../components/QuantityInput';
import { getProducts, type ApiProduct } from '../lib/api';
import { translateUnit } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
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
  const isPrintingService = product.category === 'printing';
  const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDesc = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  
  const categoryLabel = 
    product.category === 'printing' ? t.printingServices :
    product.category === 'paper' ? t.paperProducts :
    product.category === 'supplies' ? t.officeSupplies :
    product.category === 'services' ? t.servicesCategory :
    t.goodsCategory;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'doc', 'docx'].includes(extension || '');
    });
    if (validFiles.length !== files.length) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} file(s) uploaded`);
  };

  const handleAddToCart = () => {
    if (isPrintingService && uploadedFiles.length === 0) {
      toast.error(t.uploadFilesDesc);
      return;
    }
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
    addToCart(product as any, quantity, isPrintingService ? uploadedFiles : undefined, selectedVariant);
    toast.success(`${t.addToCart}: ${quantity} × ${displayName}`);
  };

  const handleCheckout = () => {
    if (isPrintingService && uploadedFiles.length === 0) {
      toast.error(t.uploadFilesDesc);
      return;
    }
    addToCart(product as any, quantity, isPrintingService ? uploadedFiles : undefined, selectedVariant);
    navigate('/cart');
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-32 md:pb-8 md:pt-16">
        <Header title={t.services} showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-card rounded-3xl overflow-hidden shadow-xl border border-border sticky top-24">
                <div className="aspect-square bg-muted/20 relative group">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    ref={imageRef}
                    src={product.image}
                    alt={displayName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-card rounded-[2rem] p-8 shadow-xl border border-border">
                <h1 className="text-3xl font-black mb-3 tracking-tight">{displayName}</h1>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-red-600">
                    {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
                  </span>
                  <span className="text-muted-foreground font-medium">/ {translateUnit(product.unit, language)}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">{displayDesc}</p>
              </div>

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
                            ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        <div className="text-sm md:text-base">{language === 'en' && v.nameEn ? v.nameEn : v.name}</div>
                        <div className="text-xs font-bold mt-1 opacity-80">{formatPrice(v.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isPrintingService && (
                <div className="bg-card rounded-[2rem] p-8 shadow-xl border border-border">
                  <h2 className="font-bold mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-red-600" />
                    {t.uploadFiles}
                  </h2>
                  <input
                    ref={fileInputRef}
                    type="file" multiple accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-2xl p-6 hover:border-red-500 hover:bg-red-50 transition-all flex flex-col items-center gap-3"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="font-bold text-muted-foreground">{t.uploadBtn}</span>
                    <span className="text-xs text-muted-foreground opacity-70">PDF, DOC, DOCX</span>
                  </button>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                          <div className="flex items-center gap-3 truncate">
                            <FileText className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <button onClick={() => setUploadedFiles(f => f.filter((_, i) => i !== idx))} className="p-1 hover:bg-red-100 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-card rounded-[2rem] p-8 shadow-xl border border-border">
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
                    className="flex-1 border-2 border-red-600 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {t.addToCart}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="flex-[1.5] bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-600/30 hover:bg-red-700"
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