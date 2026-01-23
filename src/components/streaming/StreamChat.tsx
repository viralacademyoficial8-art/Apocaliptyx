'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Pin, Sparkles, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  isPinned: boolean;
  isHighlighted: boolean;
  highlightAmount?: number;
  createdAt: string;
}

interface StreamChatProps {
  streamId: string;
  messages: ChatMessage[];
  viewersCount: number;
  currentUserId?: string;
  isLive?: boolean;
  onSendMessage: (content: string, isHighlighted?: boolean) => void;
  onPinMessage?: (messageId: string) => void;
}

export function StreamChat({
  streamId,
  messages,
  viewersCount,
  currentUserId,
  isLive = true,
  onSendMessage,
  onPinMessage,
}: StreamChatProps) {
  const [message, setMessage] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message, showHighlight);
    setMessage('');
    setShowHighlight(false);
  };

  const pinnedMessage = messages.find((m) => m.isPinned);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Chat en vivo</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {viewersCount.toLocaleString()}
        </div>
      </div>

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className="p-2 bg-purple-500/20 border-b border-purple-500/30">
          <div className="flex items-start gap-2">
            <Pin className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm text-purple-400">
                {pinnedMessage.displayName}:
              </span>
              <span className="text-sm text-white ml-1">{pinnedMessage.content}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${
              msg.isHighlighted
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-2 rounded-lg border border-yellow-500/30'
                : ''
            }`}
          >
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={msg.avatarUrl} />
              <AvatarFallback className="text-xs">
                {msg.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium text-sm ${
                    msg.isHighlighted ? 'text-yellow-400' : 'text-purple-400'
                  }`}
                >
                  {msg.displayName}
                </span>
                {msg.isHighlighted && msg.highlightAmount && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {msg.highlightAmount} AP
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isLive && currentUserId ? (
        <div className="p-3 border-t border-border">
          {showHighlight && (
            <div className="flex items-center justify-between bg-yellow-500/20 p-2 rounded-lg mb-2">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Sparkles className="w-4 h-4" />
                Super Chat (50 AP)
              </div>
              <button
                onClick={() => setShowHighlight(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHighlight(!showHighlight)}
              className={`border-border ${
                showHighlight ? 'bg-yellow-500/20 border-yellow-500' : ''
              }`}
            >
              <Sparkles className={`w-4 h-4 ${showHighlight ? 'text-yellow-400' : ''}`} />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Envía un mensaje..."
              className="flex-1 bg-muted border-border"
              maxLength={200}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-border text-center text-sm text-muted-foreground">
          {!isLive ? 'El stream ha terminado' : 'Inicia sesión para chatear'}
        </div>
      )}
    </div>
  );
}
