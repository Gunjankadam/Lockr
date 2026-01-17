import { motion } from 'framer-motion';
import { 
  Mail, Users, CreditCard, Briefcase, User, Key, Lock, Shield, Globe, 
  Smartphone, Laptop, Server, Database, Cloud, Wifi, Home, Car, Plane,
  ShoppingBag, Heart, Star, Bookmark, Folder, FileText, Image, Video, 
  Music, Gamepad2, Trophy, Gift, Wallet, Building, GraduationCap,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Mail, Users, CreditCard, Briefcase, User, Key, Lock, Shield, Globe,
  Smartphone, Laptop, Server, Database, Cloud, Wifi, Home, Car, Plane,
  ShoppingBag, Heart, Star, Bookmark, Folder, FileText, Image, Video,
  Music, Gamepad2, Trophy, Gift, Wallet, Building, GraduationCap,
};

const AVAILABLE_ICONS = Object.keys(iconMap);

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

export function IconSelector({ selectedIcon, onSelect }: IconSelectorProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-4 bg-secondary/50 rounded-2xl max-h-48 overflow-y-auto">
      {AVAILABLE_ICONS.map((iconName) => {
        const Icon = iconMap[iconName];
        const isSelected = selectedIcon === iconName;

        return (
          <motion.button
            key={iconName}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(iconName)}
            className={`
              p-3 rounded-xl transition-all duration-200
              ${isSelected 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'bg-card hover:bg-card-elevated text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {Icon && <Icon size={20} />}
          </motion.button>
        );
      })}
    </div>
  );
}