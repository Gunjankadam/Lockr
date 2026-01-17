import { motion } from 'framer-motion';
import { ArrowLeft, Search, Settings, MoreVertical } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  onSearch?: () => void;
  onSettings?: () => void;
  onMore?: () => void;
  showSearch?: boolean;
  showSettings?: boolean;
  showMore?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  onSearch,
  onSettings,
  onMore,
  showSearch = false,
  showSettings = false,
  showMore = false,
}: ScreenHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-4 bg-background/80 backdrop-blur-xl
                 border-b border-border/50 sticky top-0 z-40"
      style={{ paddingTop: 'calc(var(--safe-area-top) + 1rem)' }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </motion.button>
        )}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {showSearch && onSearch && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onSearch}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Search size={22} className="text-muted-foreground" />
          </motion.button>
        )}
        {showSettings && onSettings && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Settings size={22} className="text-muted-foreground" />
          </motion.button>
        )}
        {showMore && onMore && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onMore}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <MoreVertical size={22} className="text-muted-foreground" />
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}