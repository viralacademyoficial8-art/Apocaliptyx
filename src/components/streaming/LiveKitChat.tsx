'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useDataChannel,
  useLocalParticipant,
  useParticipants,
} from '@livekit/components-react';
import { Send, Pin, Sparkles, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/stores';

interface ChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  content: string;
  timestamp: number;
  isHighlighted?: boolean;
  highlightAmount?: number;
}

interface LiveKitChatProps {
  streamId: string;
}

const CHAT_TOPIC = 'chat';

export function LiveKitChat({ streamId }: LiveKitChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming messages
  const onMessage = useCallback((msg: { payload: Uint8Array }) => {
    try {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(msg.payload));

      if (data.type === 'chat') {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id || `${Date.now()}-${Math.random()}`,
            participantId: data.participantId,
            participantName: data.participantName,
            content: data.content,
            timestamp: data.timestamp || Date.now(),
            isHighlighted: data.isHighlighted,
            highlightAmount: data.highlightAmount,
          },
        ]);
      }
    } catch (error) {
      console.error('Error parsing chat message:', error);
    }
  }, []);

  // Subscribe to data channel
  const { send } = useDataChannel(CHAT_TOPIC, onMessage);

  // Send message
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !localParticipant) return;

    const messageData = {
      type: 'chat',
      id: `${Date.now()}-${localParticipant.identity}`,
      participantId: localParticipant.identity,
      participantName: localParticipant.name || 'Anonymous',
      content: inputMessage.trim(),
      timestamp: Date.now(),
      isHighlighted: showHighlight,
      highlightAmount: showHighlight ? 50 : undefined,
    };

    // Send to all participants
    const encoder = new TextEncoder();
    send(encoder.encode(JSON.stringify(messageData)), { reliable: true });

    // Add to local messages
    setMessages((prev) => [
      ...prev,
      {
        id: messageData.id,
        participantId: messageData.participantId,
        participantName: messageData.participantName,
        content: messageData.content,
        timestamp: messageData.timestamp,
        isHighlighted: messageData.isHighlighted,
        highlightAmount: messageData.highlightAmount,
      },
    ]);

    setInputMessage('');
    setShowHighlight(false);
  }, [inputMessage, localParticipant, send, showHighlight]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold">Chat en vivo</h3>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          {participants.length}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
            <span>No hay mensajes todavía</span>
            <span>¡Sé el primero en escribir!</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.isHighlighted
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-2 rounded-lg border border-yellow-500/30'
                  : ''
              }`}
            >
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarFallback className="text-xs bg-purple-600">
                  {msg.participantName[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-medium text-sm ${
                      msg.isHighlighted ? 'text-yellow-400' : 'text-purple-400'
                    }`}
                  >
                    {msg.participantName}
                  </span>
                  {msg.isHighlighted && msg.highlightAmount && (
                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {msg.highlightAmount} AP
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {user ? (
        <div className="p-3 border-t border-gray-800">
          {showHighlight && (
            <div className="flex items-center justify-between bg-yellow-500/20 p-2 rounded-lg mb-2">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Sparkles className="w-4 h-4" />
                Super Chat (50 AP)
              </div>
              <button
                onClick={() => setShowHighlight(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Cancelar
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHighlight(!showHighlight)}
              className={`border-gray-700 flex-shrink-0 ${
                showHighlight ? 'bg-yellow-500/20 border-yellow-500' : ''
              }`}
              title="Super Chat"
            >
              <Sparkles className={`w-4 h-4 ${showHighlight ? 'text-yellow-400' : ''}`} />
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Envía un mensaje..."
              className="flex-1 bg-gray-800 border-gray-700"
              maxLength={200}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-gray-800 text-center text-sm text-gray-400">
          Inicia sesión para chatear
        </div>
      )}
    </div>
  );
}
