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
import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal' | 'full' | 'mobile';
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({
  variant = 'default',
  className,
  showLabel = false,
}: LanguageSelectorProps) {
  const { language, setLanguage, languages } = useLanguage();
  const currentLang = getLanguageByCode(language);

  // Mobile variant - full width button style for mobile menus
  if (variant === 'mobile') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              className,
            )}
          >
            <Globe className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">
              {currentLang.flag} {currentLang.nativeName}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="bg-card border-border min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <AnimatePresence>
            {languages.map((lang, index) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <DropdownMenuItem
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'flex items-center justify-between gap-3 cursor-pointer py-2.5',
                    language === lang.code && 'bg-purple-500/10',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium truncate">
                      {lang.nativeName}
                    </span>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'minimal' ? 'icon' : 'sm'}
          className={cn(
            'gap-1.5 sm:gap-2 hover:bg-muted transition-colors min-w-fit whitespace-nowrap px-2 sm:px-3',
            className,
          )}
        >
          <span className="text-base sm:text-lg">{currentLang.flag}</span>

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

          {showLabel && (
            <span className="sr-only sm:not-sr-only text-xs font-medium">
              {currentLang.code.toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="bg-card border-border min-w-[200px] sm:min-w-[220px] max-h-[70vh] overflow-y-auto"
      >
        <AnimatePresence>
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <DropdownMenuItem
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  'flex items-center justify-between gap-3 cursor-pointer py-2 sm:py-2.5',
                  language === lang.code && 'bg-purple-500/10',
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-base sm:text-lg">{lang.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate text-sm sm:text-base">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">
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
