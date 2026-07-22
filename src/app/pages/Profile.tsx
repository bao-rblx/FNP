import React, { useEffect, useState } from 'react';
import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight, Key, Package, LayoutDashboard, ShoppingBag, Wallet } from 'lucide-react';
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
import {
  loadNotifyPrefs,
  saveNotifyPrefs,
} from '../lib/notificationPrefs';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type ProfileMenuDialog = 'edit' | 'notifications' | 'settings' | 'help' | 'password';

function formatSpent(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'K';
  return String(n);
}

export default function Profile() {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut, updateProfile, changePassword, authReady, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [menuDialog, setMenuDialog] = useState<ProfileMenuDialog | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [busy, setBusy] = useState(false);

  const [notifyPrefs, setNotifyPrefs] = useState(loadNotifyPrefs);

  useEffect(() => {
    if (user) void refreshSession();
  }, [user?.id, refreshSession]);

  // Seed the edit form whenever it opens.
  useEffect(() => {
    if (menuDialog === 'edit' && user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
    }
  }, [menuDialog, user]);

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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-colors"
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

  const menuItems: {
    icon: any;
    label: string;
    description: string;
    dialog: ProfileMenuDialog;
  }[] = [
    { icon: User, label: t.editProfile, description: t.editProfileDesc, dialog: 'edit' },
    { icon: Key, label: t.changePassword, description: t.settingsDesc, dialog: 'password' },
    { icon: Bell, label: t.notifications, description: t.notificationsDesc, dialog: 'notifications' },
    { icon: Settings, label: t.settings, description: t.settingsAppLanguageHint, dialog: 'settings' },
    { icon: HelpCircle, label: t.helpSupport, description: t.helpSupportDesc, dialog: 'help' },
  ];

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 md:pt-16">
        <Header title={t.account} />

        <div className="max-w-5xl mx-auto px-4 py-8">
          <BackButton />
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="p-6 md:p-8 rounded-3xl shadow-sm border-border bg-card">
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-background">
                    {initialsFromName(user.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground text-sm">{user.schoolEmail}</p>
                    {user.phone && (
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{orderCount}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.totalOrders}</p>
                  </div>
                  <div className="text-center border-l border-border">
                    <p className="text-2xl font-bold text-foreground">{formatSpent(spent)}<span className="text-sm">đ</span></p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t.totalSpent}</p>
                  </div>
                </div>
              </Card>

              {user.role === 'admin' && (
                <Link to="/admin" className="block p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all">
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
                className="w-full h-14 rounded-2xl border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t.signOut}
              </Button>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 rounded-[2rem] shadow-sm border-border bg-gradient-to-br from-card to-indigo-950/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tight mb-1">
                    {language === 'vi' ? `Chào, ${user.name.split(' ')[0]}` : `Hi, ${user.name.split(' ')[0]}`}
                  </h3>
                  <p className="text-muted-foreground font-medium mb-8">
                    {language === 'vi' ? 'Quản lý tài khoản và đơn hàng mô hình 3D của bạn.' : 'Manage your account and 3D model orders.'}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('/orders')}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 dark:bg-black/20 border border-border/40 hover:border-indigo-500/40 transition-colors text-left"
                    >
                      <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold">{language === 'vi' ? 'Đơn hàng của tôi' : 'My orders'}</p>
                        <p className="text-sm text-muted-foreground">{orderCount} {language === 'vi' ? 'đơn' : 'orders'}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/services/all')}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 dark:bg-black/20 border border-border/40 hover:border-indigo-500/40 transition-colors text-left"
                    >
                      <div className="p-3 bg-purple-600 text-white rounded-xl shadow-lg">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold">{language === 'vi' ? 'Kho mô hình 3D' : 'Browse models'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Khám phá asset mới' : 'Discover new assets'}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Order Tracking */}
              <Card className="p-6 rounded-3xl shadow-sm border-border bg-card flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-xl text-indigo-500">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">{language === 'vi' ? 'Theo dõi đơn hàng' : 'Order tracking'}</h4>
                    <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Theo dõi trạng thái các đơn mô hình 3D.' : 'Keep an eye on your 3D model orders.'}</p>
                  </div>
                </div>
                <Button variant="ghost" className="mt-4 justify-between p-0 hover:bg-transparent text-indigo-600 font-bold relative z-10" onClick={() => navigate('/orders')}>
                  {language === 'vi' ? 'Xem tất cả đơn hàng' : 'View all orders'} <ChevronRight className="w-4 h-4 ml-1" />
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
              <Label>{t.username}</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="0123..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialog(null)}>{t.cancel}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={busy} onClick={async () => {
              setBusy(true);
              try {
                const r = await updateProfile({ name: editName, phone: editPhone });
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
            <DialogDescription>{language === 'vi' ? 'Nhập mật khẩu hiện tại và mật khẩu mới.' : 'Enter your current password and a new one.'}</DialogDescription>
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
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={busy} onClick={async () => {
              if (newPw !== confirmPw) { toast.error(t.authPasswordMismatch); return; }
              setBusy(true);
              try {
                const r = await changePassword(oldPw, newPw);
                if (r.ok) { toast.success(t.passwordChanged); setMenuDialog(null); setOldPw(''); setNewPw(''); setConfirmPw(''); }
                else toast.error(t.orderError);
              } finally { setBusy(false); }
            }}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Button variant={language === 'vi' ? 'default' : 'outline'} className={language === 'vi' ? 'bg-indigo-600 hover:bg-indigo-700' : ''} onClick={() => setLanguage('vi')}>Tiếng Việt</Button>
                <Button variant={language === 'en' ? 'default' : 'outline'} className={language === 'en' ? 'bg-indigo-600 hover:bg-indigo-700' : ''} onClick={() => setLanguage('en')}>English</Button>
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
          <DialogFooter><Button className="bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={() => setMenuDialog(null)}>{t.close}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
