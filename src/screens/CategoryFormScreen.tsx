import { useState } from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types/lockr';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { IconSelector } from '@/components/lockr/IconSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryFormScreenProps {
  category?: Category;
  onBack: () => void;
  onSave: (data: { name: string; icon: string }) => void;
  onDelete?: () => void;
}

export function CategoryFormScreen({
  category,
  onBack,
  onSave,
  onDelete,
}: CategoryFormScreenProps) {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || 'Folder');

  const isEdit = !!category;

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), icon });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      <ScreenHeader
        title={isEdit ? 'Edit Category' : 'Add Category'}
        onBack={onBack}
      />

      <div className="p-4 space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Category Name
          </label>
          <Input
            type="text"
            placeholder="e.g., Entertainment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 bg-card border-border rounded-xl text-foreground 
                       placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Choose Icon
          </label>
          <IconSelector selectedIcon={icon} onSelect={setIcon} />
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-glow 
                       text-primary-foreground rounded-2xl shadow-glow transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>

          {isEdit && onDelete && (
            <Button
              onClick={onDelete}
              variant="ghost"
              className="w-full h-12 text-destructive hover:bg-destructive/10 rounded-xl"
            >
              Delete Category
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}