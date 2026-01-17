import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2 } from 'lucide-react';
import { Category, Entry } from '@/types/lockr';
import { EntryCard } from '@/components/lockr/EntryCard';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { FloatingActionButton } from '@/components/lockr/FloatingActionButton';
import { Input } from '@/components/ui/input';

interface EntryListScreenProps {
  category: Category;
  entries: Entry[];
  onBack: () => void;
  onEntryClick: (entry: Entry) => void;
  onAddEntry: () => void;
  onEditCategory: () => void;
}

export function EntryListScreen({
  category,
  entries,
  onBack,
  onEntryClick,
  onAddEntry,
  onEditCategory,
}: EntryListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      <ScreenHeader
        title={category.name}
        onBack={onBack}
        showMore
        onMore={onEditCategory}
      />

      <div className="p-4 pb-24">
        <div className="relative mb-4">
          <Search 
            size={18} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-11 bg-card border-border rounded-xl text-foreground 
                       placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              {searchQuery ? 'No matching entries found' : 'No entries yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground mt-1">
                Tap + to add your first entry
              </p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => onEntryClick(entry)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={onAddEntry} />
    </motion.div>
  );
}