import { useState, useEffect, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { DesktopNav } from '../components/DesktopNav';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { isNumericStudentId, isVanLangSchoolEmail, isValidEmail } from '../lib/authValidation';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const { t } = useLanguage();
  const { user, signIn, signUp, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') || '/profile';
  const resetToken = searchParams.get('token');

  const [authMode, setAuthMode] = useState<AuthMode>(resetToken ? 'reset' : 'login');
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup
  const [suName, setSuName] = useState('');
  const [suContact, setSuContact] = useState('');
  const [suId, setSuId] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');

  // Forgot/Reset
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (resetToken) setAuthMode('reset');
  }, [resetToken]);

  if (user && !isSuccess) {
    return <Navigate to={returnTo} replace />;
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error(t.authFillFields);
      return;
    }
    setBusy(true);
    try {
      const r = await signIn(loginEmail, loginPassword);
      if (!r.ok) {
        if (r.error === 'invalid') toast.error(t.authInvalidLogin);
        else toast.error(t.orderError);
        return;
      }
      setIsSuccess(true);
      setTimeout(() => navigate(returnTo, { replace: true }), 1500);
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!suName.trim() || !suContact.trim() || !suId.trim() || !suPassword || !suConfirm) {
      toast.error(t.authFillFields);
      return;
    }

    let suEmail = '';
    let suPhone = '';
    const contact = suContact.trim();
    if (isValidEmail(contact)) {
      suEmail = contact;
    } else {
      suPhone = contact;
    }
    if (!isNumericStudentId(suId)) {
      toast.error(t.authStudentIdNumbersOnly);
      return;
    }
    if (suPassword !== suConfirm) {
      toast.error(t.authPasswordMismatch);
      return;
    }
    setBusy(true);
    try {
      const r = await signUp(suName, suEmail, suId, suPassword, suPhone);
      if (!r.ok) {
        if (r.error === 'email_taken') toast.error(t.authEmailTaken);
        else if (r.error === 'phone_taken') toast.error(t.authPhoneTaken);
        else toast.error(t.orderError);
        return;
      }
      setIsSuccess(true);
      setTimeout(() => navigate(returnTo, { replace: true }), 1500);
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error(t.authFillFields);
      return;
    }
    setBusy(true);
    try {
      const res = await forgotPassword(resetEmail);
      toast.success(t.resetLinkSent);
      if (res.debug_token) {
        console.log('DEBUG: Reset Link -> ', `${window.location.origin}/auth?token=${res.debug_token}`);
      }
      setAuthMode('login');
    } catch {
      toast.error(t.orderError);
    } finally {
      setBusy(false);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmNewPassword) {
      toast.error(t.authPasswordMismatch);
      return;
    }
    setBusy(true);
    try {
      await resetPassword(resetToken!, newPassword);
      toast.success(t.passwordChanged);
      setAuthMode('login');
    } catch (err) {
      toast.error(t.orderError);
    } finally {
      setBusy(false);
    }
  };

  const renderContent = () => {
    if (authMode === 'forgot') {
      return (
        <form onSubmit={onForgot} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">{t.schoolEmail}</Label>
            <Input id="forgot-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-red-600 hover:bg-red-700">{t.sendResetLink}</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMode('login')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
          </Button>
        </form>
      );
    }

    if (authMode === 'reset') {
      return (
        <form onSubmit={onReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw">{t.newPassword}</Label>
            <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-pw">{t.confirmNewPassword}</Label>
            <Input id="confirm-new-pw" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-red-600 hover:bg-red-700">{t.resetPassword}</Button>
        </form>
      );
    }

    return (
      <Tabs value={authMode as any} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">{t.loginTitle}</TabsTrigger>
          <TabsTrigger value="signup">{t.signupTitle}</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4">
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">{t.emailOrPhone}</Label>
              <Input id="login-email" type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="email@example.com / 0123..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">{t.password}</Label>
                <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs text-red-600 hover:underline">{t.forgotPassword}</button>
              </div>
              <Input id="login-password" type="password" autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy || isSuccess} className="w-full bg-red-600 hover:bg-red-700">{t.signInButton}</Button>
            <p className="text-center text-sm text-muted-foreground">
              {t.authNoAccount} <button type="button" className="text-red-600 font-medium hover:underline" onClick={() => setAuthMode('signup')}>{t.signupTitle}</button>
            </p>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={onSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="su-name">{t.fullName}</Label>
              <Input id="su-name" value={suName} onChange={(e) => setSuName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-contact">{t.emailOrPhone}</Label>
              <Input id="su-contact" value={suContact} onChange={(e) => setSuContact(e.target.value)} placeholder="email@example.com / 0123..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-id">{t.studentIdLabel}</Label>
              <Input id="su-id" value={suId} onChange={(e) => setSuId(e.target.value.replace(/\D/g, ''))} placeholder="2026XXXXXXXX" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="su-password">{t.password}</Label>
                <Input id="su-password" type="password" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-confirm">{t.confirmPassword}</Label>
                <Input id="su-confirm" type="password" value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={busy || isSuccess} className="w-full bg-red-600 hover:bg-red-700">{t.signUpButton}</Button>
            <p className="text-center text-sm text-muted-foreground">
              {t.authHasAccount} <button type="button" className="text-red-600 font-medium hover:underline" onClick={() => setAuthMode('login')}>{t.loginTitle}</button>
            </p>
          </form>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-20 md:pb-8 md:pt-16">
        <Header title={authMode === 'signup' ? t.signupTitle : t.loginTitle} showBack />
        <div className="max-w-md mx-auto px-4 py-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">FlashNPrint · VLU</CardTitle>
              <CardDescription>
                {authMode === 'forgot' ? t.forgotPassword : authMode === 'reset' ? t.resetPassword : t.authLocalNote}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card p-10 rounded-3xl shadow-2xl border border-border flex flex-col items-center gap-4 text-center">
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring' }}><CheckCircle2 className="w-20 h-20 text-green-500" /></motion.div>
              <h2 className="text-2xl font-bold">{authMode === 'login' ? t.loginSuccess : t.signupSuccess}</h2>
              <p className="text-muted-foreground">{t.processing}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
