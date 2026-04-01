import React, { useState } from 'react';
import { Gift, ArrowLeft, CheckCircle2, Ticket, ShoppingBag, Coffee, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Header } from '../components/Header';
import { BackButton } from '../components/BackButton';
import { DesktopNav } from '../components/DesktopNav';

interface RewardItem {
  id: string;
  title: string;
  titleEn: string;
  points: number;
  description: string;
  descriptionEn: string;
  icon: any;
  color: string;
}

const REWARDS: RewardItem[] = [
  {
    id: 'vouch-10k',
    title: 'Voucher 10.000đ',
    titleEn: '10,000đ Voucher',
    points: 100,
    description: 'Giảm trực tiếp 10k cho đơn hàng tiếp theo',
    descriptionEn: 'Direct 10k discount for your next order',
    icon: Ticket,
    color: 'bg-blue-500',
  },
  {
    id: 'vouch-50k',
    title: 'Voucher 50.000đ',
    titleEn: '50,000đ Voucher',
    points: 450,
    description: 'Ưu đãi cực hời cho các đơn in ấn lớn',
    descriptionEn: 'Great deal for large printing orders',
    icon: Ticket,
    color: 'bg-purple-500',
  },
  {
    id: 'sticker-pack',
    title: 'Bộ Sticker VLU',
    titleEn: 'VLU Sticker Pack',
    points: 200,
    description: 'Bộ sưu tập sticker độc quyền FlashNPrint',
    descriptionEn: 'Exclusive FlashNPrint sticker collection',
    icon: Star,
    color: 'bg-yellow-500',
  },
  {
    id: 'free-coffee',
    title: 'Ly Cà Phê Miễn Phí',
    titleEn: 'Free Coffee',
    points: 300,
    description: 'Thưởng thức cà phê tại sảnh tòa A',
    descriptionEn: 'Enjoy a coffee at Tower A lobby',
    icon: Coffee,
    color: 'bg-orange-500',
  },
  {
    id: 'tote-bag',
    title: 'Túi Tote Canvas',
    titleEn: 'Canvas Tote Bag',
    points: 800,
    description: 'Túi vải bảo vệ môi trường siêu bền',
    descriptionEn: 'Eco-friendly durable canvas bag',
    icon: ShoppingBag,
    color: 'bg-green-500',
  },
];

export default function Redeem() {
  const { t, language } = useLanguage();
  const { user, redeemPoints, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('/auth')}>Please Sign In</Button>
      </div>
    );
  }

  const handleRedeem = async (item: RewardItem) => {
    if (user.points < item.points) {
      toast.error(language === 'vi' ? 'Không đủ điểm tích lũy' : 'Insufficient points');
      return;
    }

    setBusy(item.id);
    try {
      // For demo, we use the existing redeemPoints logic if it's a voucher, 
      // or just show a success message for other items.
      if (item.id.startsWith('vouch')) {
        const res = await redeemPoints(item.points);
        if (res.ok) {
           toast.success(language === 'vi' ? `Đã đổi thành công ${item.title}!` : `Redeemed ${item.titleEn}!`);
           void refreshSession();
        } else {
           toast.error(t.orderError);
        }
      } else {
        // Mock success for non-api items
        toast.success(language === 'vi' ? `Bạn đã đổi ${item.title}. Vui lòng nhận tại quầy!` : `Redeemed ${item.titleEn}. Please collect at counter!`);
        // We should ideally have an API call here to deduct points, but for now we follow the user's "sample stuff" request
      }
    } catch {
      toast.error(t.orderError);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted/30 pb-20 md:pt-16">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b md:hidden">
          <div className="flex items-center p-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">{language === 'vi' ? 'Đổi Quà' : 'Redeem Rewards'}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                <Gift className="w-8 h-8 text-red-600" />
                {language === 'vi' ? 'Kho Quà Tặng' : 'Reward Store'}
              </h1>
              <p className="text-muted-foreground font-medium">
                {language === 'vi' ? 'Sử dụng điểm tích lũy để nhận những ưu đãi đặc quyền.' : 'Use your reward points to claim exclusive perks.'}
              </p>
            </div>
            
            <Card className="p-4 bg-red-600 text-white shadow-lg flex items-center gap-4 rounded-2xl shrink-0">
               <div className="p-2 bg-white/20 rounded-xl">
                 <Star className="w-6 h-6 fill-current" />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest opacity-80">{t.rewardPoints}</p>
                 <p className="text-2xl font-black">{user.points}</p>
               </div>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {REWARDS.map((item) => {
              const Icon = item.icon;
              const canAfford = user.points >= item.points;
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  className="group"
                >
                  <Card className="p-5 h-full flex flex-col justify-between rounded-3xl border-border hover:border-red-200 transition-colors bg-card">
                    <div className="flex gap-4">
                      <div className={`p-4 rounded-2xl ${item.color} text-white shadow-inner shrink-0`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{language === 'vi' ? item.title : item.titleEn}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {language === 'vi' ? item.description : item.descriptionEn}
                        </p>
                        <div className="mt-3 flex items-center gap-1 text-red-600 font-black">
                           <Star className="w-4 h-4 fill-current" />
                           <span>{item.points} {t.pointsLabel}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className={`mt-6 w-full h-12 rounded-2xl font-bold shadow-sm ${
                        canAfford ? 'bg-red-600 hover:bg-red-700' : 'bg-muted cursor-not-allowed opacity-60'
                      }`}
                      disabled={!canAfford || busy === item.id}
                      onClick={() => handleRedeem(item)}
                    >
                      {busy === item.id ? t.processing : (language === 'vi' ? 'Đổi ngay' : 'Redeem Now')}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
