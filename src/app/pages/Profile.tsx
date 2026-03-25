import React, { useEffect, useState } from 'react';
import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight, Award, Zap, Gift, Crown, MessageCircle, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
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
import { isNumericStudentId } from '../lib/authValidation';
import {
  loadNotifyPrefs,
  requestPushPermission,
  saveNotifyPrefs,
} from '../lib/notificationPrefs';
import {
  loyaltyPointsFromSpent,
  nextTierMinSpent,
  tierIndexForSpent,
  tierProgressPercent,
} from '../lib/membership';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type ProfileMenuDialog = 'edit' | 'notifications' | 'settings' | 'help';

export default function Profile() {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut, updateProfile, authReady, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [menuDialog, setMenuDialog] = useState<ProfileMenuDialog | null>(null);
  const [editName, setEditName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
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
    return <Navigate to="/auth?return=/profile" replace />;
  }

  const spent = user.totalSpent ?? 0;
  const orderCount = user.orderCount ?? 0;
  const tierIdx = tierIndexForSpent(spent);
  const rankLabel =
    tierIdx === 3 ? t.platinum : tierIdx === 2 ? t.gold : tierIdx === 1 ? t.silver : t.bronze;
  const tierProgress = tierProgressPercent(spent);
  const loyaltyPts = loyaltyPointsFromSpent(spent);
  const nextTierAt = nextTierMinSpent(spent);

  const formatSpent = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return Math.round(n / 1_000) + 'K';
    return String(n);
  };

  const openEditProfile = () => {
    setEditName(user.name);
    setEditStudentId(user.studentId);
    setMenuDialog('edit');
  };

  const menuItems: {
    icon: typeof User;
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
      icon: Bell,
      label: t.notifications,
      description: t.notificationsDesc,
      dialog: 'notifications',
    },
    {
      icon: Settings,
      label: t.settings,
      description: t.settingsDesc,
      dialog: 'settings',
    },
    {
      icon: HelpCircle,
      label: t.helpSupport,
      description: t.helpSupportDesc,
      dialog: 'help',
    },
  ];

  const memberRanks = [
    {
      name: t.bronze,
      icon: Award,
      color: 'from-amber-700 to-amber-600',
      textColor: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-900',
      minSpent: 0,
      benefits: [
        { icon: Gift, text: 'Basic rewards program', textVi: 'Chương trình thưởng cơ bản' },
        { icon: Zap, text: '5% discount on 10+ orders', textVi: 'Giảm 5% cho đơn hàng từ 10 đơn' },
      ]
    },
    {
      name: t.silver,
      icon: Award,
      color: 'from-gray-400 to-gray-500',
      textColor: 'text-muted-foreground',
      bgColor: 'bg-muted dark:bg-muted/50',
      borderColor: 'border-border',
      minSpent: 200000,
      benefits: [
        { icon: Gift, text: 'All Bronze benefits', textVi: 'Tất cả quyền lợi Hạng Đồng' },
        { icon: Zap, text: '10% discount on all orders', textVi: 'Giảm 10% tất cả đơn hàng' },
        { icon: Crown, text: 'Priority processing', textVi: 'Xử lý ưu tiên' },
      ]
    },
    {
      name: t.gold,
      icon: Crown,
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-300 dark:border-yellow-900',
      minSpent: 500000,
      benefits: [
        { icon: Gift, text: 'All Silver benefits', textVi: 'Tất cả quyền lợi Hạng Bạc' },
        { icon: Zap, text: '15% discount on all orders', textVi: 'Giảm 15% tất cả đơn hàng' },
        { icon: Crown, text: 'Free express delivery', textVi: 'Giao hàng nhanh miễn phí' },
        { icon: Award, text: 'Birthday gift voucher', textVi: 'Phiếu quà sinh nhật' },
      ]
    },
    {
      name: t.platinum,
      icon: Crown,
      color: 'from-purple-400 to-indigo-600',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-300 dark:border-purple-900',
      minSpent: 1000000,
      benefits: [
        { icon: Gift, text: 'All Gold benefits', textVi: 'Tất cả quyền lợi Hạng Vàng' },
        { icon: Zap, text: '20% discount on all orders', textVi: 'Giảm 20% tất cả đơn hàng' },
        { icon: Crown, text: 'VIP customer service', textVi: 'Dịch vụ khách hàng VIP' },
        { icon: Award, text: 'Exclusive member events', textVi: 'Sự kiện độc quyền' },
        { icon: Gift, text: 'Free monthly prints (50 pages)', textVi: 'In miễn phí hàng tháng (50 trang)' },
      ]
    },
  ];

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-16">
        <Header title={t.account} />

        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Profile & Menu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Profile Card */}
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-700 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {initialsFromName(user.name)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground text-sm">{user.schoolEmail}</p>
                    <p className="text-muted-foreground text-sm">
                      MSSV: {user.studentId}
                    </p>
                    {user.lastLoginAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        {t.lastLogin}: {new Date(user.lastLoginAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{orderCount}</p>
                    <p className="text-xs text-muted-foreground">{t.totalOrders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatSpent(spent)}</p>
                    <p className="text-xs text-muted-foreground">{t.totalSpent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{rankLabel}</p>
                    <p className="text-xs text-muted-foreground">{t.memberRank}</p>
                  </div>
                </div>
              </div>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-red-800"
                >
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">{t.adminPanel}</p>
                    <p className="text-xs text-red-100/90">{t.adminOrdersHint}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </Link>
              )}

              {user.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                  className="flex items-center gap-3 w-full bg-card text-card-foreground rounded-xl p-4 shadow-sm hover:bg-muted transition-colors border border-border/50"
                >
                  <div className="bg-red-50 p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{t.chatSupport}</p>
                    <p className="text-xs text-muted-foreground">{t.chatSupportDesc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              )}

              {/* Membership Card */}
              <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden ring-1 ring-white/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div>
                    <p className="text-sm opacity-90">{t.rewardPoints}</p>
                    <p className="text-2xl font-bold">
                      {loyaltyPts.toLocaleString()} {language === 'vi' ? 'điểm' : 'pts'}
                    </p>
                  </div>
                  <div className="bg-card text-card-foreground bg-opacity-20 px-3 py-1 rounded-full text-sm">{rankLabel}</div>
                </div>
                <div className="bg-card text-card-foreground bg-opacity-20 rounded-full h-2 mb-1">
                  <div
                    className="bg-card text-card-foreground h-full rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                <p className="text-xs opacity-90">
                  {nextTierAt == null
                    ? language === 'vi'
                      ? 'Bạn đã đạt hạng cao nhất — cảm ơn bạn đã đồng hành!'
                      : 'Top tier reached — thank you for printing with us!'
                    : language === 'vi'
                      ? `${t.pointsToNext} ${new Intl.NumberFormat('vi-VN').format(nextTierAt)}đ để lên hạng tiếp theo`
                      : `${new Intl.NumberFormat('vi-VN').format(nextTierAt)}đ ${t.pointsToNext} next tier`}
                </p>
              </div>

              {/* Menu Items */}
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl shadow-lg shadow-black/5 ring-1 ring-border/50 overflow-hidden">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => {
                        if (item.dialog === 'edit') openEditProfile();
                        else if (item.dialog === 'notifications') {
                          setNotifyPrefs(loadNotifyPrefs());
                          setMenuDialog('notifications');
                        } else {
                          setMenuDialog(item.dialog);
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors ${
                        index < menuItems.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  );
                })}
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/40 rounded-2xl md:rounded-3xl p-5 shadow-sm transition-colors flex items-center justify-center gap-3 font-semibold text-lg ring-1 ring-red-200 dark:ring-red-900/50"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-medium">{t.logout}</span>
              </motion.button>

              {/* App Version */}
              <p className="text-center text-xs text-gray-400">
                FlashNPrint v1.0.0
              </p>
            </motion.div>

            {/* Right Column - Member Benefits */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-card text-card-foreground rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 ring-1 ring-border/50">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 tracking-tight">
                  <span className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl">
                    <Award className="w-7 h-7 text-red-600" />
                  </span>
                  {t.rankBenefits}
                </h2>
                
                <div className="space-y-4">
                  {memberRanks.map((rank, rankIndex) => {
                    const Icon = rank.icon;
                    const isCurrent = tierIdx === rankIndex;
                    return (
                      <div
                        key={rank.name}
                        className={`relative p-6 rounded-2xl border-2 ${rank.borderColor} ${rank.bgColor} transition-all duration-300 ${
                          isCurrent ? 'ring-4 ring-yellow-400/50 shadow-xl scale-[1.02]' : 'hover:scale-[1.01]'
                        }`}
                      >
                        {isCurrent && (
                          <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            {t.currentRank}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mb-5">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${rank.color} text-white shadow-inner`}>
                            <Icon className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div>
                            <h3 className={`text-lg md:text-xl font-bold ${rank.textColor}`}>
                              {rank.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {rank.minSpent === 0
                                ? language === 'vi'
                                  ? 'Hạng khởi đầu cho thành viên mới'
                                  : 'Starting tier for new members'
                                : language === 'vi'
                                  ? `Chi tiêu từ ${new Intl.NumberFormat('vi-VN').format(rank.minSpent)}đ`
                                  : `Spend ${new Intl.NumberFormat('vi-VN').format(rank.minSpent)}đ or more`}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-3">
                          {rank.benefits.map((benefit, bIndex) => {
                            const BIcon = benefit.icon;
                            return (
                              <li key={bIndex} className="flex items-center gap-3 text-sm">
                                <span className={`p-1.5 rounded-full ${isCurrent ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                                  <BIcon className="w-4 h-4" />
                                </span>
                                <span className="font-medium text-foreground opacity-90">{language === 'vi' ? benefit.textVi : benefit.text}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Dialog open={menuDialog === 'edit'} onOpenChange={(open) => !open && setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editProfile}</DialogTitle>
            <DialogDescription>{t.editProfileDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t.fullName}</Label>
              <Input
                id="profile-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-id">{t.studentIdLabel}</Label>
              <Input
                id="profile-id"
                inputMode="numeric"
                value={editStudentId}
                onChange={(e) => setEditStudentId(e.target.value.replace(/\D/g, ''))}
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.schoolEmail}: {user.schoolEmail}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMenuDialog(null)}>
              {t.cancel}
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!editName.trim()) {
                  toast.error(t.authFillFields);
                  return;
                }
                if (!isNumericStudentId(editStudentId)) {
                  toast.error(t.authStudentIdNumbersOnly);
                  return;
                }
                const r = await updateProfile({ name: editName, studentId: editStudentId });
                if (!r.ok) {
                  toast.error(t.orderError);
                  return;
                }
                toast.success(t.profileSaved);
                setMenuDialog(null);
              }}
            >
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog === 'notifications'} onOpenChange={(open) => !open && setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.notifications}</DialogTitle>
            <DialogDescription>{t.notificationsDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pref-orders" className="flex-1 text-left font-normal leading-snug">
                {t.notifPrefOrders}
              </Label>
              <Switch
                id="pref-orders"
                checked={notifyPrefs.orders}
                onCheckedChange={(orders) => {
                  const next = { ...notifyPrefs, orders };
                  setNotifyPrefs(next);
                  saveNotifyPrefs(next);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pref-promos" className="flex-1 text-left font-normal leading-snug">
                {t.notifPrefPromos}
              </Label>
              <Switch
                id="pref-promos"
                checked={notifyPrefs.promos}
                onCheckedChange={(promos) => {
                  const next = { ...notifyPrefs, promos };
                  setNotifyPrefs(next);
                  saveNotifyPrefs(next);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pref-sound" className="flex-1 text-left font-normal leading-snug">
                {t.notifPrefSound}
              </Label>
              <Switch
                id="pref-sound"
                checked={notifyPrefs.soundEnabled}
                onCheckedChange={(soundEnabled) => {
                  const next = { ...notifyPrefs, soundEnabled };
                  setNotifyPrefs(next);
                  saveNotifyPrefs(next);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pref-push" className="flex-1 text-left font-normal leading-snug">
                {t.notifPrefPush}
              </Label>
              <Switch
                id="pref-push"
                checked={notifyPrefs.pushEnabled}
                onCheckedChange={async (pushEnabled) => {
                  if (pushEnabled && typeof Notification !== 'undefined') {
                    const perm = await requestPushPermission();
                    if (perm !== 'granted') {
                      toast.error(t.pushPermissionDenied);
                      return;
                    }
                  }
                  const next = { ...notifyPrefs, pushEnabled };
                  setNotifyPrefs(next);
                  saveNotifyPrefs(next);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setMenuDialog(null)}
            >
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog === 'settings'} onOpenChange={(open) => !open && setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.settings}</DialogTitle>
            <DialogDescription>{t.settingsAppLanguageHint}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-2">
            <Button
              type="button"
              variant={language === 'vi' ? 'default' : 'outline'}
              className={language === 'vi' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setLanguage('vi')}
            >
              Tiếng Việt
            </Button>
            <Button
              type="button"
              variant={language === 'en' ? 'default' : 'outline'}
              className={language === 'en' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2">{t.settingsThemeHint}</p>
            <ThemeToggle />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMenuDialog(null)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog === 'help'} onOpenChange={(open) => !open && setMenuDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.helpSupport}</DialogTitle>
            <DialogDescription className="text-left text-muted-foreground leading-relaxed">
              {t.helpDialogIntro}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setMenuDialog(null)}
            >
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}