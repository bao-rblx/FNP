import { useState } from 'react';
import { Trash2, ShoppingBag, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { QuantityInput } from '../components/QuantityInput';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, getCartTotal, discountRate } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const finalTotal = getCartTotal() * (1 - discountRate);

  const goToCheckout = () => {
    if (!user) {
      toast.info(t.loginRequiredCheckout);
      navigate('/auth?return=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (cart.length === 0) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted pb-20 md:pb-8 md:pt-16">
          <Header title={t.myCart} />
          
          <div className="max-w-6xl mx-auto px-4 pt-20 text-center">
            <div className="bg-muted/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t.emptyCart}</h2>
            <p className="text-muted-foreground mb-6">
              {t.emptyCartDesc}
            </p>
            <Link
              to="/services/printing"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              {t.viewServices}
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-44 md:pb-8 md:pt-16">
        <Header title={t.myCart} />

        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Main Cart Items Area */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
                    className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm shadow-black/5 ring-1 ring-border/50 group"
                  >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-2">
                        <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600 p-1 flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-muted-foreground text-xs md:text-sm mb-2">{item.unit}</p>
                      
                      {/* Show uploaded files if printing service */}
                      {item.category === 'printing' && item.files && item.files.length > 0 && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
                          <div className="flex items-center gap-1 text-blue-700 font-medium mb-1">
                            <FileText className="w-3 h-3" />
                            <span>{item.files.length} file(s)</span>
                          </div>
                          {item.files.map((file, idx) => (
                            <div key={idx} className="text-blue-600 truncate">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-red-600 font-semibold text-sm md:text-base">
                          {formatPrice(item.price)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <QuantityInput
                          value={item.quantity}
                          onChange={(newQty) => updateQuantity(item.id, newQty)}
                          min={item.minQuantity || 1}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.itemTotal}</span>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div 
              className="lg:col-span-1 space-y-6"
            >
              {/* Order Summary */}
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50 sticky top-24">
                <h2 className="font-bold text-xl mb-6 tracking-tight">{t.orderSummary}</h2>
                <div className="space-y-4 text-sm md:text-base border-t border-border/50 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">{t.subtotal}</span>
                    <span className="font-semibold">{formatPrice(getCartTotal())}</span>
                  </div>
                  {discountRate > 0 && (
                    <div className="flex justify-between items-center text-red-600 bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl">
                      <span className="font-medium">Discount ({discountRate * 100}%)</span>
                      <span className="font-bold">-{formatPrice(getCartTotal() * discountRate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <span className="font-bold text-lg">{t.total}</span>
                    <span className="font-black text-2xl text-red-600 tracking-tight">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button - Desktop */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToCheckout}
                  className="hidden md:flex w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 items-center justify-center gap-3 mt-8 text-lg"
                >
                  {t.checkout}
                  <span aria-hidden>→</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="md:hidden fixed bottom-24 left-0 right-0 bg-card/95 backdrop-blur-md text-card-foreground border-t border-border p-4 z-40 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={goToCheckout}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              {t.checkout} - {formatPrice(getCartTotal() * (1 - discountRate))}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}