import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { MapPin, Clock, CreditCard, CheckCircle2, User, Calendar, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translateUnit } from '../data/products';
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
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { loadNotifyPrefs, requestPushPermission, saveNotifyPrefs } from '../lib/notificationPrefs';
import { isValidEmail } from '../lib/authValidation';
import { Card } from '../components/ui/card';
import confetti from 'canvas-confetti';

export default function Checkout() {
  const { user, authReady } = useAuth();
  const { cart, getCartTotal, placeOrder, placeGuestOrder, discountRate, discountCode, applyPromoCode } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const hasPickupOnly = cart.some(item => item.pickupOnly);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    const ok = await applyPromoCode(promoInput);
    setIsApplyingPromo(false);
    if (ok) toast.success(t.authSuccess);
    else toast.error(t.orderError);
  };
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
  
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState(
    new Date(Date.now() + 30 * 60000).toTimeString().slice(0, 5)
  );

  const [promoInput, setPromoInput] = useState(discountCode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState<string | null>(null);

  const [guestEmail, setGuestEmail] = useState('');

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

    if (finalTotal > 0 && finalTotal < 5000) {
      toast.error(language === 'en' ? 'Minimum order value is 5,000đ' : 'Giá trị đơn hàng tối thiểu là 5.000đ');
      return;
    }

    if (!user) {
      const email = guestEmail.trim();
      if (!isValidEmail(email)) { toast.error(t.guestEmailInvalid); return; }
      if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) { toast.error(t.enterAddress); return; }

      setIsProcessing(true);
      try {
        const orderId = await placeGuestOrder(
          '', '', email,
          deliveryMethod === 'delivery' ? deliveryAddress : undefined,
          deliveryMethod === 'pickup' ? pickupLocation : undefined,
          paymentMethod === 'card' ? 'card' : 'cash',
          undefined, // estimatedTime - server calculates
          deliveryDate,
          deliveryTime,
          finalTotal
        );
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast.success(t.orderSuccess);
        navigate(`/order/guest/${orderId}`, { replace: true });
      } catch {
        toast.error(t.orderError);
        setIsProcessing(false);
      }
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
        undefined, // estimatedTime
        deliveryDate,
        deliveryTime,
        finalTotal
      );
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success(t.orderSuccess);
      if (paymentMethod === 'card') {
        navigate(`/order/${orderId}`, { replace: true });
        return;
      }
      const prefs = loadNotifyPrefs();
      if (!prefs.pushEnabled && 'Notification' in window && Notification.permission === 'default') {
        setShowPushPrompt(orderId);
      } else {
        navigate(`/order/${orderId}`, { replace: true });
      }
    } catch {
      toast.error(t.orderError);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    navigate('/cart', { replace: true });
    return null;
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.processing}</p>
      </div>
    );
  }

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-32 md:pb-8 md:pt-16">
        <Header title={t.checkout} showBack />

        <form onSubmit={handlePlaceOrder}>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <BackButton />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                
                {!user && (
                 <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border">
                    <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                      <User className="w-6 h-6 text-primary" />
                      {t.guestCheckoutTitle}
                    </h2>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="email@example.com" />
                      <p className="text-xs text-muted-foreground">{t.guestEmailInvalid}</p>
                    </div>
                 </Card>
                )}

                <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border">
                  <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    {t.deliveryMethod}
                  </h2>

                  <div className="p-5 rounded-2xl border-2 border-indigo-600 bg-indigo-500/10 text-card-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                        3D
                      </div>
                      <div>
                        <p className="font-bold">{t.pickup}</p>
                        <p className="text-xs text-muted-foreground">{t.pickupDesc}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border">
                  <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    {t.paymentMethod}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button type="button" onClick={() => setPaymentMethod('card')} className={`p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-500/10' : 'border-border'}`}>
                      <p className="font-bold">{t.cardPayment}</p>
                      <p className="text-xs text-muted-foreground">{t.cardPaymentDesc}</p>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('cash')} className={`p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-500/10' : 'border-border'}`}>
                      <p className="font-bold">{t.cash}</p>
                      <p className="text-xs text-muted-foreground">{t.cashDesc}</p>
                    </button>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 rounded-3xl shadow-lg border-border bg-card sticky top-24">
                  <h2 className="font-bold text-xl mb-6">{t.orderSummary}</h2>
                  <div className="space-y-3 mb-6 max-h-60 overflow-auto pr-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-4">{language === 'en' ? item.nameEn || item.name : item.name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 flex gap-2">
                    <Input 
                      placeholder={t.promoCodePlaceholder || 'Mã giảm giá (ví dụ: POLY100)'} 
                      value={promoInput} 
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      className="rounded-xl h-12"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="h-12 px-6 rounded-xl border-dashed border-2 hover:bg-muted"
                    >
                      {isApplyingPromo ? <RefreshCw className="w-4 h-4 animate-spin" /> : (t.applyPromo || 'Áp dụng')}
                    </Button>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.subtotal}</span>
                      <span className="font-medium">{formatPrice(getCartTotal())}</span>
                    </div>
                    {discountRate > 0 && (
                      <div className="flex justify-between text-sm text-cyan-400 font-medium">
                        <span>Discount ({discountRate * 100}%)</span>
                        <span className="font-medium">-{formatPrice(getCartTotal() * discountRate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.shippingFee}</span>
                      <span className="font-medium text-green-500">{t.free}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-border">
                      <span className="font-bold">{t.total}</span>
                      <span className="font-black text-2xl text-indigo-500">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={isProcessing || finalTotal < 5000} className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold mt-8 shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-purple-700">
                    {isProcessing ? t.processing : t.placeOrder}
                  </Button>
                  
                  {finalTotal > 0 && finalTotal < 5000 && <p className="text-xs text-red-500 text-center mt-3 font-medium">Đơn hàng tối thiểu 5.000đ</p>}
                  <p className="text-[10px] text-muted-foreground text-center mt-6">{t.termsAgreement}</p>
                </Card>
              </div>
            </motion.div>
          </div>
        </form>
      </div>

      <Dialog open={!!showPushPrompt} onOpenChange={() => navigate(`/order/${showPushPrompt}`, { replace: true })}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle>{t.enablePushTitle}</DialogTitle><DialogDescription>{t.enablePushDesc}</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => navigate(`/order/${showPushPrompt}`, { replace: true })}>{t.skipBtn}</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={async () => {
               await requestPushPermission();
               navigate(`/order/${showPushPrompt}`, { replace: true });
            }}>{t.enablePushBtn}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
