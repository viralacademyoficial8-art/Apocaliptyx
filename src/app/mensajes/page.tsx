'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { chatService, Conversation, Message } from '@/services/chat.service';
import { OnlineStatus, PresenceTracker } from '@/components/OnlineStatus';
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
  Paperclip,
  Image as ImageIcon,
  FileText,
  Film,
  X,
  Smile,
  Download,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Emojis populares
const EMOJI_LIST = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤪', '😎',
  '🥳', '🤩', '😇', '🤔', '🤗', '😏', '😈', '👻', '💀', '🎃',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕',
  '👍', '👎', '👊', '✊', '🤞', '✌️', '🤟', '👋', '🙏', '💪',
  '🔥', '⭐', '✨', '💫', '🌟', '💯', '💢', '💥', '💦', '💨',
  '🎉', '🎊', '🎁', '🏆', '🥇', '🎮', '🎯', '🎲', '🃏', '🎰',
  '📱', '💻', '🖥️', '📷', '🎬', '🎵', '🎧', '🎤', '📺', '📻',
  '🚀', '✈️', '🚗', '🏠', '🌍', '🌙', '☀️', '⛈️', '🌈', '🌸',
];

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
  
  // Estado para archivos
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Estado para emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Estado para eliminar mensaje
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Eliminar mensaje
  const handleDeleteMessage = async (messageId: string) => {
    if (!userId) return;
    
    setDeletingMessageId(messageId);
    try {
      const result = await chatService.deleteMessage(messageId, userId);
      
      if (result.success) {
        // Actualizar el mensaje en la lista
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { ...m, is_deleted: true, content: 'Este mensaje fue eliminado', file_url: undefined }
            : m
        ));
        toast.success('Mensaje eliminado');
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar el mensaje');
    } finally {
      setDeletingMessageId(null);
    }
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
      
      if (userId) {
        await chatService.markAsRead(conversationId, userId);
        const updatedConversations = await chatService.getConversations(userId);
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId]);

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
    if (convId && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(convId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations.length]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = chatService.subscribeToMessages(
      selectedConversation.id,
      (newMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
        
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

  // Cerrar emoji picker al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Cancelar archivo seleccionado
  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Insertar emoji
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Enviar mensaje
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || !userId || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      let fileData = undefined;

      // Subir archivo si hay uno seleccionado
      if (selectedFile) {
        setUploading(true);
        fileData = await chatService.uploadFile(selectedFile, userId);
        setUploading(false);

        if (!fileData) {
          toast.error('Error al subir el archivo');
          setSending(false);
          return;
        }
      }

      const sent = await chatService.sendMessage(
        selectedConversation.id,
        userId,
        messageContent || (fileData ? `📎 ${fileData.name}` : ''),
        fileData
      );

      if (sent) {
        setMessages(prev => {
          if (prev.some(m => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
        loadConversations();
        handleCancelFile();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
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

  // Obtener ícono según tipo de archivo
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Film className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Filtrar conversaciones
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.other_user?.display_name || conv.other_user?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Renderizar contenido del mensaje
  const renderMessageContent = (message: Message, isOwn: boolean) => {
    const deleteCheck = isOwn && !message.is_deleted ? chatService.canDeleteMessage(message, userId || '') : { canDelete: false };
    const canDelete = deleteCheck.canDelete;
    const timeLeft = 'timeLeft' in deleteCheck ? deleteCheck.timeLeft : 0;
    
    return (
      <div className="group relative">
        {/* Botón de eliminar (solo mensajes propios dentro del tiempo límite) */}
        {canDelete && (
          <button
            onClick={() => handleDeleteMessage(message.id)}
            disabled={deletingMessageId === message.id}
            className={`
              absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full
              bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white
              opacity-0 group-hover:opacity-100 transition-all
              ${deletingMessageId === message.id ? 'opacity-100' : ''}
            `}
            title={`Eliminar (${Math.floor((timeLeft || 0) / 60)}:${String((timeLeft || 0) % 60).padStart(2, '0')} restantes)`}
          >
            {deletingMessageId === message.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
        
        <div className={`
          max-w-[75%] rounded-2xl overflow-hidden
          ${message.is_deleted 
            ? 'bg-gray-800/50 border border-gray-700' 
            : isOwn ? 'bg-purple-600 rounded-br-md' : 'bg-gray-800 rounded-bl-md'
          }
        `}>
          {/* Mensaje eliminado */}
          {message.is_deleted ? (
            <p className="text-sm text-gray-500 italic px-4 py-2">
              🗑️ Este mensaje fue eliminado
            </p>
          ) : (
            <>
              {/* Archivo adjunto */}
              {message.file_url && (
                <div className="relative">
                  {message.file_type === 'image' ? (
                    <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={message.file_url} 
                        alt={message.file_name || 'Imagen'} 
                        className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90"
                      />
                    </a>
                  ) : message.file_type === 'video' ? (
                    <video 
                      src={message.file_url} 
                      controls 
                      className="max-w-full max-h-64"
                    />
                  ) : (
                    <a 
                      href={message.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 ${isOwn ? 'bg-purple-700' : 'bg-gray-700'} hover:opacity-80`}
                    >
                      {getFileIcon(message.file_type || 'document')}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{message.file_name || 'Archivo'}</p>
                        <p className="text-xs opacity-70">Clic para descargar</p>
                      </div>
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Texto del mensaje */}
              {message.content && !message.content.startsWith('📎') && (
                <p className="text-sm whitespace-pre-wrap break-words px-4 py-2">
                  {message.content}
                </p>
              )}
            </>
          )}

          {/* Hora y estado */}
          <div className={`flex items-center gap-1 px-4 pb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: false, locale: es })}
            </span>
            {isOwn && !message.is_deleted && (
              message.is_read 
                ? <CheckCheck className="w-3 h-3 text-blue-400" />
                : <Check className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    );
  };

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
      
      {/* Tracker de presencia del usuario actual */}
      {userId && <PresenceTracker userId={userId} />}

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
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                          {conv.other_user?.avatar_url ? (
                            <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold">
                              {(conv.other_user?.display_name || conv.other_user?.username || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Indicador de estado online */}
                        {conv.other_user?.id && (
                          <div className="absolute -bottom-0.5 -right-0.5 border-2 border-gray-900 rounded-full">
                            <OnlineStatus userId={conv.other_user.id} size="sm" />
                          </div>
                        )}
                        {conv.unread_count && conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-xs flex items-center justify-center font-bold">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        )}
                      </div>

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
                          {conv.last_message?.file_url ? '📎 Archivo adjunto' : conv.last_message?.content || 'Sin mensajes'}
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
                    <button onClick={handleBack} className="md:hidden p-2 hover:bg-gray-800 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <Link 
                      href={`/perfil/${selectedConversation.other_user?.username}`}
                      className="flex items-center gap-3 flex-1 hover:opacity-80"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                          {selectedConversation.other_user?.avatar_url ? (
                            <img src={selectedConversation.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold">
                              {(selectedConversation.other_user?.display_name || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Indicador de estado online */}
                        {selectedConversation.other_user?.id && (
                          <div className="absolute -bottom-0.5 -right-0.5 border-2 border-gray-900 rounded-full">
                            <OnlineStatus userId={selectedConversation.other_user.id} size="sm" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {selectedConversation.other_user?.display_name || selectedConversation.other_user?.username}
                        </p>
                        {/* Estado online con texto */}
                        {selectedConversation.other_user?.id && (
                          <OnlineStatus userId={selectedConversation.other_user.id} showText size="sm" />
                        )}
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
                          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {renderMessageContent(message, isOwn)}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Preview de archivo seleccionado */}
                  {selectedFile && (
                    <div className="px-4 py-2 border-t border-gray-800 bg-gray-900">
                      <div className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                            {getFileIcon(selectedFile.type.split('/')[0])}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={handleCancelFile}
                          className="p-2 hover:bg-gray-700 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input de mensaje */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      {/* Botón de emoji */}
                      <div className="relative" ref={emojiPickerRef}>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                        >
                          <Smile className="w-6 h-6" />
                        </button>
                        
                        {/* Emoji picker */}
                        {showEmojiPicker && (
                          <div className="absolute bottom-12 left-0 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 z-50">
                            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                              {EMOJI_LIST.map((emoji, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleEmojiSelect(emoji)}
                                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-700 rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botón de adjuntar */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <Paperclip className="w-6 h-6" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                      />

                      {/* Input de texto */}
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={sending || uploading}
                      />

                      {/* Botón enviar */}
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
                        className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending || uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
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