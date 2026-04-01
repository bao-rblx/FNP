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

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

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
      const name = guestName.trim();
      const phone = guestPhone.trim();
      if (!name) { toast.error(t.guestNameInvalid); return; }
      if (!phone || phone.length < 8) { toast.error(t.guestPhoneInvalid); return; }
      if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) { toast.error(t.enterAddress); return; }
      
      setIsProcessing(true);
      try {
        const orderId = await placeGuestOrder(
          name, phone,
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
                      <User className="w-6 h-6 text-red-600" />
                      {t.guestCheckoutTitle}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.guestName}</Label>
                        <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nguyễn Văn A" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.guestPhone}</Label>
                        <Input value={guestPhone} onChange={e => setGuestPhone(e.target.value.replace(/\D/g, ''))} placeholder="0912..." />
                      </div>
                    </div>
                 </Card>
                )}

                <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border">
                  <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-red-600" />
                    {t.deliveryMethod}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-4 rounded-2xl border-2 text-left transition-all ${deliveryMethod === 'pickup' ? 'border-red-600 bg-red-50 text-red-900' : 'border-border hover:border-red-200'}`}>
                      <p className="font-bold">{t.pickup}</p>
                      <p className="text-xs opacity-80">{t.pickupDesc}</p>
                    </button>
                    <button type="button" disabled={hasPickupOnly} onClick={() => setDeliveryMethod('delivery')} className={`p-4 rounded-2xl border-2 text-left transition-all ${deliveryMethod === 'delivery' ? 'border-red-600 bg-red-50 text-red-900' : 'border-border hover:border-red-200'} ${hasPickupOnly ? 'opacity-50 grayscale' : ''}`}>
                      <p className="font-bold">{t.delivery}</p>
                      <p className="text-xs opacity-80">{t.deliveryDesc}</p>
                    </button>
                  </div>

                  {deliveryMethod === 'pickup' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <Label>{t.selectPickup}</Label>
                      <select value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-red-600">
                        {[t.libraryA, t.towerA, t.towerF, t.towerG, t.towerJ, t.towerI, t.mainGate].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label>{t.addressPlaceholder}</Label>
                        <Input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Ví dụ: Tòa A, Tầng 5, P.502" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {['saver', 'standard', 'priority'].map(tier => (
                          <button key={tier} type="button" onClick={() => setDeliveryTier(tier as any)} className={`p-3 rounded-xl border text-sm font-medium transition-all ${deliveryTier === tier ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-muted/50 border-border hover:bg-muted'}`}>
                            {t[`${tier}Delivery` as keyof typeof t]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-border grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {t.deliveryDateLabel}
                      </Label>
                      <Input type="date" value={deliveryDate} min={new Date().toISOString().split('T')[0]} onChange={e => setDeliveryDate(e.target.value)} className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {t.deliveryTimeLabel}
                      </Label>
                      <Input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="rounded-xl h-12" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border">
                  <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-red-600" />
                    {t.paymentMethod}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button type="button" onClick={() => setPaymentMethod('card')} className={`p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'card' ? 'border-red-600 bg-red-50' : 'border-border'}`}>
                      <p className="font-bold">{t.cardPayment}</p>
                      <p className="text-xs text-muted-foreground">{t.cardPaymentDesc}</p>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('cash')} className={`p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-red-600 bg-red-50' : 'border-border'}`}>
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
                      placeholder={t.promoCodePlaceholder || 'Mã giảm giá'} 
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
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Sale ({discountRate * 100}%)</span>
                        <span className="font-medium">-{formatPrice(getCartTotal() * discountRate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.shippingFee}</span>
                      <span className="font-medium text-green-600">{deliveryFee === 0 ? t.free : formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-border">
                      <span className="font-bold">{t.total}</span>
                      <span className="font-black text-2xl text-red-600">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={isProcessing || finalTotal < 5000} className="w-full h-14 rounded-2xl bg-red-600 text-white font-bold mt-8 shadow-lg shadow-red-600/20 hover:bg-red-700">
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
            <Button className="bg-red-600" onClick={async () => {
               await requestPushPermission();
               navigate(`/order/${showPushPrompt}`, { replace: true });
            }}>{t.enablePushBtn}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
