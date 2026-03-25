import { useState, useEffect, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { MapPin, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ApiError } from '../lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { loadNotifyPrefs, requestPushPermission, saveNotifyPrefs } from '../lib/notificationPrefs';
import confetti from 'canvas-confetti';

export default function Checkout() {
  const { user, authReady } = useAuth();
  const { cart, getCartTotal, placeOrder, discountRate, discountCode, applyPromoCode } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const hasPickupOnly = cart.some(item => item.pickupOnly);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>(hasPickupOnly ? 'pickup' : 'pickup');

  useEffect(() => {
    if (hasPickupOnly && deliveryMethod !== 'pickup') {
      setDeliveryMethod('pickup');
    }
  }, [hasPickupOnly, deliveryMethod]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState(t.libraryA);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [deliveryTier, setDeliveryTier] = useState<'saver' | 'standard' | 'priority'>('standard');
  const [scheduleTime, setScheduleTime] = useState('ASAP');
  const [promoInput, setPromoInput] = useState(discountCode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState<string | null>(null);

  const deliveryFeeMap = {
    saver: 10000,
    standard: 15000,
    priority: 30000
  };
  const deliveryFee = deliveryMethod === 'delivery' ? deliveryFeeMap[deliveryTier] : 0;
  const subtotalAfterDiscount = getCartTotal() * (1 - discountRate);
  const finalTotal = subtotalAfterDiscount + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();

    if (finalTotal < 5000) {
      toast.error('Minimum order value is 5,000đ');
      return;
    }

    if (!user) {
      toast.error(t.loginRequiredCheckout);
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      toast.error(t.enterAddress);
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = await placeOrder(
        deliveryMethod === 'delivery' ? deliveryAddress : undefined,
        deliveryMethod === 'pickup' ? pickupLocation : undefined,
        paymentMethod === 'card' ? 'card' : 'cash',
        scheduleTime === 'ASAP' ? '15-30 mins' : scheduleTime
      );

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#FCD34D', '#10B981', '#3B82F6']
      });

      toast.success(t.orderSuccess);

      navigate(`/order/${orderId}`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.error(t.loginRequiredCheckout);
      } else {
        toast.error(t.orderError);
      }
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    navigate('/cart', { replace: true });
    return null;
  }

  if (!authReady) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-muted flex items-center justify-center md:pt-16">
          <p className="text-muted-foreground text-sm">{t.processing}</p>
        </div>
      </>
    );
  }

  if (!user) {
    return <Navigate to="/auth?return=/checkout" replace />;
  }

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-32 md:pb-8 md:pt-16">
        <Header title={t.checkout} showBack />

        <form onSubmit={handlePlaceOrder}>
          <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {/* Left Column - Delivery & Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Method */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm shadow-black/5 ring-1 ring-border/50"
                >
                  <h2 className="font-bold text-lg mb-5 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    {t.deliveryMethod}
                  </h2>
                  
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      deliveryMethod === 'pickup' ? 'border-red-600 bg-red-50 dark:bg-red-950/30' : 'border-border hover:border-red-500'
                    }`}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === 'pickup'}
                        onChange={() => setDeliveryMethod('pickup')}
                        className="mt-1 w-4 h-4 text-red-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{t.pickup}</p>
                        <p className="text-sm text-muted-foreground mb-2">{t.pickupDesc}</p>
                        {deliveryMethod === 'pickup' && (
                          <select
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option>{t.libraryA}</option>
                            <option>{t.towerA}</option>
                            <option>{t.towerF}</option>
                            <option>{t.towerG}</option>
                            <option>{t.towerJ}</option>
                            <option>{t.towerI}</option>
                            <option>{t.mainGate}</option>
                          </select>
                        )}
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 border-2 rounded-lg transition-colors ${
                      hasPickupOnly
                        ? 'opacity-50 cursor-not-allowed border-border'
                        : deliveryMethod === 'delivery' ? 'border-red-600 bg-red-50 dark:bg-red-950/30' : 'border-border hover:border-red-500 cursor-pointer'
                    }`}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === 'delivery'}
                        onChange={() => !hasPickupOnly && setDeliveryMethod('delivery')}
                        disabled={hasPickupOnly}
                        className="mt-1 w-4 h-4 text-red-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{t.delivery}</p>
                        <p className="text-sm text-muted-foreground mb-2">{t.deliveryDesc}</p>
                        {hasPickupOnly && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">
                            Not available for strictly in-person services
                          </p>
                        )}
                        {deliveryMethod === 'delivery' && !hasPickupOnly && (
                          <div className="space-y-3 mt-2">
                            <input
                              type="text"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              placeholder={t.addressPlaceholder}
                              className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
                              required={deliveryMethod === 'delivery'}
                            />
                            
                            <div className="bg-background dark:bg-background/50 p-3 rounded-lg border border-border">
                              <p className="text-sm font-medium mb-2">Delivery Speed</p>
                              <select
                                value={deliveryTier}
                                onChange={(e) => setDeliveryTier(e.target.value as any)}
                                className="w-full mb-3 px-3 py-2 border border-border rounded-lg text-sm outline-none bg-transparent"
                              >
                                <option value="saver">Saver Delivery (10,000đ)</option>
                                <option value="standard">Standard Delivery (15,000đ)</option>
                                <option value="priority">Priority Delivery (30,000đ)</option>
                              </select>

                              <p className="text-sm font-medium mb-2">Schedule Time</p>
                              <select
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none bg-transparent"
                              >
                                <option value="ASAP">As soon as possible</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="2:00 PM">2:00 PM</option>
                                <option value="4:00 PM">4:00 PM</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </motion.div>

                {/* Estimated Time */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm shadow-black/5 ring-1 ring-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-base">{t.estimatedTime}</p>
                      <p className="text-sm text-muted-foreground">
                        {deliveryMethod === 'pickup' ? '5-10 mins' : scheduleTime === 'ASAP' ? (deliveryTier === 'priority' ? '15-20 mins' : deliveryTier === 'saver' ? '45-60 mins' : '30-45 mins') : scheduleTime}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm shadow-black/5 ring-1 ring-border/50"
                >
                  <h2 className="font-bold text-lg mb-5 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-red-600" />
                    {t.paymentMethod}
                  </h2>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'card' ? 'border-red-600 bg-red-50 dark:bg-red-950/30' : 'border-border hover:border-red-500'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{t.cardPayment}</p>
                        <p className="text-sm text-muted-foreground">{t.cardPaymentDesc}</p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">V</div>
                        <div className="w-8 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center">M</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cash' ? 'border-red-600 bg-red-50 dark:bg-red-950/30' : 'border-border hover:border-red-500'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{t.cash}</p>
                        <p className="text-sm text-muted-foreground">{t.cashDesc}</p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Order Summary */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Promo Code */}
                <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 shadow-sm shadow-black/5 ring-1 ring-border/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.promoCode}
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 uppercase bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const ok = applyPromoCode(promoInput);
                        if (ok) toast.success('Promo code applied!');
                        else toast.error('Invalid promo code');
                      }}
                      className="px-4 py-2 bg-muted/50 text-muted-foreground rounded-lg text-sm font-medium hover:bg-accent"
                    >
                      {t.apply}
                    </button>
                  </div>
                </div>

                <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50 sticky top-24">
                  <h2 className="font-bold text-xl mb-6 tracking-tight">{t.orderSummary}</h2>
                  
                  <div className="space-y-2 mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        {item.files && item.files.length > 0 && (
                          <div className="text-xs text-blue-600 ml-2">
                            📎 {item.files.length} file(s)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.subtotal}</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    {discountRate > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount ({discountRate * 100}%)</span>
                        <span>-{formatPrice(getCartTotal() * discountRate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.shippingFee}</span>
                      <span className={deliveryFee === 0 ? "text-green-600" : "text-card-foreground"}>
                        {deliveryFee === 0 ? t.free : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">{t.total}</span>
                      <span className="font-bold text-lg text-red-600">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Place Order Button */}
                  <motion.button
                    whileHover={{ scale: isProcessing || finalTotal < 5000 ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing || finalTotal < 5000 ? 1 : 0.98 }}
                    type="submit"
                    disabled={isProcessing || finalTotal < 5000}
                    className="hidden md:flex w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed items-center justify-center gap-3 mt-8 text-lg shadow-lg shadow-red-600/30"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        {t.placeOrder}
                      </>
                    )}
                  </motion.button>
                  {finalTotal < 5000 && (
                    <p className="text-sm text-red-500 text-center font-medium mt-3 bg-red-50 dark:bg-red-500/10 py-2 rounded-lg">
                      Minimum order value is 5,000đ
                    </p>
                  )}

                  {/* Terms */}
                  <p className="text-xs text-muted-foreground text-center mt-6">
                    {t.termsAgreement}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Bottom Action Bar */}
          <div className="md:hidden fixed bottom-20 left-0 right-0 bg-card/95 backdrop-blur-md text-card-foreground border-t border-border p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
            <div className="max-w-md mx-auto">
              <motion.button
                whileTap={{ scale: isProcessing || finalTotal < 5000 ? 1 : 0.98 }}
                type="submit"
                disabled={isProcessing || finalTotal < 5000}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t.placeOrder}
                  </>
                )}
              </motion.button>
              {finalTotal < 5000 && (
                <p className="text-sm text-red-500 text-center font-medium mt-2">
                  Minimum order value is 5,000đ
                </p>
              )}
            </div>
          </div>
        </form>
      </div>

      <Dialog open={!!showPushPrompt} onOpenChange={(open) => {
        if (!open && showPushPrompt) navigate(`/order/${showPushPrompt}`, { replace: true });
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.enablePushTitle}</DialogTitle>
            <DialogDescription>{t.enablePushDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (showPushPrompt) navigate(`/order/${showPushPrompt}`, { replace: true });
                setShowPushPrompt(null);
              }}
              className="w-full sm:w-auto"
            >
              {t.skipBtn}
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                const perm = await requestPushPermission();
                if (perm === 'granted') {
                  const prefs = loadNotifyPrefs();
                  saveNotifyPrefs({ ...prefs, pushEnabled: true });
                } else if (perm === 'denied') {
                  toast.error(t.pushPermissionDenied);
                }
                if (showPushPrompt) navigate(`/order/${showPushPrompt}`, { replace: true });
                setShowPushPrompt(null);
              }}
            >
              {t.enablePushBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}