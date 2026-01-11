'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import {
  chatService,
  Conversation,
  Message,
  ChatFilter,
  TypingUser,
  MessageReaction,
  GroupInvitation,
  UserInfo,
  StoryPreview
} from '@/services/chat.service';
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
  Star,
  StarOff,
  Archive,
  BellOff,
  Bell,
  Users,
  Plus,
  MoreVertical,
  Reply,
  UserPlus,
  Settings,
  LogOut,
  Crown,
  Hash,
  Link2,
  Copy,
  CheckCircle,
  UserCheck,
  UserX,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Emojis para reacciones rápidas
const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

// Emojis populares para el picker
const EMOJI_LIST = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤪', '😎',
  '🥳', '🤩', '😇', '🤔', '🤗', '😏', '😈', '👻', '💀', '🎃',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕',
  '👍', '👎', '👊', '✊', '🤞', '✌️', '🤟', '👋', '🙏', '💪',
  '🔥', '⭐', '✨', '💫', '🌟', '💯', '💢', '💥', '💦', '💨',
  '🎉', '🎊', '🎁', '🏆', '🥇', '🎮', '🎯', '🎲', '🃏', '🎰',
];

// Filtros disponibles
const FILTERS: { key: ChatFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Todos', icon: <MessageCircle className="w-4 h-4" /> },
  { key: 'unread', label: 'No leídos', icon: <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span></span> },
  { key: 'favorites', label: 'Favoritos', icon: <Star className="w-4 h-4 text-yellow-400" /> },
  { key: 'groups', label: 'Grupos', icon: <Users className="w-4 h-4" /> },
  { key: 'archived', label: 'Archivados', icon: <Archive className="w-4 h-4" /> },
];

function MensajesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const username = session?.user?.name || '';

  // Estados principales
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtro activo
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');

  // Archivos
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Eliminar mensaje
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  // Typing indicator
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Responder mensaje
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Reacciones
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);

  // Menú de opciones
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Modal crear grupo
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Búsqueda en chat
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Sistema de invitaciones
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<UserInfo[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<GroupInvitation[]>([]);
  const [showInvitations, setShowInvitations] = useState(false);

  // Enlace de invitación
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loadingInviteLink, setLoadingInviteLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  // ============================================
  // FUNCIONES PRINCIPALES
  // ============================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await chatService.getConversations(userId, activeFilter);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, activeFilter]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);

      if (userId) {
        await chatService.markAsRead(conversationId, userId);
        loadConversations();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [userId, loadConversations]);

  // ============================================
  // EFFECTS
  // ============================================

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
  }, [searchParams, conversations, selectedConversation, loadMessages]);

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

  // Suscribirse a typing indicator
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = chatService.subscribeToTyping(
      selectedConversation.id,
      (users) => {
        // Filtrar al usuario actual
        setTypingUsers(users.filter(u => u.user_id !== userId));
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, userId]);

  // Scroll cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setShowChatMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10MB');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (!selectedConversation || !userId) return;
    chatService.startTyping(selectedConversation.id, userId, username);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || !userId || sending) return;

    // Stop typing indicator
    chatService.stopTyping(selectedConversation.id, userId, username);

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      let fileData = undefined;

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
        {
          file: fileData,
          replyToId: replyingTo?.id,
        }
      );

      if (sent) {
        setMessages(prev => {
          if (prev.some(m => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
        loadConversations();
        handleCancelFile();
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setReplyingTo(null);
    setTypingUsers([]);
    loadMessages(conv.id);
    router.push(`/mensajes?conv=${conv.id}`, { scroll: false });
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
    setReplyingTo(null);
    setTypingUsers([]);
    router.push('/mensajes', { scroll: false });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!userId) return;

    setDeletingMessageId(messageId);
    try {
      const result = await chatService.deleteMessage(messageId, userId);

      if (result.success) {
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

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!userId) return;

    const success = await chatService.addReaction(messageId, userId, emoji);
    if (success) {
      // Recargar mensajes para ver reacciones actualizadas
      if (selectedConversation) {
        const updatedMessages = await chatService.getMessages(selectedConversation.id);
        setMessages(updatedMessages);
      }
    }
    setShowReactionsFor(null);
  };

  const handleToggleFavorite = async () => {
    if (!selectedConversation || !userId) return;

    const success = await chatService.toggleFavorite(selectedConversation.id, userId);
    if (success) {
      setSelectedConversation(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
      toast.success(selectedConversation.is_favorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      loadConversations();
    }
    setShowChatMenu(false);
  };

  const handleToggleMute = async () => {
    if (!selectedConversation || !userId) return;

    const success = await chatService.toggleMute(selectedConversation.id, userId);
    if (success) {
      setSelectedConversation(prev => prev ? { ...prev, is_muted: !prev.is_muted } : null);
      toast.success(selectedConversation.is_muted ? 'Notificaciones activadas' : 'Notificaciones silenciadas');
      loadConversations();
    }
    setShowChatMenu(false);
  };

  const handleToggleArchive = async () => {
    if (!selectedConversation || !userId) return;

    const success = await chatService.toggleArchive(selectedConversation.id, userId);
    if (success) {
      toast.success(selectedConversation.is_archived ? 'Chat desarchivado' : 'Chat archivado');
      setSelectedConversation(null);
      loadConversations();
    }
    setShowChatMenu(false);
  };

  const handleCreateGroup = async () => {
    if (!userId || !groupName.trim()) {
      toast.error('El nombre del grupo es obligatorio');
      return;
    }

    setCreatingGroup(true);
    try {
      const group = await chatService.createGroup(
        userId,
        groupName.trim(),
        [], // Por ahora sin miembros adicionales
        groupDescription.trim() || undefined
      );

      if (group) {
        toast.success('Grupo creado');
        setShowCreateGroup(false);
        setGroupName('');
        setGroupDescription('');
        loadConversations();
        handleSelectConversation(group);
      } else {
        toast.error('Error al crear el grupo');
      }
    } catch (error) {
      toast.error('Error al crear el grupo');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSearchInChat = async () => {
    if (!selectedConversation || !searchInChatQuery.trim()) return;

    const results = await chatService.searchMessages(selectedConversation.id, searchInChatQuery);
    setSearchResults(results);
  };

  const handleLeaveGroup = async () => {
    if (!selectedConversation || !userId || selectedConversation.type !== 'group') return;

    if (confirm('¿Seguro que quieres salir del grupo?')) {
      const success = await chatService.leaveGroup(selectedConversation.id, userId);
      if (success) {
        toast.success('Has salido del grupo');
        setSelectedConversation(null);
        loadConversations();
      }
    }
    setShowChatMenu(false);
  };

  // ============================================
  // FUNCIONES DE INVITACIONES
  // ============================================

  const loadFollowingUsers = async () => {
    if (!userId) return;
    setLoadingFollowing(true);
    try {
      const users = await chatService.getFollowing(userId);
      // Filtrar usuarios que ya son miembros del grupo
      const memberIds = selectedConversation?.members?.map(m => m.user_id) || [];
      const filtered = users.filter(u => !memberIds.includes(u.id));
      setFollowingUsers(filtered);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const loadPendingInvitations = async () => {
    if (!userId) return;
    try {
      const invitations = await chatService.getPendingInvitations(userId);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleInviteUser = async (invitedUserId: string) => {
    if (!userId || !selectedConversation) return;

    setInvitingUserId(invitedUserId);
    try {
      const result = await chatService.inviteToGroup(
        selectedConversation.id,
        invitedUserId,
        userId
      );

      if (result.success) {
        toast.success('Invitación enviada');
        // Remover de la lista
        setFollowingUsers(prev => prev.filter(u => u.id !== invitedUserId));
      } else {
        toast.error(result.error || 'Error al enviar invitación');
      }
    } catch (error) {
      toast.error('Error al enviar invitación');
    } finally {
      setInvitingUserId(null);
    }
  };

  const handleRespondInvitation = async (invitationId: string, accept: boolean) => {
    if (!userId) return;

    try {
      const result = await chatService.respondToInvitation(invitationId, userId, accept);

      if (result.success) {
        toast.success(accept ? '¡Te uniste al grupo!' : 'Invitación rechazada');
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));

        if (accept && result.conversationId) {
          loadConversations();
        }
      } else {
        toast.error(result.error || 'Error');
      }
    } catch (error) {
      toast.error('Error al responder');
    }
  };

  const handleGetInviteLink = async () => {
    if (!userId || !selectedConversation) return;

    setLoadingInviteLink(true);
    try {
      const link = await chatService.getInviteLink(selectedConversation.id, userId);
      if (link) {
        setInviteLink(link);
        setShowInviteLink(true);
      } else {
        toast.error('Solo el admin puede obtener el enlace');
      }
    } catch (error) {
      toast.error('Error al obtener enlace');
    } finally {
      setLoadingInviteLink(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    toast.success('Enlace copiado');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerateLink = async () => {
    if (!userId || !selectedConversation) return;

    setLoadingInviteLink(true);
    try {
      const newLink = await chatService.regenerateInviteLink(selectedConversation.id, userId);
      if (newLink) {
        setInviteLink(newLink);
        toast.success('Nuevo enlace generado');
      }
    } catch (error) {
      toast.error('Error al regenerar enlace');
    } finally {
      setLoadingInviteLink(false);
    }
  };

  // Cargar invitaciones pendientes
  useEffect(() => {
    if (userId) {
      loadPendingInvitations();
    }
  }, [userId]);

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Film className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;

    if (conv.type === 'direct') {
      const name = conv.other_user?.display_name || conv.other_user?.username || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return (conv.group_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.group_name || 'Grupo';
    }
    return conv.other_user?.display_name || conv.other_user?.username || 'Usuario';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.group_avatar;
    }
    return conv.other_user?.avatar_url;
  };

  // Agrupar reacciones por emoji
  const groupReactions = (reactions?: MessageReaction[]) => {
    if (!reactions?.length) return [];

    const groups = new Map<string, { emoji: string; count: number; users: string[]; hasCurrentUser: boolean }>();

    reactions.forEach(r => {
      const existing = groups.get(r.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(r.user?.display_name || 'Usuario');
        if (r.user_id === userId) existing.hasCurrentUser = true;
      } else {
        groups.set(r.emoji, {
          emoji: r.emoji,
          count: 1,
          users: [r.user?.display_name || 'Usuario'],
          hasCurrentUser: r.user_id === userId,
        });
      }
    });

    return Array.from(groups.values());
  };

  const renderMessageContent = (message: Message, isOwn: boolean) => {
    const deleteCheck = isOwn && !message.is_deleted ? chatService.canDeleteMessage(message, userId || '') : { canDelete: false };
    const canDelete = deleteCheck.canDelete;
    const timeLeft = 'timeLeft' in deleteCheck ? deleteCheck.timeLeft : 0;
    const reactionGroups = groupReactions(message.reactions);

    return (
      <div className="group relative">
        {/* Acciones del mensaje */}
        {!message.is_deleted && (
          <div className={`
            absolute top-0 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}
            flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
          `}>
            {/* Responder */}
            <button
              onClick={() => setReplyingTo(message)}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Responder"
            >
              <Reply className="w-4 h-4" />
            </button>

            {/* Reaccionar */}
            <div className="relative">
              <button
                onClick={() => setShowReactionsFor(showReactionsFor === message.id ? null : message.id)}
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                title="Reaccionar"
              >
                <Smile className="w-4 h-4" />
              </button>

              {showReactionsFor === message.id && (
                <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-lg p-1 flex gap-1 z-50">
                  {QUICK_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message.id, emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Eliminar */}
            {canDelete && (
              <button
                onClick={() => handleDeleteMessage(message.id)}
                disabled={deletingMessageId === message.id}
                className="p-1.5 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white"
                title={`Eliminar (${Math.floor((timeLeft || 0) / 60)}:${String((timeLeft || 0) % 60).padStart(2, '0')} restantes)`}
              >
                {deletingMessageId === message.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Story Reply Preview - Modern Social Media Style */}
        {(message.story_preview || message.story_id || message.content?.includes('Respondió a una historia:')) && !message.is_deleted && (
          <div className={`mb-2 ${isOwn ? 'flex justify-end' : ''}`}>
            {/* Story Card Container */}
            <div className="group relative">
              {/* Gradient border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

              <div className="relative bg-gray-900 rounded-2xl p-3 max-w-[280px]">
                {/* Header with avatar and username */}
                <div className="flex items-center gap-2 mb-2">
                  {/* Mini avatar with gradient ring */}
                  <div className="relative">
                    <div className="absolute -inset-[2px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full" />
                    <div className="relative w-6 h-6 rounded-full bg-gray-900 p-[2px]">
                      {message.story_preview?.storyOwnerAvatarUrl ? (
                        <img
                          src={message.story_preview.storyOwnerAvatarUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">
                            {message.story_preview?.storyOwnerUsername?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400">
                      {isOwn ? 'Respondiste a la historia de' : 'Respondió a tu historia'}
                    </p>
                    <p className="text-xs text-white font-medium truncate">
                      @{message.story_preview?.storyOwnerUsername || 'usuario'}
                    </p>
                  </div>
                </div>

                {/* Story Content Preview */}
                <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[200px] bg-gray-800">
                  {message.story_preview?.mediaUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={message.story_preview.mediaUrl}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                      {message.story_preview.content && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <p className="absolute bottom-3 left-3 right-3 text-xs text-white font-medium line-clamp-2 drop-shadow-lg">
                            {message.story_preview.content}
                          </p>
                        </>
                      )}
                      {/* Play button for videos */}
                      {message.story_preview.mediaType?.includes('video') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : message.story_preview?.linkPreview?.image ? (
                    <div className="relative w-full h-full">
                      <img
                        src={message.story_preview.linkPreview.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Link2 className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] text-blue-400 truncate">
                            {message.story_preview.linkPreview.siteName || 'Link'}
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-2">
                          {message.story_preview.linkPreview.title}
                        </p>
                      </div>
                    </div>
                  ) : message.story_preview?.content ? (
                    <div
                      className="w-full h-full flex items-center justify-center p-4 min-h-[150px]"
                      style={{
                        background: message.story_preview.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      <p className="text-sm text-white text-center font-medium line-clamp-6 drop-shadow-lg">
                        {message.story_preview.content}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full min-h-[150px] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📷</span>
                        <span className="text-xs text-white/80">Historia</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`
          max-w-[75%] rounded-2xl overflow-hidden transition-all duration-200
          ${message.is_deleted
            ? 'bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm'
            : isOwn
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 rounded-br-md shadow-lg shadow-purple-500/20'
              : 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-bl-md'
          }
        `}>
          {/* Mensaje de respuesta */}
          {message.reply_to && !message.is_deleted && (
            <div className={`px-3 py-2 border-l-2 ${isOwn ? 'border-pink-400 bg-purple-700/60' : 'border-purple-400 bg-gray-700/60'}`}>
              <p className="text-xs opacity-80 font-medium">
                Respondiendo a {message.reply_to.sender?.display_name || 'Usuario'}
              </p>
              <p className="text-xs truncate opacity-70">
                {message.reply_to.content}
              </p>
            </div>
          )}

          {/* Mensaje eliminado */}
          {message.is_deleted ? (
            <p className="text-sm text-gray-500 italic px-4 py-3 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Este mensaje fue eliminado
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
                    <video src={message.file_url} controls className="max-w-full max-h-64" />
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

        {/* Reacciones */}
        {reactionGroups.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {reactionGroups.map(group => (
              <button
                key={group.emoji}
                onClick={() => handleReaction(message.id, group.emoji)}
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                  ${group.hasCurrentUser ? 'bg-purple-500/30 border border-purple-500' : 'bg-gray-800 border border-gray-700'}
                  hover:bg-gray-700 transition-colors
                `}
                title={group.users.join(', ')}
              >
                <span>{group.emoji}</span>
                <span>{group.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // LOADING STATE
  // ============================================

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

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      {userId && <PresenceTracker userId={userId} />}

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* ============================================ */}
      {/* SIDEBAR - Fixed Left Panel */}
      {/* ============================================ */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-full md:w-80 lg:w-96 md:flex-shrink-0
        bg-[#0d0d14] md:bg-[#0d0d14]/90
        backdrop-blur-xl
        border-r border-gray-800/50
        flex flex-col h-screen
        transition-transform duration-300 ease-out
        ${selectedConversation ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800/50">
          {/* Logo and title */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Mensajes
                </h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">Apocaliptyx Chat</p>
              </div>
            </Link>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-transparent hover:border-purple-500/30"
              title="Crear grupo"
            >
              <Plus className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-3 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300"
            />
          </div>

          {/* Filter pills - Grid Layout for better visibility */}
          <div className="grid grid-cols-2 gap-2">
            {FILTERS.filter(f => f.key !== 'archived').map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  ${activeFilter === filter.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white border border-gray-700/50 hover:border-purple-500/30'
                  }
                `}
              >
                <span className="flex items-center justify-center">{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                <MessageCircle className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-gray-300 font-medium">
                {activeFilter === 'all' ? 'No tienes conversaciones' :
                 activeFilter === 'unread' ? 'No hay mensajes sin leer' :
                 activeFilter === 'favorites' ? 'No tienes favoritos' :
                 activeFilter === 'groups' ? 'No tienes grupos' :
                 'No hay chats archivados'}
              </p>
              {activeFilter === 'all' && (
                <p className="text-gray-500 text-sm mt-2">
                  Ve al perfil de alguien para enviar un mensaje
                </p>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`
                  w-full p-3.5 flex items-center gap-3 transition-all duration-200
                  ${selectedConversation?.id === conv.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 border-l-2 border-l-purple-500'
                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`absolute -inset-0.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 opacity-0 transition-opacity duration-300 ${conv.unread_count ? 'opacity-100' : ''}`} />
                  <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0d0d14] flex items-center justify-center overflow-hidden">
                      {getConversationAvatar(conv) ? (
                        <img src={getConversationAvatar(conv)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-bold text-white">
                          {conv.type === 'group' ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            getConversationName(conv)[0].toUpperCase()
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Online indicator */}
                  {conv.type === 'direct' && conv.other_user?.id && (
                    <div className="absolute -bottom-0.5 -right-0.5 border-2 border-[#0d0d14] rounded-full">
                      <OnlineStatus userId={conv.other_user.id} size="sm" />
                    </div>
                  )}

                  {/* Unread badge */}
                  {conv.unread_count && conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg shadow-purple-500/50">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Conversation info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium truncate text-sm">
                        {getConversationName(conv)}
                      </span>
                      {conv.is_favorite && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      {conv.is_muted && <BellOff className="w-3 h-3 text-gray-500 flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {conv.last_message && formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false, locale: es })}
                    </span>
                  </div>
                  {/* Message preview */}
                  {(() => {
                    const isStoryReply = conv.last_message?.story_preview ||
                      conv.last_message?.story_id ||
                      conv.last_message?.content?.includes('Respondió a una historia:');

                    const getActualContent = () => {
                      if (!conv.last_message?.content) return '';
                      const legacyMatch = conv.last_message.content.match(/Respondió a una historia:\s*(.+)/);
                      return legacyMatch ? legacyMatch[1] : conv.last_message.content;
                    };

                    if (isStoryReply) {
                      return (
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 min-w-0">
                            <p className={`text-[10px] ${conv.unread_count ? 'text-gray-300' : 'text-gray-500'}`}>
                              Respondió a tu historia
                            </p>
                            <p className={`text-xs truncate ${conv.unread_count ? 'text-white font-medium' : 'text-gray-400'}`}>
                              {getActualContent()}
                            </p>
                          </div>
                          {conv.last_message?.story_preview ? (
                            <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden border border-gray-700/50 bg-gray-800">
                              {conv.last_message.story_preview.mediaUrl ? (
                                <img src={conv.last_message.story_preview.mediaUrl} alt="" className="w-full h-full object-cover" />
                              ) : conv.last_message.story_preview.linkPreview?.image ? (
                                <img src={conv.last_message.story_preview.linkPreview.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: conv.last_message.story_preview.backgroundColor || '#6b21a8' }}>
                                  <span className="text-white text-[6px]">Aa</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                              <span className="text-white text-sm">📷</span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count ? 'text-white font-medium' : 'text-gray-500'}`}>
                        {conv.last_message?.file_url ? '📎 Archivo adjunto' : conv.last_message?.content || 'Sin mensajes'}
                      </p>
                    );
                  })()}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ============================================ */}
      {/* MAIN CHAT AREA */}
      {/* ============================================ */}
      <main className="flex-1 flex flex-col relative z-10 h-screen">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="flex-shrink-0 p-4 border-b border-gray-800/50 backdrop-blur-xl bg-[#0d0d14]/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleBack} className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-all duration-200">
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Link
                    href={selectedConversation.type === 'direct'
                      ? `/perfil/${selectedConversation.other_user?.username}`
                      : '#'
                    }
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 opacity-60 group-hover:opacity-100 transition-opacity blur-sm" />
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#0d0d14] flex items-center justify-center overflow-hidden">
                          {getConversationAvatar(selectedConversation) ? (
                            <img src={getConversationAvatar(selectedConversation)} alt="" className="w-full h-full object-cover" />
                          ) : selectedConversation.type === 'group' ? (
                            <Users className="w-5 h-5 text-white" />
                          ) : (
                            <span className="font-bold text-white text-sm">
                              {getConversationName(selectedConversation)[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedConversation.type === 'direct' && selectedConversation.other_user?.id && (
                        <div className="absolute -bottom-0.5 -right-0.5 border-2 border-[#0d0d14] rounded-full">
                          <OnlineStatus userId={selectedConversation.other_user.id} size="sm" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm">
                          {getConversationName(selectedConversation)}
                        </p>
                        {selectedConversation.type === 'group' && (
                          <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-800/50">
                            {selectedConversation.members?.length || 0} miembros
                          </span>
                        )}
                      </div>
                      {selectedConversation.type === 'direct' && selectedConversation.other_user?.id && (
                        <OnlineStatus userId={selectedConversation.other_user.id} showText size="sm" />
                      )}
                      {selectedConversation.type === 'group' && selectedConversation.group_description && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {selectedConversation.group_description}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Options menu */}
                <div className="relative" ref={chatMenuRef}>
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Bottom Sheet Menu */}
                  {showChatMenu && (
                    <div className="fixed inset-0 z-[9999]">
                      {/* Backdrop with blur */}
                      <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowChatMenu(false)}
                      />

                      {/* Bottom Sheet Container */}
                      <div className="absolute bottom-0 left-0 right-0 animate-slide-up">
                        {/* Gradient top border */}
                        <div className="h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

                        {/* Sheet content */}
                        <div className="bg-[#0d0d14] rounded-t-3xl pt-3 pb-8 px-2 max-h-[70vh] overflow-y-auto">
                          {/* Handle indicator */}
                          <div className="flex justify-center mb-4">
                            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                          </div>

                          {/* Title */}
                          <div className="text-center mb-4 px-4">
                            <h3 className="text-lg font-semibold text-white">Opciones del chat</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedConversation.type === 'group' ? selectedConversation.group_name : selectedConversation.other_user?.display_name}
                            </p>
                          </div>

                          {/* Options Grid for main actions */}
                          <div className="grid grid-cols-4 gap-3 px-4 mb-4">
                            <button onClick={handleToggleFavorite} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all group">
                              <div className={`p-3 rounded-xl ${selectedConversation.is_favorite ? 'bg-yellow-500/20' : 'bg-gray-700/80 group-hover:bg-purple-500/20'} transition-colors`}>
                                {selectedConversation.is_favorite ? <StarOff className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />}
                              </div>
                              <span className="text-xs text-gray-400 text-center leading-tight">{selectedConversation.is_favorite ? 'Quitar fav' : 'Favorito'}</span>
                            </button>

                            <button onClick={handleToggleMute} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all group">
                              <div className={`p-3 rounded-xl ${selectedConversation.is_muted ? 'bg-green-500/20' : 'bg-gray-700/80 group-hover:bg-purple-500/20'} transition-colors`}>
                                {selectedConversation.is_muted ? <Bell className="w-5 h-5 text-green-400" /> : <BellOff className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />}
                              </div>
                              <span className="text-xs text-gray-400 text-center leading-tight">{selectedConversation.is_muted ? 'Activar' : 'Silenciar'}</span>
                            </button>

                            <button onClick={handleToggleArchive} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all group">
                              <div className="p-3 rounded-xl bg-gray-700/80 group-hover:bg-purple-500/20 transition-colors">
                                <Archive className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                              </div>
                              <span className="text-xs text-gray-400 text-center leading-tight">{selectedConversation.is_archived ? 'Desarchivar' : 'Archivar'}</span>
                            </button>

                            <button onClick={() => { setShowSearchInChat(true); setShowChatMenu(false); }} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all group">
                              <div className="p-3 rounded-xl bg-gray-700/80 group-hover:bg-purple-500/20 transition-colors">
                                <Search className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                              </div>
                              <span className="text-xs text-gray-400 text-center leading-tight">Buscar</span>
                            </button>
                          </div>

                          {/* Group-specific options */}
                          {selectedConversation.type === 'group' && (
                            <>
                              <div className="mx-4 mb-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Opciones de grupo</p>
                                <div className="space-y-1">
                                  <button onClick={() => { loadFollowingUsers(); setShowAddMembers(true); setShowChatMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group">
                                    <div className="p-2 rounded-lg bg-purple-500/20">
                                      <UserPlus className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="text-sm text-gray-300 group-hover:text-white">Agregar miembros</span>
                                  </button>
                                  <button onClick={() => { handleGetInviteLink(); setShowChatMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group">
                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                      <Link2 className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-sm text-gray-300 group-hover:text-white">Enlace de invitación</span>
                                  </button>
                                </div>
                              </div>

                              <div className="mx-4 pt-3 border-t border-gray-800/50">
                                <button onClick={handleLeaveGroup} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all group">
                                  <div className="p-2 rounded-lg bg-red-500/20">
                                    <LogOut className="w-4 h-4 text-red-400" />
                                  </div>
                                  <span className="text-sm text-red-400 group-hover:text-red-300">Salir del grupo</span>
                                </button>
                              </div>
                            </>
                          )}

                          {/* Cancel button */}
                          <div className="mx-4 mt-4">
                            <button
                              onClick={() => setShowChatMenu(false)}
                              className="w-full py-3.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white font-medium transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Search in chat */}
            {showSearchInChat && (
              <div className="p-3 border-b border-gray-800/50 bg-[#0d0d14]/50">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchInChatQuery}
                      onChange={(e) => setSearchInChatQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchInChat()}
                      placeholder="Buscar mensajes..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      autoFocus
                    />
                  </div>
                  <button onClick={() => { setShowSearchInChat(false); setSearchInChatQuery(''); setSearchResults([]); }} className="p-2 hover:bg-white/10 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto">
                    {searchResults.map(msg => (
                      <div key={msg.id} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-sm">
                        <p className="text-gray-400 text-xs">{msg.sender?.display_name}</p>
                        <p className="truncate">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages area */}
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
                  const isSystem = !message.sender_id;

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                          {message.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {renderMessageContent(message, isOwn)}
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{typingUsers.map(u => u.username).join(', ')} está escribiendo...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply preview */}
            {replyingTo && (
              <div className="px-4 py-2 border-t border-gray-800/50 bg-[#0d0d14]/80 flex items-center gap-3">
                <div className="flex-1 border-l-2 border-purple-500 pl-3">
                  <p className="text-xs text-gray-400">Respondiendo a {replyingTo.sender?.display_name || 'Usuario'}</p>
                  <p className="text-sm truncate">{replyingTo.content}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* File preview */}
            {selectedFile && (
              <div className="px-4 py-2 border-t border-gray-800/50 bg-[#0d0d14]/80">
                <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-xl">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-700/50 rounded-lg flex items-center justify-center">
                      {getFileIcon(selectedFile.type.split('/')[0])}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={handleCancelFile} className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-gray-800/50 backdrop-blur-xl bg-[#0d0d14]/80">
              <div className="flex items-center gap-3">
                {/* Emoji button */}
                <div className="relative" ref={emojiPickerRef}>
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 text-gray-400 hover:text-purple-400 hover:bg-white/5 rounded-xl transition-all duration-200">
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-14 left-0 w-80 backdrop-blur-xl bg-gray-900/95 border border-gray-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 p-4 z-50">
                      <div className="grid grid-cols-8 gap-2 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                        {EMOJI_LIST.map((emoji, i) => (
                          <button key={i} type="button" onClick={() => handleEmojiSelect(emoji)} className="w-9 h-9 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attach button */}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-purple-400 hover:bg-white/5 rounded-xl transition-all duration-200">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept="image/*,video/*,.pdf,.doc,.docx,.txt" className="hidden" />

                {/* Text input */}
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    placeholder="Escribe un mensaje..."
                    className="w-full px-5 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300"
                    disabled={sending || uploading}
                  />
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                >
                  {sending || uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Empty State - No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-gray-800 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-gray-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Tus mensajes
            </h2>
            <p className="text-gray-500 max-w-sm text-sm">
              Selecciona una conversación de la lista o ve al perfil de un usuario para empezar a chatear
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              Explorar perfiles
            </Link>
          </div>
        )}
      </main>

      {/* ============================================ */}
      {/* MODAL CREAR GRUPO */}
      {/* ============================================ */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px]" />
          </div>

          {/* Modal container with gradient border */}
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-75" />
            <div className="relative bg-[#0d0d14] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Crear grupo
                    </h2>
                    <p className="text-xs text-gray-500">Crea un espacio para tu comunidad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nombre del grupo <span className="text-pink-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Ej: Profetas del Apocalipsis"
                      className="relative w-full px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300"
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{groupName.length}/50</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Descripción <span className="text-gray-500">(opcional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="¿De qué trata este grupo?"
                      className="relative w-full px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 placeholder-gray-500 transition-all duration-300 resize-none"
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{groupDescription.length}/200</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <span className="text-xl">💡</span>
                  <p className="text-xs text-gray-400">
                    Después de crear el grupo podrás agregar miembros y personalizar la configuración desde el menú de opciones.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-gray-800/50 flex gap-3">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 px-4 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 rounded-xl transition-all duration-300 font-medium text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || creatingGroup}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {creatingGroup ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Crear grupo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL AGREGAR MIEMBROS */}
      {/* ============================================ */}
      {showAddMembers && selectedConversation?.type === 'group' && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Agregar miembros
              </h2>
              <button onClick={() => setShowAddMembers(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 text-sm text-gray-400 border-b border-gray-800">
              Invita a personas que sigues a unirse a &quot;{selectedConversation.group_name}&quot;
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingFollowing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : followingUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios disponibles para invitar</p>
                  <p className="text-xs mt-1">Sigue a más personas para poder invitarlas</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {followingUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                            {user.display_name?.[0] || user.username[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.display_name || user.username}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      <button
                        onClick={() => handleInviteUser(user.id)}
                        disabled={invitingUserId === user.id}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                      >
                        {invitingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Invitar
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => {
                  setShowAddMembers(false);
                  handleGetInviteLink();
                }}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Link2 className="w-4 h-4" />
                Obtener enlace de invitación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL ENLACE DE INVITACIÓN */}
      {/* ============================================ */}
      {showInviteLink && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-400" />
                Enlace de invitación
              </h2>
              <button onClick={() => setShowInviteLink(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-400">
                Comparte este enlace para que otros puedan unirse al grupo
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink || ''}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                />
                <button
                  onClick={handleCopyInviteLink}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  {copiedLink ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRegenerateLink}
                  disabled={loadingInviteLink}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loadingInviteLink ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Regenerar enlace
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Cualquier persona con este enlace podrá unirse al grupo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* BANNER INVITACIONES PENDIENTES */}
      {/* ============================================ */}
      {pendingInvitations.length > 0 && !showInvitations && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowInvitations(true)}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg flex items-center gap-2 animate-pulse"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">{pendingInvitations.length} invitación{pendingInvitations.length > 1 ? 'es' : ''} pendiente{pendingInvitations.length > 1 ? 's' : ''}</span>
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL INVITACIONES PENDIENTES */}
      {/* ============================================ */}
      {showInvitations && pendingInvitations.length > 0 && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Invitaciones a grupos
              </h2>
              <button onClick={() => setShowInvitations(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {pendingInvitations.map(inv => (
                <div
                  key={inv.id}
                  className="p-4 rounded-lg bg-gray-800/50 mb-2"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {inv.group?.group_avatar ? (
                        <img src={inv.group.group_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{inv.group?.group_name}</p>
                      <p className="text-sm text-gray-400">
                        <span className="text-purple-400">@{inv.inviter?.username}</span> te invitó
                      </p>
                      {inv.group?.members_count && (
                        <p className="text-xs text-gray-500 mt-1">
                          {inv.group.members_count} miembro{inv.group.members_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondInvitation(inv.id, false)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <UserX className="w-4 h-4" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleRespondInvitation(inv.id, true)}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Unirse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
