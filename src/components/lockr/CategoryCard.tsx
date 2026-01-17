import { motion } from 'framer-motion';
import {
  Mail, Users, CreditCard, Briefcase, User, Key, Lock, Shield, Globe,
  Smartphone, Laptop, Server, Database, Cloud, Wifi, Home, Car, Plane,
  ShoppingBag, Heart, Star, Bookmark, Folder, FileText, Image, Video,
  Music, Gamepad2, Trophy, Gift, Wallet, Building, GraduationCap, ChevronRight,
  LucideIcon
} from 'lucide-react';
import { Category } from '@/types/lockr';

const iconMap: Record<string, LucideIcon> = {
  Mail, Users, CreditCard, Briefcase, User, Key, Lock, Shield, Globe,
  Smartphone, Laptop, Server, Database, Cloud, Wifi, Home, Car, Plane,
  ShoppingBag, Heart, Star, Bookmark, Folder, FileText, Image, Video,
  Music, Gamepad2, Trophy, Gift, Wallet, Building, GraduationCap,
};

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  index?: number;
}

export function CategoryCard({ category, onClick, index = 0 }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Folder;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 bg-card hover:bg-card-elevated border border-border rounded-2xl 
                 shadow-card hover:shadow-card-hover transition-all duration-200
                 flex items-center gap-4 text-left group"
    >
      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
        <IconComponent size={24} className="text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
        <p className="text-sm text-muted-foreground">
          {category.entryCount} {category.entryCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <ChevronRight
        size={20}
        className="text-muted-foreground group-hover:text-foreground transition-colors"
      />
    </motion.button>
  );
}