'use client';

import { useState, useRef } from 'react';
import { Music, Upload, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProfileMusicSelectorProps {
  currentMusic?: {
    url: string;
    title: string;
    artist: string;
  } | null;
  onSelect: (music: { url: string; title: string; artist: string } | null) => void;
}

const popularTracks = [
  { title: 'Chill Vibes', artist: 'LoFi Station', url: '/audio/chill.mp3' },
  { title: 'Epic Gaming', artist: 'GameBeats', url: '/audio/epic.mp3' },
  { title: 'Night Drive', artist: 'Synthwave', url: '/audio/night.mp3' },
  { title: 'Focus Mode', artist: 'Study Music', url: '/audio/focus.mp3' },
  { title: 'Party Time', artist: 'EDM Mix', url: '/audio/party.mp3' },
  { title: 'Relaxing Piano', artist: 'Classical', url: '/audio/piano.mp3' },
];

export function ProfileMusicSelector({
  currentMusic,
  onSelect,
}: ProfileMusicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelect({
        url,
        title: customTitle || file.name.replace(/\.[^/.]+$/, ''),
        artist: customArtist || 'Unknown Artist',
      });
      setIsOpen(false);
    }
  };

  const handleSelectTrack = (track: { title: string; artist: string; url: string }) => {
    onSelect(track);
    setIsOpen(false);
  };

  const handleRemoveMusic = () => {
    onSelect(null);
    setIsOpen(false);
  };

  const filteredTracks = popularTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <Music className="w-4 h-4 mr-2" />
          {currentMusic ? 'Cambiar música' : 'Agregar música'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Música del perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Music */}
          {currentMusic && (
            <div className="flex items-center justify-between bg-muted rounded-lg p-3 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{currentMusic.title}</p>
                  <p className="text-xs text-muted-foreground">{currentMusic.artist}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveMusic}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canciones..."
              className="pl-10 bg-muted border-border"
            />
          </div>

          {/* Popular Tracks */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <label className="text-sm text-muted-foreground block">Canciones populares</label>
            {filteredTracks.map((track, index) => (
              <button
                key={index}
                onClick={() => handleSelectTrack(track)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{track.title}</p>
                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Upload Custom */}
          <div className="border-t border-border pt-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              Subir tu propia música
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Título"
                  className="bg-muted border-border"
                />
                <Input
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  placeholder="Artista"
                  className="bg-muted border-border"
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full border-border"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo de audio
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
