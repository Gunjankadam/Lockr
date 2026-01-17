import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Category } from '@/types/lockr';
import { CategoryCard } from '@/components/lockr/CategoryCard';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { FloatingActionButton } from '@/components/lockr/FloatingActionButton';

interface VaultScreenProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  onAddCategory: () => void;
  onSearch: () => void;
  onSettings: () => void;
}

export function VaultScreen({
  categories,
  onCategoryClick,
  onAddCategory,
  onSearch,
  onSettings,
}: VaultScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <ScreenHeader
        title="My Vault"
        showSearch
        showSettings
        onSearch={onSearch}
        onSettings={onSettings}
      />

      <div className="p-4 pb-24 space-y-3">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => onCategoryClick(category)}
            index={index}
          />
        ))}

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categories.length * 0.05 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAddCategory}
          className="w-full p-4 border-2 border-dashed border-border rounded-2xl
                     flex items-center justify-center gap-3 text-muted-foreground
                     hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Add Category</span>
        </motion.button>
      </div>

      <FloatingActionButton onClick={onAddCategory} />
    </motion.div>
  );
}