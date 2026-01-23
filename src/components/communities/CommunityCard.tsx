'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  MoreVertical,
  Link2,
  Share2,
  Flag,
  UserPlus,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Social media SVG icons
const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  themeColor: string;
  isPublic: boolean;
  isVerified: boolean;
  membersCount: number;
  postsCount: number;
  categories: string[];
  requestStatus?: 'pending' | 'approved' | 'rejected' | null;
}

interface CommunityCardProps {
  community: Community;
  isMember?: boolean;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  onRequestJoin?: (communityId: string) => void;
}

export function CommunityCard({
  community,
  isMember = false,
  onJoin,
  onLeave,
  onRequestJoin,
}: CommunityCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const communityUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/foro/comunidad/${community.slug}`
    : `/foro/comunidad/${community.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(communityUrl);
      toast.success('Enlace copiado al portapapeles');
      setShowMenu(false);
    } catch {
      toast.error('Error al copiar enlace');
    }
  };

  const handleShare = (platform: string) => {
    const text = `Únete a la comunidad "${community.name}" en Apocaliptyx`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(communityUrl);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Selecciona un motivo');
      return;
    }
    setIsReporting(true);
    try {
      const response = await fetch(`/api/communities/${community.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, description: reportDescription }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      toast.success(data.message || 'Reporte enviado');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar reporte');
    } finally {
      setIsReporting(false);
    }
  };

  const handleJoinClick = () => {
    if (!community.isPublic) {
      // Private community - request to join
      onRequestJoin?.(community.id);
    } else {
      // Public community - join directly
      onJoin?.(community.id);
    }
  };

  return (
    <>
      <div className="bg-muted/50 rounded-xl border border-border overflow-hidden hover:border-border transition-colors group relative">
        {/* Banner */}
        <div
          className="h-24 relative"
          style={{
            background: community.bannerUrl
              ? `url(${community.bannerUrl}) center/cover`
              : `linear-gradient(135deg, ${community.themeColor}60, ${community.themeColor}20)`,
          }}
        >
          {/* Icon */}
          <div className="absolute -bottom-6 left-4">
            {community.iconUrl ? (
              <img
                src={community.iconUrl}
                alt={community.name}
                className="w-14 h-14 rounded-xl border-4 border-border object-cover"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl border-4 border-border flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: community.themeColor }}
              >
                {community.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 right-12 flex gap-1">
            {!community.isPublic && (
              <span className="bg-card/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Privada
              </span>
            )}
            {community.isVerified && (
              <span className="bg-blue-500/20 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1 text-blue-400">
                <CheckCircle className="w-3 h-3" />
                Verificada
              </span>
            )}
          </div>

          {/* 3-dot Menu Button */}
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="bg-card/80 backdrop-blur-sm p-1.5 rounded hover:bg-muted transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-muted border border-border rounded-lg shadow-xl z-50 min-w-[180px] py-1">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Copiar enlace
                </button>

                {/* Share submenu */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </button>

                  {showShareMenu && (
                    <div className="absolute left-full top-0 ml-1 bg-muted border border-border rounded-lg shadow-xl min-w-[150px] py-1">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <TwitterIcon />
                        X (Twitter)
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <FacebookIcon />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <WhatsAppIcon />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('telegram')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <TelegramIcon />
                        Telegram
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border my-1" />

                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-400"
                >
                  <Flag className="w-4 h-4" />
                  Reportar comunidad
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-8">
          <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">
            {community.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {community.description}
          </p>

          {/* Categories */}
          {community.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {community.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {community.membersCount.toLocaleString()} miembros
            </span>
            <span>{community.postsCount.toLocaleString()} posts</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isMember ? (
              <>
                <Link href={`/foro/comunidad/${community.slug}`} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Ver comunidad
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                {onLeave && (
                  <Button
                    variant="outline"
                    onClick={() => onLeave(community.id)}
                    className="border-border"
                  >
                    Salir
                  </Button>
                )}
              </>
            ) : community.requestStatus === 'pending' ? (
              <Button
                disabled
                className="w-full bg-yellow-600/20 text-yellow-400 cursor-not-allowed"
              >
                <Clock className="w-4 h-4 mr-2" />
                Solicitud pendiente
              </Button>
            ) : !community.isPublic ? (
              <div className="flex gap-2 w-full items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-600/20 rounded-lg">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <Button
                  onClick={handleJoinClick}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Solicitar unirse
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleJoinClick}
                className="w-full bg-muted hover:bg-muted"
              >
                Unirse
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-muted rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                Reportar comunidad
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              ¿Por qué quieres reportar &quot;{community.name}&quot;?
            </p>

            <div className="space-y-2 mb-4">
              {[
                { value: 'spam', label: 'Spam o contenido engañoso' },
                { value: 'inappropriate', label: 'Contenido inapropiado' },
                { value: 'harassment', label: 'Acoso o bullying' },
                { value: 'misinformation', label: 'Información falsa' },
                { value: 'other', label: 'Otro motivo' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    reportReason === option.value
                      ? 'bg-red-500/20 border border-red-500'
                      : 'bg-muted hover:bg-muted border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={option.value}
                    checked={reportReason === option.value}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reportReason === option.value
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-500'
                    }`}
                  >
                    {reportReason === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe el problema (opcional)..."
              className="w-full bg-muted border border-border rounded-lg p-3 text-sm resize-none h-24 mb-4"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportModal(false)}
                className="flex-1 border-border"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReport}
                disabled={isReporting || !reportReason}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isReporting ? 'Enviando...' : 'Enviar reporte'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
