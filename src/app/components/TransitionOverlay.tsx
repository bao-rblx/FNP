import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type TransitionType = 'language' | 'theme-to-light' | 'theme-to-dark';

let _trigger: ((type: TransitionType, callback: () => void) => void) | null = null;

export function triggerTransition(type: TransitionType, callback: () => void) {
  if (_trigger) {
    _trigger(type, callback);
  } else {
    callback();
  }
}

export function TransitionOverlay() {
  const [visible, setVisible] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState({
    backgroundColor: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(4px)',
  });

  useEffect(() => {
    _trigger = (type, callback) => {
      const style =
        type === 'language'
          ? { backgroundColor: 'rgba(239, 68, 68, 0.08)', backdropFilter: 'blur(8px)' }
          : type === 'theme-to-light'
            ? { backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }
            : { backgroundColor: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(4px)' };

      setOverlayStyle(style);
      setVisible(true);

      // Logos/Transitions usually need a bit more time to feel premium
      setTimeout(() => {
        callback();
        setTimeout(() => setVisible(false), 400); // Wait for logo to show
      }, 500);
    };

    return () => {
      _trigger = null;
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={overlayStyle}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.1, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-2xl shadow-red-500/40">
              FNP
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-red-600"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
