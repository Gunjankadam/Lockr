import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Plus, Trash2, Lock, LockOpen, Wand2 } from 'lucide-react';
import { Entry, CustomField } from '@/types/lockr';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PasswordGenerator } from '@/components/lockr/PasswordGenerator';
import { TagInput } from '@/components/lockr/TagInput';

interface EntryFormScreenProps {
  entry?: Entry;
  categoryId: string;
  onBack: () => void;
  onSave: (data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
}

export function EntryFormScreen({
  entry,
  categoryId,
  onBack,
  onSave,
  onDelete,
}: EntryFormScreenProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [username, setUsername] = useState(entry?.username || '');
  const [password, setPassword] = useState(entry?.password || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [customFields, setCustomFields] = useState<CustomField[]>(
    entry?.customFields || []
  );
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const isEdit = !!entry;

  const handleAddCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: Date.now().toString(), name: '', value: '' },
    ]);
  };

  const handleUpdateCustomField = (id: string, field: Partial<CustomField>) => {
    setCustomFields(
      customFields.map((cf) => (cf.id === id ? { ...cf, ...field } : cf))
    );
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(customFields.filter((cf) => cf.id !== id));
  };

  const handleSave = () => {
    if (title.trim() && username.trim() && password.trim()) {
      onSave({
        categoryId,
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        notes: notes.trim() || undefined,
        customFields: customFields.filter((cf) => cf.name.trim() && cf.value.trim()),
        tags,
      });
    }
  };

  const isValid = title.trim() && username.trim() && password.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      <ScreenHeader
        title={isEdit ? 'Edit Entry' : 'Add Entry'}
        onBack={onBack}
      />

      <div className="p-4 pb-32 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Title
          </label>
          <Input
            type="text"
            placeholder="e.g., Gmail"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-14 bg-card border-border rounded-xl text-foreground 
                       placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Username / Email
          </label>
          <Input
            type="text"
            placeholder="user@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-14 bg-card border-border rounded-xl text-foreground 
                       placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 pr-24 bg-card border-border rounded-xl text-foreground 
                         placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={() => setShowGenerator(true)}
                className="p-2 rounded-lg hover:bg-secondary text-primary transition-colors"
                title="Generate Password"
              >
                <Wand2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground
                           hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Notes <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 bg-card border-border rounded-xl text-foreground 
                       placeholder:text-muted-foreground focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Tags <span className="text-muted-foreground">(optional)</span>
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Type and press Enter..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Custom Fields
          </label>
          <div className="space-y-3">
            {customFields.map((field) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) =>
                    handleUpdateCustomField(field.id, { name: e.target.value })
                  }
                  className="flex-1 h-12 bg-card border-border rounded-xl text-foreground 
                             placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
                <Input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) =>
                    handleUpdateCustomField(field.id, { value: e.target.value })
                  }
                  className="flex-1 h-12 bg-card border-border rounded-xl text-foreground 
                             placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateCustomField(field.id, { isEncrypted: !field.isEncrypted })}
                  className={`p-3 rounded-xl transition-colors ${field.isEncrypted
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  title={field.isEncrypted ? 'Encrypted' : 'Not encrypted'}
                >
                  {field.isEncrypted ? <Lock size={18} /> : <LockOpen size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(field.id)}
                  className="p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground
                             hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            <Button
              onClick={handleAddCustomField}
              variant="ghost"
              className="w-full h-12 border border-dashed border-border rounded-xl
                         text-muted-foreground hover:text-primary hover:border-primary"
            >
              <Plus size={18} className="mr-2" />
              Add Custom Field
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl 
                      border-t border-border/50 space-y-3">
        <Button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-glow 
                     text-primary-foreground rounded-2xl shadow-glow transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEdit ? 'Save Changes' : 'Save Entry'}
        </Button>

        {isEdit && onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            className="w-full h-12 text-destructive hover:bg-destructive/10 rounded-xl"
          >
            Delete Entry
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showGenerator && (
          <PasswordGenerator
            onClose={() => setShowGenerator(false)}
            onUsePassword={(pwd) => setPassword(pwd)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}