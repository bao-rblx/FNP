import { useState, useEffect, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
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
import { isNumericStudentId, isVanLangSchoolEmail } from '../lib/authValidation';

export default function Auth() {
  const { t } = useLanguage();
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') || '/profile';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suId, setSuId] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (user && !isSuccess) {
    return <Navigate to={returnTo} replace />;
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error(t.authFillFields);
      return;
    }
    if (!isVanLangSchoolEmail(loginEmail)) {
      toast.error(t.authMustVanLangEmail);
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
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 1500);
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!suName.trim() || !suEmail.trim() || !suId.trim() || !suPassword || !suConfirm) {
      toast.error(t.authFillFields);
      return;
    }
    if (!isVanLangSchoolEmail(suEmail)) {
      toast.error(t.authMustVanLangEmail);
      return;
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
      const r = await signUp(suName, suEmail, suId, suPassword);
      if (!r.ok) {
        if (r.error === 'email_taken') toast.error(t.authEmailTaken);
        else if (r.error === 'validation') toast.error(t.authFillFields);
        else toast.error(t.orderError);
        return;
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DesktopNav />
      <div className="min-h-screen bg-muted pb-20 md:pb-8 md:pt-16">
        <Header title={authTab === 'login' ? t.loginTitle : t.signupTitle} showBack />
        <div className="max-w-md mx-auto px-4 py-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">FlashNPrint · VLU</CardTitle>
              <CardDescription>{t.authLocalNote}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as 'login' | 'signup')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">{t.loginTitle}</TabsTrigger>
                  <TabsTrigger value="signup">{t.signupTitle}</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={onLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t.schoolEmail}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@vanlanguni.vn"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t.password}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={busy || isSuccess}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {t.signInButton}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      {t.authNoAccount}{' '}
                      <button
                        type="button"
                        className="text-red-600 font-medium hover:underline"
                        onClick={() => setAuthTab('signup')}
                      >
                        {t.signupTitle}
                      </button>
                    </p>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={onSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="su-name">{t.fullName}</Label>
                      <Input
                        id="su-name"
                        autoComplete="name"
                        value={suName}
                        onChange={(e) => setSuName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-email">{t.schoolEmail}</Label>
                      <Input
                        id="su-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@vanlanguni.vn"
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-id">{t.studentIdLabel}</Label>
                      <Input
                        id="su-id"
                        autoComplete="username"
                        placeholder="2026XXXXXXXX"
                        value={suId}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => setSuId(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-password">{t.password}</Label>
                      <Input
                        id="su-password"
                        type="password"
                        autoComplete="new-password"
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-confirm">{t.confirmPassword}</Label>
                      <Input
                        id="su-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={suConfirm}
                        onChange={(e) => setSuConfirm(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={busy || isSuccess}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {t.signUpButton}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      {t.authHasAccount}{' '}
                      <button
                        type="button"
                        className="text-red-600 font-medium hover:underline"
                        onClick={() => setAuthTab('login')}
                      >
                        {t.loginTitle}
                      </button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/" className="underline hover:text-muted-foreground">
              {t.back} · {t.home}
            </Link>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-card p-10 rounded-3xl shadow-2xl border border-border flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold">
                {authTab === 'login' ? t.loginSuccess : t.signupSuccess}
              </h2>
              <p className="text-muted-foreground">{t.processing}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
