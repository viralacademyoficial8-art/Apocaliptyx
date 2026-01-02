'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { chatService, Conversation, Message } from '@/services/chat.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  Loader2,
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';

function MensajesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar conversaciones
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      const data = await chatService.getConversations(userId);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar mensajes de una conversación
  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      
      // Marcar como leídos
      if (userId) {
        await chatService.markAsRead(conversationId, userId);
        loadConversations(); // Actualizar contadores
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId, loadConversations]);

  // Cargar conversaciones al inicio
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (userId) {
      loadConversations();
    }
  }, [userId, status, router, loadConversations]);

  // Manejar parámetro de conversación en URL
  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(convId);
      }
    }
  }, [searchParams, conversations, loadMessages]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = chatService.subscribeToMessages(
      selectedConversation.id,
      (newMsg) => {
        setMessages(prev => {
          // Evitar duplicados
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
        
        // Marcar como leído si no es del usuario actual
        if (newMsg.sender_id !== userId) {
          chatService.markAsRead(selectedConversation.id, userId!);
        }
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, userId]);

  // Scroll cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enviar mensaje
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !userId || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const sent = await chatService.sendMessage(
        selectedConversation.id,
        userId,
        messageContent
      );

      if (sent) {
        // El mensaje llegará por el realtime, pero agregamos por si acaso
        setMessages(prev => {
          if (prev.some(m => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
        loadConversations(); // Actualizar último mensaje
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restaurar mensaje si falla
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Seleccionar conversación
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    loadMessages(conv.id);
    router.push(`/mensajes?conv=${conv.id}`, { scroll: false });
  };

  // Volver a lista de conversaciones (móvil)
  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
    router.push('/mensajes', { scroll: false });
  };

  // Filtrar conversaciones
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.other_user?.display_name || conv.other_user?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-6">
        <div className="bg-gray-900 border border-gray-800 rounded-none sm:rounded-xl overflow-hidden h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)]">
          <div className="flex h-full">
            {/* Lista de conversaciones */}
            <div className={`
              w-full md:w-80 lg:w-96 border-r border-gray-800 flex flex-col
              ${selectedConversation ? 'hidden md:flex' : 'flex'}
            `}>
              {/* Header */}
              <div className="p-4 border-b border-gray-800">
                <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                  Mensajes
                </h1>
                
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar conversaciones..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-400">No tienes conversaciones</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Ve al perfil de alguien y haz clic en el ícono de mensaje
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`
                        w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50
                        ${selectedConversation?.id === conv.id ? 'bg-purple-500/10' : ''}
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                          {conv.other_user?.avatar_url ? (
                            <img
                              src={conv.other_user.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {(conv.other_user?.display_name || conv.other_user?.username || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        {conv.unread_count && conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-xs flex items-center justify-center font-bold">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">
                            {conv.other_user?.display_name || conv.other_user?.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {conv.last_message && formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false, locale: es })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread_count ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {conv.last_message?.content || 'Sin mensajes'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Área de chat */}
            <div className={`
              flex-1 flex flex-col
              ${selectedConversation ? 'flex' : 'hidden md:flex'}
            `}>
              {selectedConversation ? (
                <>
                  {/* Header del chat */}
                  <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <Link 
                      href={`/perfil/${selectedConversation.other_user?.username}`}
                      className="flex items-center gap-3 flex-1 hover:opacity-80"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {selectedConversation.other_user?.avatar_url ? (
                          <img
                            src={selectedConversation.other_user.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold">
                            {(selectedConversation.other_user?.display_name || '?')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {selectedConversation.other_user?.display_name || selectedConversation.other_user?.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{selectedConversation.other_user?.username}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-700 mb-4" />
                        <p className="text-gray-400">No hay mensajes aún</p>
                        <p className="text-gray-500 text-sm">¡Envía el primer mensaje!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.sender_id === userId;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`
                              max-w-[75%] rounded-2xl px-4 py-2
                              ${isOwn 
                                ? 'bg-purple-600 rounded-br-md' 
                                : 'bg-gray-800 rounded-bl-md'
                              }
                            `}>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: false, locale: es })}
                                </span>
                                {isOwn && (
                                  message.is_read 
                                    ? <CheckCheck className="w-3 h-3 text-blue-400" />
                                    : <Check className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de mensaje */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // Estado vacío (desktop)
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Tus mensajes</h2>
                  <p className="text-gray-400 max-w-sm">
                    Selecciona una conversación o ve al perfil de un usuario y haz clic en el ícono de mensaje para empezar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MensajesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <MensajesContent />
    </Suspense>
  );
}