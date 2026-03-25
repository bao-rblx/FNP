import React from 'react';
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Upload, FileText, X } from 'lucide-react';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { QuantityInput } from '../components/QuantityInput';
import { products, type ProductVariant } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants ? product.variants[0] : null
  );
  const [flyAnim, setFlyAnim] = useState<{ src: string; from: DOMRect; to: DOMRect } | null>(null);
  const [cartBounce, setCartBounce] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (!product) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted flex items-center justify-center md:pt-16">
          <p>Product not found</p>
        </div>
      </>
    );
  }

  const minQty = product.minQuantity || 1;
  const isPrintingService = product.category === 'printing';
  const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayDesc = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const categoryLabel =
    product.category === 'printing'
      ? t.printingServices
      : product.category === 'paper'
        ? t.paperProducts
        : product.category === 'supplies'
          ? t.officeSupplies
          : product.category === 'services'
            ? t.servicesCategory
            : t.goodsCategory;

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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
    if (isPrintingService && uploadedFiles.length === 0) {
      toast.error(t.uploadFilesDesc);
      return;
    }
    // Trigger flying image animation
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
    addToCart(product, quantity, isPrintingService ? uploadedFiles : undefined, selectedVariant);
    toast.success(`${t.addToCart}: ${quantity} × ${displayName}`);
  };

  const handleCheckout = () => {
    if (isPrintingService && uploadedFiles.length === 0) {
      toast.error(t.uploadFilesDesc);
      return;
    }
    addToCart(product, quantity, isPrintingService ? uploadedFiles : undefined, selectedVariant);
    navigate('/cart');
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-32 md:pb-8 md:pt-16">
        <Header title="Product Details" showBack />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-border/50 sticky top-24">
                <div className="aspect-square max-h-72 md:aspect-square md:max-h-none bg-muted/20 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                  <img
                    ref={imageRef}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Column - Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Product Info */}
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                <h1 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">{displayName}</h1>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-red-600 tracking-tight">
                    {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
                  </span>
                  <span className="text-muted-foreground font-medium">/ {product.unit}</span>
                </div>
                <p className="text-muted-foreground/90 dark:text-gray-300 leading-relaxed text-base md:text-lg">{displayDesc}</p>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                  <h3 className="font-semibold mb-4 text-base md:text-lg">Tùy chọn:</h3>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 transition-all ${
                          selectedVariant?.id === variant.id 
                            ? 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-semibold' 
                            : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        <span className="font-medium text-sm md:text-base">{variant.name}</span>
                        <span className="text-xs md:text-sm font-semibold mt-1">{formatPrice(variant.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload for Printing Services */}
              {isPrintingService && (
                <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-red-600" />
                    {t.uploadFiles}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">{t.uploadFilesDesc}</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-4 hover:border-red-500 hover:bg-red-50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-muted-foreground">{t.uploadBtn}</span>
                    <span className="text-xs text-muted-foreground">PDF, DOC, DOCX</span>
                  </button>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {uploadedFiles.length} file(s) uploaded:
                      </p>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm text-blue-700 truncate">{file.name}</span>
                            <span className="text-xs text-blue-500 flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-blue-100 rounded flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Specifications */}
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                <h2 className="font-semibold text-lg mb-4">{t.specifications}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{categoryLabel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Unit</span>
                    <span className="font-medium">{product.unit}</span>
                  </div>
                  {product.minQuantity && (
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Min. Quantity</span>
                      <span className="font-medium">{product.minQuantity}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t.estimatedTime}</span>
                    <span className="font-medium">15-30 mins</span>
                  </div>
                </div>
              </div>

              {/* Quantity & Add to Cart - Desktop */}
              <div className="hidden md:block bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-semibold text-lg">{t.quantity}:</span>
                  <QuantityInput
                    value={quantity}
                    onChange={setQuantity}
                    min={minQty}
                  />
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    ref={cartBtnRef}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={cartBounce ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    onClick={handleAddToCart}
                    className="flex-1 border-2 border-red-600 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm text-lg md:text-xl"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {t.addToCart}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="flex-[1.5] bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 text-lg md:text-xl"
                  >
                    {t.checkout} — {formatPrice((selectedVariant?.price ?? product.price) * quantity)}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Action Bar - Mobile */}
        <div className="md:hidden fixed bottom-24 left-0 right-0 bg-card/95 backdrop-blur-md text-card-foreground border-t border-border p-3 z-40 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-md mx-auto flex items-center gap-4">
            {/* Quantity Selector */}
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              min={minQty}
            />

            {/* Action Buttons */}
            <div className="flex-1 flex gap-2">
              <button
                ref={cartBtnRef}
                onClick={handleAddToCart}
                className="w-14 border-2 border-red-600 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shrink-0"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center hover:bg-red-700 transition-colors shadow-md shadow-red-600/30"
              >
                {t.checkout} — {formatPrice((selectedVariant?.price ?? product.price) * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flying image animation portal */}
      <AnimatePresence>
        {flyAnim && (
          <motion.img
            key="fly"
            src={flyAnim.src}
            initial={{
              position: 'fixed',
              left: flyAnim.from.left + flyAnim.from.width / 2 - 40,
              top: flyAnim.from.top + flyAnim.from.height / 2 - 40,
              width: 80,
              height: 80,
              borderRadius: 16,
              objectFit: 'cover',
              zIndex: 9999,
              opacity: 1,
              scale: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
            animate={{
              left: flyAnim.to.left + flyAnim.to.width / 2 - 16,
              top: flyAnim.to.top + flyAnim.to.height / 2 - 16,
              width: 32,
              height: 32,
              borderRadius: 999,
              opacity: 0.3,
              scale: 0.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}