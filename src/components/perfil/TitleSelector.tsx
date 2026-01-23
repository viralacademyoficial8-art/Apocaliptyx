// src/components/perfil/TitleSelector.tsx

'use client';

import { Check, Crown, Lock } from 'lucide-react';

interface Title {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isOwned: boolean;
}

interface TitleSelectorProps {
  titles: Title[];
  selectedTitle: string | null;
  onSelect: (titleId: string | null) => void;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  COMMON: { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground' },
  RARE: { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400' },
  EPIC: { bg: 'bg-purple-900/30', border: 'border-purple-500/50', text: 'text-purple-400' },
  LEGENDARY: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-400' },
};

export function TitleSelector({ titles, selectedTitle, onSelect }: TitleSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Option: No title */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
          selectedTitle === null
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-border bg-muted hover:border-border'
        }`}
      >
        <span className="text-muted-foreground">Sin título</span>
        {selectedTitle === null && (
          <Check className="w-5 h-5 text-purple-400" />
        )}
      </button>

      {/* Available Titles */}
      {titles.map((title) => {
        const rarity = rarityColors[title.rarity];
        const isSelected = selectedTitle === title.id;

        return (
          <button
            key={title.id}
            type="button"
            onClick={() => title.isOwned && onSelect(title.id)}
            disabled={!title.isOwned}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              !title.isOwned
                ? 'border-border bg-card opacity-50 cursor-not-allowed'
                : isSelected
                  ? `${rarity.border} ${rarity.bg}`
                  : `border-border bg-muted hover:border-border`
            }`}
          >
            <div className="flex items-center gap-3">
              <Crown className={`w-5 h-5 ${title.isOwned ? rarity.text : 'text-muted-foreground'}`} />
              <div className="text-left">
                <p className={title.isOwned ? 'text-white' : 'text-muted-foreground'}>
                  {title.name}
                </p>
                <p className={`text-xs ${rarity.text}`}>{title.rarity}</p>
              </div>
            </div>
            {!title.isOwned ? (
              <Lock className="w-4 h-4 text-muted-foreground" />
            ) : isSelected ? (
              <Check className={`w-5 h-5 ${rarity.text}`} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}