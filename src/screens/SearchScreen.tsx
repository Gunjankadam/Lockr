import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { Entry, Category } from '@/types/lockr';
import { EntryCard } from '@/components/lockr/EntryCard';
import { Input } from '@/components/ui/input';

interface SearchScreenProps {
  entries: Entry[];
  categories: Category[];
  onBack: () => void;
  onEntryClick: (entry: Entry) => void;
}

export function SearchScreen({
  entries,
  categories,
  onBack,
  onEntryClick,
}: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let results = query.trim()
      ? entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query.toLowerCase()) ||
          entry.username.toLowerCase().includes(query.toLowerCase()) ||
          entry.notes?.toLowerCase().includes(query.toLowerCase()) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      : [];

    // Apply category filter
    if (selectedCategory) {
      results = results.filter(entry => entry.categoryId === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag) {
      results = results.filter(entry => entry.tags?.includes(selectedTag));
    }

    return results;
  }, [entries, query, selectedCategory, selectedTag]);

  const hasActiveFilters = selectedCategory || selectedTag;

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="p-4 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search all entries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-11 pr-24 bg-card border-border rounded-2xl text-foreground 
                       placeholder:text-muted-foreground focus:ring-2 focus:ring-primary text-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${hasActiveFilters
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-secondary text-muted-foreground'
                }`}
              title="Filters"
            >
              <Filter size={18} />
            </button>
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-xl p-4 space-y-4 mt-3"
          >
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedTag
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedTag === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="p-4">
        {query.trim() === '' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              Start typing to search your vault
            </p>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              No entries found for "{query}"
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {filteredEntries.length} result{filteredEntries.length !== 1 && 's'} found
            </p>
            {filteredEntries.map((entry, index) => (
              <div key={entry.id}>
                <span className="text-xs text-muted-foreground block mb-1 ml-1">
                  {getCategoryName(entry.categoryId)}
                </span>
                <EntryCard
                  entry={entry}
                  onClick={() => onEntryClick(entry)}
                  index={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}