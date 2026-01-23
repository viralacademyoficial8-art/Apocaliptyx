'use client';

import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'general' | 'prediction_contest' | 'ama' | 'live_stream';
  imageUrl?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  participantsCount: number;
  isCancelled: boolean;
}

interface CommunityEventCardProps {
  event: CommunityEvent;
  isParticipating?: boolean;
  onParticipate?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
}

const eventTypeLabels = {
  general: { label: 'Evento', color: 'bg-muted' },
  prediction_contest: { label: 'Concurso', color: 'bg-purple-600' },
  ama: { label: 'AMA', color: 'bg-blue-600' },
  live_stream: { label: 'En vivo', color: 'bg-red-600' },
};

export function CommunityEventCard({
  event,
  isParticipating = false,
  onParticipate,
  onCancel,
}: CommunityEventCardProps) {
  const startDate = new Date(event.startTime);
  const isUpcoming = startDate > new Date();
  const isLive =
    startDate <= new Date() &&
    (!event.endTime || new Date(event.endTime) > new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-muted/50 rounded-xl border overflow-hidden ${
        event.isCancelled
          ? 'border-red-500/50 opacity-60'
          : isLive
          ? 'border-red-500 animate-pulse-subtle'
          : 'border-border'
      }`}
    >
      {/* Image */}
      {event.imageUrl && (
        <div className="relative h-32">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
      )}

      <div className="p-4">
        {/* Type Badge & Status */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              eventTypeLabels[event.eventType].color
            }`}
          >
            {eventTypeLabels[event.eventType].label}
          </span>
          {event.isCancelled ? (
            <span className="text-xs text-red-400">Cancelado</span>
          ) : isLive ? (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              En vivo
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h4 className="font-semibold mb-2">{event.title}</h4>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {event.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(startDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {event.participantsCount}
              {event.maxParticipants && ` / ${event.maxParticipants}`} participantes
            </span>
          </div>
        </div>

        {/* Action */}
        {!event.isCancelled && (
          <>
            {isParticipating ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-green-500 text-green-400"
                  disabled
                >
                  Participando
                </Button>
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={() => onCancel(event.id)}
                    className="border-border text-muted-foreground"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={() => onParticipate?.(event.id)}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={
                  !isUpcoming ||
                  (event.maxParticipants !== undefined &&
                    event.participantsCount >= event.maxParticipants)
                }
              >
                {event.maxParticipants !== undefined &&
                event.participantsCount >= event.maxParticipants
                  ? 'Lleno'
                  : 'Participar'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
