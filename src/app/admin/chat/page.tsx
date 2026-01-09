'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin';
import { PermissionGate } from '@/components/admin/AdminGuard';
import { createClient } from '@supabase/supabase-js';
import {
  MessageCircle,
  Users,
  Loader2,
  MoreVertical,
  Trash2,
  Eye,
  Ban,
  Search,
  Lock,
  Unlock,
  UserX,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Conversation {
  id: string;
  type: string;
  participant_1: string;
  participant_2: string;
  group_name: string;
  group_avatar: string;
  created_by: string;
  last_message_at: string;
  created_at: string;
  members_count?: number;
  user1?: { username: string; avatar_url: string };
  user2?: { username: string; avatar_url: string };
  creator?: { username: string };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  sender?: { username: string; avatar_url: string };
}

interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  blocker?: { username: string };
  blocked?: { username: string };
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [blocks, setBlocks] = useState<UserBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar conversaciones directas
      const { data: directData } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          user1:users!chat_conversations_participant_1_fkey(username, avatar_url),
          user2:users!chat_conversations_participant_2_fkey(username, avatar_url)
        `)
        .eq('type', 'direct')
        .order('last_message_at', { ascending: false })
        .limit(100);

      setConversations(directData || []);

      // Cargar grupos
      const { data: groupData } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          creator:users!chat_conversations_created_by_fkey(username)
        `)
        .eq('type', 'group')
        .order('last_message_at', { ascending: false })
        .limit(100);

      setGroups(groupData || []);

      // Cargar bloqueos
      const { data: blockData } = await supabase
        .from('user_blocks')
        .select(`
          *,
          blocker:users!user_blocks_blocker_id_fkey(username),
          blocked:users!user_blocks_blocked_id_fkey(username)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      setBlocks(blockData || []);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(username, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50);

    setMessages(data || []);
  };

  const handleViewMessages = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
    setShowMessagesModal(true);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;

    setActionLoading(messageId);
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), content: '[Mensaje eliminado por admin]' })
      .eq('id', messageId);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      if (selectedConversation) {
        await loadMessages(selectedConversation.id);
      }
    }
    setActionLoading(null);
  };

  const handleDeleteConversation = async (conversation: Conversation) => {
    if (!confirm('¿Eliminar esta conversación y todos sus mensajes?')) return;

    setActionLoading(conversation.id);

    // Eliminar mensajes primero
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversation.id);

    // Eliminar conversación
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversation.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadData();
    }
    setActionLoading(null);
  };

  const handleRemoveBlock = async (blockId: string) => {
    if (!confirm('¿Eliminar este bloqueo?')) return;

    setActionLoading(blockId);
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('id', blockId);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadData();
    }
    setActionLoading(null);
  };

  // Stats
  const totalConversations = conversations.length;
  const totalGroups = groups.length;
  const totalBlocks = blocks.length;

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Gestión de Chat"
        subtitle="Modera conversaciones, grupos y bloqueos"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConversations}</p>
                <p className="text-xs text-muted-foreground">Chats Directos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGroups}</p>
                <p className="text-xs text-muted-foreground">Grupos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBlocks}</p>
                <p className="text-xs text-muted-foreground">Bloqueos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <Tabs defaultValue="direct" className="bg-card border border-border rounded-xl p-6">
            <TabsList className="bg-muted mb-6">
              <TabsTrigger value="direct" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chats Directos ({conversations.length})
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Grupos ({groups.length})
              </TabsTrigger>
              <TabsTrigger value="blocks" className="flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Bloqueos ({blocks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="direct">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay conversaciones</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-background">
                            {conv.user1?.username?.substring(0, 2).toUpperCase() || 'U1'}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold border-2 border-background">
                            {conv.user2?.username?.substring(0, 2).toUpperCase() || 'U2'}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            @{conv.user1?.username || 'Usuario'} ↔ @{conv.user2?.username || 'Usuario'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Último mensaje: {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === conv.id}>
                            {actionLoading === conv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewMessages(conv)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Mensajes
                          </DropdownMenuItem>
                          <PermissionGate permission="admin.shop.delete">
                            <DropdownMenuItem onClick={() => handleDeleteConversation(conv)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="groups">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay grupos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {group.group_name?.substring(0, 2).toUpperCase() || 'GP'}
                        </div>
                        <div>
                          <p className="font-medium">{group.group_name || 'Grupo sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">
                            Creado por @{group.creator?.username || 'Unknown'} • {formatDistanceToNow(new Date(group.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === group.id}>
                            {actionLoading === group.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewMessages(group)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Mensajes
                          </DropdownMenuItem>
                          <PermissionGate permission="admin.shop.delete">
                            <DropdownMenuItem onClick={() => handleDeleteConversation(group)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Grupo
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="blocks">
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay bloqueos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <div key={block.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <UserX className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            <span className="text-foreground">@{block.blocker?.username}</span>
                            <span className="text-muted-foreground mx-2">bloqueó a</span>
                            <span className="text-foreground">@{block.blocked?.username}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(block.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                      <PermissionGate permission="admin.shop.delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBlock(block.id)}
                          disabled={actionLoading === block.id}
                        >
                          {actionLoading === block.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Unlock className="w-4 h-4 text-green-400" />
                          )}
                        </Button>
                      </PermissionGate>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Messages Modal */}
      {showMessagesModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedConversation.type === 'group'
                    ? selectedConversation.group_name
                    : `${selectedConversation.user1?.username} ↔ ${selectedConversation.user2?.username}`
                  }
                </h2>
                <p className="text-sm text-muted-foreground">{messages.length} mensajes</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowMessagesModal(false)}>
                ✕
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay mensajes</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.is_deleted ? 'opacity-50' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {msg.sender?.username?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">@{msg.sender?.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${msg.is_deleted ? 'italic text-muted-foreground' : ''}`}>
                        {msg.content}
                      </p>
                    </div>
                    {!msg.is_deleted && (
                      <PermissionGate permission="admin.shop.delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(msg.id)}
                          disabled={actionLoading === msg.id}
                        >
                          {actionLoading === msg.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-400" />
                          )}
                        </Button>
                      </PermissionGate>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
