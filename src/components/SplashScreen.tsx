import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import carLogo from '@/assets/sporty-car-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for exit animation
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/20"
        >
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: 0.1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0.05 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary"
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.6
            }}
            className="relative z-10"
          >
            <motion.img
              src={carLogo}
              alt="קהילת הרכב"
              className="w-32 h-32 object-contain drop-shadow-2xl"
              initial={{ filter: "brightness(0)" }}
              animate={{ filter: "brightness(1)" }}
              transition={{ duration: 0.4, delay: 0.3 }}
            />
          </motion.div>

          {/* App name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative z-10 mt-6 text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
          >
            קהילת הרכב
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="relative z-10 mt-2 text-sm text-muted-foreground"
          >
            הקהילה שלך לרכב
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 mt-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
