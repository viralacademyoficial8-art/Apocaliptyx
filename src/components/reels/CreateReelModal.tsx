'use client';

import { useState, useRef } from 'react';
import { Upload, X, Video, Hash, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreateReelModalProps {
  onCreateReel: (data: {
    videoFile: File;
    caption: string;
    tags: string[];
  }) => void;
}

export function CreateReelModal({ onCreateReel }: CreateReelModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!videoFile) return;

    onCreateReel({
      videoFile,
      caption,
      tags,
    });

    // Reset form
    setVideoFile(null);
    setVideoPreview(null);
    setCaption('');
    setTags([]);
    setIsOpen(false);
  };

  const handleClose = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setCaption('');
    setTags([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Video className="w-4 h-4 mr-2" />
          Crear Reel
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-400" />
            Crear nuevo Reel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Video Upload */}
          {!videoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-1">Haz clic para subir un video</p>
              <p className="text-xs text-gray-500">MP4, MOV hasta 100MB</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoPreview}
                className="w-full aspect-[9/16] max-h-[300px] object-cover rounded-xl"
                controls
              />
              <button
                onClick={() => {
                  URL.revokeObjectURL(videoPreview);
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Descripción</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escribe una descripción..."
              className="bg-gray-800 border-gray-700"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {caption.length}/300
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Etiquetas (máx. 5)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Agregar etiqueta"
                  className="pl-9 bg-gray-800 border-gray-700"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="border-gray-700"
                disabled={tags.length >= 5}
              >
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!videoFile}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Publicar Reel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
