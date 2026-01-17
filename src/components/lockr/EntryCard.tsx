import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Entry } from '@/types/lockr';
import { formatDistanceToNow } from 'date-fns';

interface EntryCardProps {
  entry: Entry;
  onClick: () => void;
  index?: number;
}

export function EntryCard({ entry, onClick, index = 0 }: EntryCardProps) {
  const maskedUsername = entry.username
    ? entry.username.slice(0, 3) + '•'.repeat(Math.max(0, entry.username.length - 3))
    : '•••••';

  const updatedAt = entry.updatedAt instanceof Date 
    ? entry.updatedAt 
    : new Date(entry.updatedAt);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full p-4 bg-card hover:bg-card-elevated border border-border rounded-xl 
                 shadow-card hover:shadow-card-hover transition-all duration-200
                 flex items-center gap-4 text-left group"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center
                      group-hover:bg-primary/20 transition-colors">
        <span className="text-lg font-bold text-primary">
          {entry.title.charAt(0).toUpperCase()}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{entry.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{maskedUsername}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <ChevronRight 
          size={18} 
          className="text-muted-foreground group-hover:text-foreground transition-colors" 
        />
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </span>
      </div>
    </motion.button>
  );
}