import React, { useEffect, useState } from 'react';
import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight, Award, Zap, Gift, Crown, MessageCircle, LayoutDashboard, Key, Package, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { BackButton } from '../components/BackButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isNumericStudentId, isVanLangSchoolEmail } from '../lib/authValidation';
import {
  loadNotifyPrefs,
  requestPushPermission,
  saveNotifyPrefs,
} from '../lib/notificationPrefs';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type ProfileMenuDialog = 'edit' | 'notifications' | 'settings' | 'help' | 'password';

export default function Profile() {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut, updateProfile, changePassword, authReady, refreshSession, redeemPoints } = useAuth();
  const navigate = useNavigate();

  const [menuDialog, setMenuDialog] = useState<ProfileMenuDialog | null>(null);
  const [editName, setEditName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRankDetails, setShowRankDetails] = useState(false);

  const [notifyPrefs, setNotifyPrefs] = useState(loadNotifyPrefs);

  useEffect(() => {
    if (user) void refreshSession();
  }, [user?.id, refreshSession]);

  if (!authReady) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-background flex items-center justify-center md:pt-16">
          <p className="text-muted-foreground text-sm">{t.processing}</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <DesktopNav />
        <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-16">
          <Header title={t.profile} />
          <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.guestProfileTitle}</h2>
              <p className="text-muted-foreground">{t.guestProfileDesc}</p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <Link
                to="/auth"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-colors"
              >
                {t.signIn}
              </Link>
              <Link
                to="/auth"
                className="w-full border border-border hover:bg-muted text-foreground font-medium py-3 px-6 rounded-xl text-center transition-colors"
              >
                {t.createAccount}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const spent = user.totalSpent ?? 0;
  const orderCount = user.orderCount ?? 0;
  const points = user.points ?? 0;
  const rank = user.rank ?? 'bronze';

  const rankLabels: Record<string, string> = {
    bronze: t.rankBronze,
    silver: t.rankSilver,
    gold: t.rankGold,
    platinum: t.rankPlatinum,
  };

  const nextTierInfo = () => {
    if (rank === 'platinum') return null;
    const tiers = [
      { id: 'bronze', next: 200000 },
      { id: 'silver', next: 500000 },
      { id: 'gold', next: 2000000 },
    ];
    const current = tiers.find(x => x.id === rank);
    if (!current) return null;
    const diff = current.next - spent;
    return { diff, progress: Math.min(100, (spent / current.next) * 100) };
  };

  const nextTier = nextTierInfo();

  const formatSpent = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return Math.round(n / 1_000) + 'K';
    return String(n);
  };

  const menuItems: {
    icon: any;
    label: string;
    description: string;
    dialog: ProfileMenuDialog;
  }[] = [
    {
      icon: User,
      label: t.editProfile,
      description: t.editProfileDesc,
      dialog: 'edit',
    },
    {
      icon: Key,
      label: t.changePassword,
      description: t.settingsDesc,
      dialog: 'password',
    },
    {
      icon: Bell,
      label: t.notifications,
      description: t.notificationsDesc,
      dialog: 'notifications',
    },
    {
      icon: Settings,
      label: t.settings,
      description: t.settingsAppLanguageHint,
      dialog: 'settings',
    },
    {
      icon: HelpCircle,
      label: t.helpSupport,
      description: t.helpSupportDesc,
      dialog: 'help',
    },
  ];

  const getRankBenefits = (r: string) => {
    switch (r) {
      case 'platinum':
        return [
          { icon: Zap, text: language === 'vi' ? 'Giảm 20% tất cả đơn hàng' : '20% discount on all orders' },
          { icon: MessageCircle, text: language === 'vi' ? 'Tính năng mới độc quyền' : 'Exclusive new features' },
          { icon: Gift, text: language === 'vi' ? 'Quà tặng độc quyền hàng tháng' : 'Exclusive monthly gifts' },
        ];
      case 'gold':
        return [
          { icon: Zap, text: language === 'vi' ? 'Giảm 15% tất cả đơn hàng' : '15% discount on all orders' },
          { icon: Crown, text: language === 'vi' ? 'Giao hàng nhanh miễn phí' : 'Free express delivery' },
          { icon: Gift, text: language === 'vi' ? 'Voucher sinh nhật giá trị' : 'Birthday gift vouchers' },
        ];
      case 'silver':
        return [
          { icon: Zap, text: language === 'vi' ? 'Giảm 10% tất cả đơn hàng' : '10% discount on all orders' },
          { icon: Crown, text: language === 'vi' ? 'Ưu tiên xử lý đơn hàng' : 'Priority processing' },
        ];
      default:
        return [];
    }
  };

  const RANK_DATA = [
    { id: 'bronze', label: t.rankBronze, spend: '0đ', perks: language === 'vi' ? ['Ưu đãi thành viên mới'] : ['New member offers'] },
    { id: 'silver', label: t.rankSilver, spend: '200k+', perks: language === 'vi' ? ['Giảm 10% đơn hàng', 'Ưu tiên xử lý'] : ['10% off orders', 'Priority processing'] },
    { id: 'gold', label: t.rankGold, spend: '500k+', perks: language === 'vi' ? ['Giảm 15% đơn hàng', 'Giao hàng nhanh', 'Voucher sinh nhật'] : ['15% off orders', 'Express delivery', 'Birthday voucher'] },
    { id: 'platinum', label: t.rankPlatinum, spend: '2M+', perks: language === 'vi' ? ['Giảm 20% đơn hàng', 'Tính năng độc quyền', 'Quà tặng tháng'] : ['20% off orders', 'Exclusive features', 'Monthly gifts'] },
  ];

  const isVanLang = isVanLangSchoolEmail(user.schoolEmail || '');

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 md:pt-16">
        <Header title={t.account} />

        <div className="max-w-6xl mx-auto px-4 py-8">
          <BackButton />
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border bg-card">
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-background">
                    {initialsFromName(user.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground text-sm">{user.schoolEmail}</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium">MSSV: {user.studentId}</span>
                      {user.phone && <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium">{user.phone}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{orderCount}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.totalOrders}</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-xl font-bold text-foreground">{formatSpent(spent)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.totalSpent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600">{points}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.pointsLabel}</p>
                  </div>
                </div>
              </Card>

              {user.role === 'admin' && (
                <Link to="/admin" className="block p-4 bg-red-600 text-white rounded-2xl shadow-md hover:bg-red-700 transition-all">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-6 h-6" />
                    <div className="flex-1">
                      <p className="font-bold">{t.adminPanel}</p>
                      <p className="text-xs opacity-80">{t.adminOrdersHint}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-60" />
                  </div>
                </Link>
              )}

              {/* Reward/Rank Summary */}
              <button 
                onClick={() => setShowRankDetails(true)}
                className="w-full text-left bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform"
              >
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Award className="w-32 h-32" /></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-80 font-bold">{t.memberRank}</p>
                      <h3 className="text-2xl font-bold flex items-center gap-2">
                        {rankLabels[rank]}
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {nextTier && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span>{Math.round(nextTier.progress)}%</span>
                        <span>{new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(nextTier.diff)}đ {t.pointsToNext}</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${nextTier.progress}%` }} className="h-full bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  )}
                  {!nextTier && <p className="text-sm font-medium opacity-90">✨ Maximum rank achieved!</p>}
                </div>
              </button>

              {/* Menu List */}
              <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setMenuDialog(item.dialog)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${idx !== menuItems.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="p-2 bg-muted rounded-xl text-muted-foreground">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => { signOut(); navigate('/'); }}
                className="w-full h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t.signOut}
              </Button>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Card - Full Width and Prominent */}
              <Card className="p-8 rounded-[2.5rem] shadow-xl border-none bg-gradient-to-br from-white to-red-50 dark:from-zinc-900 dark:to-red-950/20 overflow-hidden relative group border border-red-100 dark:border-red-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg">
                         <Crown className="w-8 h-8" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-black tracking-tight">{isVanLang ? (language === 'vi' ? 'Thành viên Văn Lang' : 'Van Lang Member') : (language === 'vi' ? 'Người dùng thường' : 'Free User')}</h3>
                         <p className="text-muted-foreground font-medium">{isVanLang ? (language === 'vi' ? 'Gói ưu đãi đặc quyền cho sinh viên' : 'Exclusive campus student tier') : (language === 'vi' ? 'Gói cơ bản cho mọi người dùng' : 'Basic tier for all users')}</p>
                       </div>
                    </div>
                    {isVanLang && (
                       <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-bold border border-red-200 dark:border-red-800 self-start md:self-center">
                         {language === 'vi' ? 'Đã kích hoạt' : 'Active'}
                       </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(isVanLang ? [
                      { icon: Zap, text: language === 'vi' ? 'Giảm 5% toàn bộ đơn hàng' : '5% discount on all orders' },
                      { icon: Package, text: language === 'vi' ? 'Miễn phí giao hàng nội khu' : 'Free on-campus delivery' },
                    ] : [
                      { icon: Gift, text: language === 'vi' ? 'Chương trình tích điểm thưởng' : 'Reward points program' },
                    ]).map((perk, idx) => {
                      const PIcon = perk.icon || Star;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-white/20">
                          <PIcon className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-semibold">{perk.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-3xl shadow-sm border-border bg-card">
                {getRankBenefits(rank).length > 0 && (
                  <>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                       <Award className="w-6 h-6 text-red-600" />
                       {t.benefits}
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {getRankBenefits(rank).map((b, i) => {
                        const BIcon = b.icon;
                        return (
                          <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                              <BIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="text-sm font-medium pt-1">{b.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-8 p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/40">
                  <div className="flex items-center gap-4 text-red-700 dark:text-red-400">
                    <Gift className="w-6 h-6" />
                    <div>
                      <p className="font-bold">{t.rewardPoints}</p>
                      <p className="text-sm opacity-90">You have {points} points available to redeem.</p>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 w-full sm:w-auto bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-500/20 h-11" 
                    onClick={() => navigate('/redeem')}
                  >
                    {language === 'vi' ? 'Đổi Điểm' : 'Redeem'}
                  </Button>
                </div>
              </Card>

              {/* Mini History */}
              <Card className="p-6 rounded-3xl shadow-sm border-border bg-card flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <h4 className="font-bold mb-2">Order Tracking</h4>
                  <p className="text-sm text-muted-foreground">Keep an eye on your ongoing printing jobs.</p>
                </div>
                <Button variant="ghost" className="mt-4 justify-between p-0 hover:bg-transparent text-red-600 font-bold relative z-10" onClick={() => navigate('/orders')}>
                  View All Orders <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={menuDialog === 'edit'} onOpenChange={() => setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{t.editProfile}</DialogTitle>
            <DialogDescription>{t.editProfileDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.fullName}</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.studentIdLabel}</Label>
              <Input value={editStudentId} onChange={e => setEditStudentId(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="0123..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialog(null)}>{t.cancel}</Button>
            <Button className="bg-red-600" disabled={busy} onClick={async () => {
              setBusy(true);
              try {
                const r = await updateProfile({ name: editName, studentId: editStudentId, phone: editPhone });
                if (r.ok) { toast.success(t.profileSaved); setMenuDialog(null); }
                else toast.error(t.orderError);
              } finally { setBusy(false); }
            }}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog === 'password'} onOpenChange={() => setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{t.changePassword}</DialogTitle>
            <DialogDescription>Enter your current password and a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.oldPassword}</Label>
              <Input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.newPassword}</Label>
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.confirmNewPassword}</Label>
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialog(null)}>{t.cancel}</Button>
            <Button className="bg-red-600" disabled={busy} onClick={async () => {
              if (newPw !== confirmPw) { toast.error(t.authPasswordMismatch); return; }
              setBusy(true);
              try {
                const r = await changePassword(oldPw, newPw);
                if (r.ok) { toast.success(t.passwordChanged); setMenuDialog(null); }
                else toast.error(t.orderError);
              } finally { setBusy(false); }
            }}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other dialogs simplified for space */}
      <Dialog open={menuDialog === 'notifications'} onOpenChange={() => setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader><DialogTitle>{t.notifications}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {['orders', 'promos', 'soundEnabled', 'pushEnabled'].map(key => (
              <div key={key} className="flex justify-between items-center">
                <Label>{t[(`notifPref${key.charAt(0).toUpperCase() + key.slice(1)}` as any) as keyof typeof t] || key}</Label>
                <Switch checked={(notifyPrefs as any)[key]} onCheckedChange={val => {
                  const next = { ...notifyPrefs, [key]: val };
                  setNotifyPrefs(next); saveNotifyPrefs(next);
                }} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog === 'settings'} onOpenChange={() => setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader><DialogTitle>{t.settings}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-2 block">{t.settingsAppLanguageHint}</Label>
              <div className="flex gap-2">
                <Button variant={language === 'vi' ? 'default' : 'outline'} className={language === 'vi' ? 'bg-red-600' : ''} onClick={() => setLanguage('vi')}>Tiếng Việt</Button>
                <Button variant={language === 'en' ? 'default' : 'outline'} className={language === 'en' ? 'bg-red-600' : ''} onClick={() => setLanguage('en')}>English</Button>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <Label className="mb-2 block">{t.settingsThemeHint}</Label>
              <ThemeToggle />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog === 'help'} onOpenChange={() => setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{t.helpSupport}</DialogTitle>
            <DialogDescription>{t.helpDialogIntro}</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button className="bg-red-600" onClick={() => setMenuDialog(null)}>{t.close}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rank Details Dialog */}
      <Dialog open={showRankDetails} onOpenChange={setShowRankDetails}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-red-600 to-rose-600 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Award className="w-8 h-8" />
                {t.memberRank}
              </DialogTitle>
              <DialogDescription className="text-red-50 text-base opacity-90">
                {language === 'vi' ? 'Khám phá đặc quyền của từng cấp bậc thành viên.' : 'Explore perks for each membership tier.'}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 md:p-8 bg-card">
            <div className="grid gap-4">
              {RANK_DATA.map((r) => (
                <div key={r.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  rank === r.id ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-1 ring-red-500/20 shadow-md' : 'border-border bg-muted/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      r.id === 'platinum' ? 'bg-zinc-900 text-amber-400' :
                      r.id === 'gold' ? 'bg-amber-100 text-amber-700' :
                      r.id === 'silver' ? 'bg-zinc-100 text-zinc-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight">{r.label}</p>
                      <p className="text-xs text-muted-foreground font-bold">{language === 'vi' ? 'Yêu cầu chi tiêu:' : 'Spend requirement:'} {r.spend}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {r.perks.map((p, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-wider border border-border/50 text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button className="bg-red-600 hover:bg-red-700 rounded-xl px-10 h-12 font-bold text-white shadow-lg shadow-red-500/20" onClick={() => setShowRankDetails(false)}>
                {t.close}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}