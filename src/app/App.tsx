import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { TransitionOverlay } from './components/TransitionOverlay';
import { ActivitySoundBridge } from './components/ActivitySoundBridge';
import { ChatWidget } from './components/ChatWidget';
import { BottomNav } from './components/BottomNav';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Always hide splash after delay
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    // Only enable smooth scroll on desktop — Lenis breaks position:fixed on mobile
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) return () => clearTimeout(timer);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-card text-card-foreground"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-3xl shadow-xl flex items-center justify-center text-white mb-6 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
                <span className="text-3xl font-black italic tracking-tighter">FNP</span>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
                FlashNPrint
              </h1>
              <motion.div 
                className="w-48 h-1 bg-border/50 rounded-full mt-8 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-red-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TransitionOverlay />
      <ActivitySoundBridge />
      <CartProvider>
        <RouterProvider router={router} />
        <ChatWidget />
        <Toaster position="top-center" />
      </CartProvider>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}