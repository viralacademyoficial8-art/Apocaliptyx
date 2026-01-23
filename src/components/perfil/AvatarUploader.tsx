// src/components/perfil/AvatarUploader.tsx

'use client';
// Al inicio del archivo, agregar:
import Image from 'next/image';
import { useState, useRef } from 'react';
import { Camera, Upload, Trash2, User } from 'lucide-react';


interface AvatarUploaderProps {
  currentAvatar: string | null;
  onAvatarChange: (file: File | null) => void;
  size?: 'md' | 'lg' | 'xl';
}

export function AvatarUploader({
  currentAvatar,
  onAvatarChange,
  size = 'lg',
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizes = {
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onAvatarChange(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onAvatarChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div
        className={`relative ${sizes[size]} rounded-full overflow-hidden border-4 ${
          isDragging ? 'border-purple-500 scale-105' : 'border-border'
        } transition-all cursor-pointer group`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          // DESPUÉS (sin warning):
          // 
          // DESPUÉS (sin warning):
<Image
  src={preview}
  alt="Avatar"
  fill
  className="object-cover"
  unoptimized
/>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Subir imagen
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-muted-foreground text-xs text-center">
        JPG, PNG o GIF. Máximo 5MB.
      </p>
    </div>
  );
}