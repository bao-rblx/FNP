import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

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
          ? { backgroundColor: 'rgba(220, 38, 38, 0.12)', backdropFilter: 'blur(6px)' }
          : type === 'theme-to-light'
            ? { backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }
            : { backgroundColor: 'rgba(8, 8, 12, 0.9)', backdropFilter: 'blur(4px)' };

      setOverlayStyle(style);
      setVisible(true);

      setTimeout(() => {
        callback();
        setTimeout(() => setVisible(false), 80);
      }, 60);
    };

    return () => {
      _trigger = null;
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={overlayStyle}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={
        visible
          ? { duration: 0.06, ease: 'easeIn' }
          : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
      }
    />
  );
}
