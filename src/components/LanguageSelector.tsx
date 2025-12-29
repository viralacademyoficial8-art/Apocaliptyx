// src/components/LanguageSelector.tsx
'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { getLanguageByCode } from '@/i18n/settings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
}

export function LanguageSelector({
  variant = 'default',
  className,
}: LanguageSelectorProps) {
  const { language, setLanguage, languages } = useLanguage();
  const currentLang = getLanguageByCode(language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'minimal' ? 'icon' : 'sm'}
          className={cn(
            'gap-2 hover:bg-muted transition-colors min-w-fit whitespace-nowrap',
            className,
          )}
        >
          <span className="text-lg">{currentLang.flag}</span>

          {variant === 'full' && (
            <span className="hidden sm:inline truncate max-w-[120px]">
              {currentLang.nativeName}
            </span>
          )}

          {variant === 'default' && (
            <span className="hidden sm:inline uppercase text-xs font-medium">
              {currentLang.code}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-card border-border min-w-[220px]"
      >
        <AnimatePresence>
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DropdownMenuItem
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  'flex items-center justify-between gap-3 cursor-pointer',
                  language === lang.code && 'bg-purple-500/10',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {lang.name}
                    </span>
                  </div>
                </div>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
