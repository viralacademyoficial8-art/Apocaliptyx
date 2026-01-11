'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Type, Palette, Upload, Loader2, Link as LinkIcon, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinkPreview, extractUrls } from '@/components/LinkPreview';

interface CreateStoryModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

const BACKGROUND_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560',
  '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#c0392b',
  '#1abc9c', '#34495e', '#2c3e50', '#d35400', '#7f8c8d',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const TEXT_COLORS = ['#ffffff', '#000000', '#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#1abc9c'];

const FONT_STYLES = [
  { id: 'normal', label: 'Normal', className: '' },
  { id: 'bold', label: 'Negrita', className: 'font-bold' },
  { id: 'italic', label: 'Cursiva', className: 'italic' },
];

export function CreateStoryModal({ onClose, onSuccess }: CreateStoryModalProps) {
  const [mode, setMode] = useState<'text' | 'media' | 'link'>('text');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0]);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [fontStyle, setFontStyle] = useState('normal');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch link preview when URL changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!linkUrl) {
        setLinkPreview(null);
        return;
      }

      // Extract URL from text
      const urls = extractUrls(linkUrl);
      if (urls.length === 0) {
        setLinkPreview(null);
        return;
      }

      setLoadingPreview(true);
      try {
        const response = await fetch('/api/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urls[0] }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setLinkPreview(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching preview:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    const debounce = setTimeout(fetchPreview, 500);
    return () => clearTimeout(debounce);
  }, [linkUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only allow images (no videos)
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes');
        return;
      }

      // Validate file size (10MB max for images)
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 10MB.');
        return;
      }

      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMode('media');
      setLinkUrl('');
      setLinkPreview(null);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMode('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeLink = () => {
    setLinkUrl('');
    setLinkPreview(null);
    setMode('text');
  };

  const handleSubmit = async () => {
    if (!content && !mediaFile && !linkPreview) {
      alert('Agrega texto, una imagen o un link');
      return;
    }

    setIsUploading(true);

    try {
      let response;

      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        if (content) formData.append('content', content);
        formData.append('backgroundColor', backgroundColor);
        formData.append('textColor', textColor);
        formData.append('fontStyle', fontStyle);

        response = await fetch('/api/stories', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            backgroundColor,
            textColor,
            fontStyle,
            linkUrl: linkPreview?.url || null,
            linkPreview: linkPreview || null,
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        onSuccess?.();
        onClose();
      } else {
        alert(data.error || 'Error al publicar story');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Error al publicar story');
    } finally {
      setIsUploading(false);
    }
  };

  const currentFontClass = FONT_STYLES.find(f => f.id === fontStyle)?.className || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Crear Story</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto">
          <div
            className="relative w-full aspect-[9/16] max-h-[400px] flex items-center justify-center"
            style={{
              background: backgroundColor.startsWith('linear') ? backgroundColor : backgroundColor,
            }}
          >
            {mediaPreview ? (
              <>
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : linkPreview ? (
              <div className="w-full h-full flex flex-col">
                {/* Link preview in story */}
                {linkPreview.image && (
                  <div className="flex-1 relative">
                    <img
                      src={linkPreview.image}
                      alt={linkPreview.title || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                )}
                <div className={cn(
                  'absolute bottom-0 left-0 right-0 p-4',
                  !linkPreview.image && 'top-0 flex flex-col items-center justify-center'
                )}>
                  {linkPreview.siteName && (
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">{linkPreview.siteName}</span>
                    </div>
                  )}
                  {linkPreview.title && (
                    <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">
                      {linkPreview.title}
                    </h3>
                  )}
                  {linkPreview.description && !linkPreview.image && (
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {linkPreview.description}
                    </p>
                  )}
                  {content && (
                    <p className={cn('text-white mt-2', currentFontClass)} style={{ color: textColor }}>
                      {content}
                    </p>
                  )}
                </div>
                <button
                  onClick={removeLink}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : content ? (
              <div className={cn('px-6 text-center', currentFontClass)} style={{ color: textColor }}>
                <p className="text-2xl leading-relaxed break-words">{content}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Vista previa de tu story</p>
            )}
          </div>
        </div>

        {/* Text input */}
        <div className="p-4 border-t border-gray-800">
          {mode === 'link' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Pega un link de YouTube, Twitter, etc..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {loadingPreview && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando vista previa...
                </div>
              )}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Añade un comentario (opcional)..."
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
                maxLength={200}
              />
              <p className="text-gray-500 text-xs text-right">{content.length}/200</p>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu story..."
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
                maxLength={500}
              />
              <p className="text-gray-500 text-xs text-right mt-1">{content.length}/500</p>
            </>
          )}
        </div>

        {/* Tools */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {/* Mode toggles */}
            <button
              type="button"
              onClick={() => {
                setMode('text');
                setLinkUrl('');
                setLinkPreview(null);
                removeMedia();
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                mode === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              <Type className="w-4 h-4" />
              Texto
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                mode === 'media' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Imagen
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMode('link');
                setMediaFile(null);
                setMediaPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer select-none',
                mode === 'link' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              <LinkIcon className="w-4 h-4" />
              Link
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Color picker toggle */}
            <button
              onClick={() => setShowColorPicker(prev => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors ml-auto"
            >
              <Palette className="w-4 h-4" />
              Colores
            </button>
          </div>

          {/* Color picker panel */}
          {showColorPicker && (
            <div className="space-y-4 mb-4">
              {/* Background colors */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Fondo</p>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_COLORS.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setBackgroundColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                        backgroundColor === color ? 'border-white scale-110' : 'border-transparent'
                      )}
                      style={{
                        background: color,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Text colors */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Color de texto</p>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLORS.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setTextColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                        textColor === color ? 'border-purple-500 scale-110' : 'border-gray-600'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Font styles */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Estilo de fuente</p>
                <div className="flex gap-2">
                  {FONT_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setFontStyle(style.id)}
                      className={cn(
                        'px-4 py-2 rounded-lg transition-colors',
                        style.className,
                        fontStyle === style.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleSubmit}
            disabled={isUploading || (!content && !mediaFile && !linkPreview)}
            className={cn(
              'w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors',
              isUploading || (!content && !mediaFile && !linkPreview)
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Publicar Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateStoryModal;
