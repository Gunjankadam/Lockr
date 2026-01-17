import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface LockrLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showTagline?: boolean;
}

const sizeMap = {
  sm: { img: 'w-12 h-12', text: 'text-xl', tagline: 'text-xs' },
  md: { img: 'w-16 h-16', text: 'text-2xl', tagline: 'text-sm' },
  lg: { img: 'w-24 h-24', text: 'text-4xl', tagline: 'text-base' },
  xl: { img: 'w-32 h-32', text: 'text-5xl', tagline: 'text-lg' },
};

export function LockrLogo({ size = 'lg', animated = false, showTagline = false }: LockrLogoProps) {
  const { img, text, tagline } = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <img
          src="/logo.png"
          alt="Lockr Logo"
          className={`relative ${img} object-contain rounded-2xl`}
        />
      </div>
      <h1 className={`${text} font-bold tracking-tight text-foreground`}>
        Lock<span className="text-primary">r</span>
      </h1>
      {showTagline && (
        <p className={`${tagline} text-muted-foreground font-medium`}>
          Your secrets. Locked.
        </p>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}