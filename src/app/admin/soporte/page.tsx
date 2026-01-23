// src/app/admin/soporte/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageCircle, Send, Clock, CheckCircle, AlertCircle, 
  Loader2, User, Bot, X, Filter, ChevronDown
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";


interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  user?: {
    id: string;
    username: string;
    name: string;
    image: string;
  };
  assigned?: {
    id: string;
    username: string;
    name: string;
  };
  guest_email?: string;
  guest_name?: string;
}

interface Message {
  id: string;
  content: string;
  sender_type: "user" | "guest" | "agent" | "system";
  sender?: {
    id: string;
    username: string;
    name: string;
    image: string;
  };
  created_at: string;
  is_read: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: "Abierto", color: "text-blue-400 bg-blue-500/20 border-blue-500/30", icon: Clock },
  in_progress: { label: "En progreso", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30", icon: AlertCircle },
  resolved: { label: "Resuelto", color: "text-green-400 bg-green-500/20 border-green-500/30", icon: CheckCircle },
  closed: { label: "Cerrado", color: "text-muted-foreground bg-gray-500/20 border-gray-500/30", icon: X },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baja", color: "text-muted-foreground" },
  normal: { label: "Normal", color: "text-blue-400" },
  high: { label: "Alta", color: "text-orange-400" },
  urgent: { label: "Urgente", color: "text-red-400" },
};

export default function AdminSoportePage() {
  const supabase = getSupabaseBrowser();
  const { status } = useSession();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar tickets
  const fetchTickets = useCallback(async () => {
    try {
      const url = statusFilter === "all" 
        ? "/api/support/tickets" 
        : `/api/support/tickets?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Cargar mensajes
  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket, fetchMessages]);

  // Realtime para nuevos mensajes
  useEffect(() => {
    if (!selectedTicket) return;

    const channel = supabase
      .channel(`admin-support-${selectedTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${selectedTicket.id}`,
        },
        (payload: { new: Message }) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket, supabase]);

  // Realtime para nuevos tickets
  useEffect(() => {
    const channel = supabase
      .channel("admin-new-tickets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_tickets",
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets, supabase]);

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchTickets();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Cambiar status
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
        fetchTickets();
        fetchMessages(selectedTicket.id);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    setShowStatusMenu(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Centro de Soporte</h1>
          <p className="text-muted-foreground">Gestiona los tickets de soporte</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-muted border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos</option>
            <option value="open">Abiertos</option>
            <option value="in_progress">En progreso</option>
            <option value="resolved">Resueltos</option>
            <option value="closed">Cerrados</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Lista de tickets */}
        <div className="lg:col-span-1 bg-card/50 border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Tickets ({tickets.length})</h2>
            <span className="text-sm text-muted-foreground">
              {tickets.filter(t => t.unread_count > 0).length} sin leer
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay tickets</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const ticketStatus = statusConfig[ticket.status];
                const ticketPriority = priorityConfig[ticket.priority];
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white line-clamp-1">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.user?.username || ticket.guest_name || "Invitado"}
                        </p>
                      </div>
                      {ticket.unread_count > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {ticket.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs border ${ticketStatus.color}`}>
                        {ticketStatus.label}
                      </span>
                      <span className={`text-xs ${ticketPriority.color}`}>
                        {ticketPriority.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.updated_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-card/50 border border-border rounded-xl overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{selectedTicket.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.user?.username || selectedTicket.guest_email || "Invitado"}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className={`px-3 py-1.5 rounded-lg text-sm border flex items-center gap-2 ${statusConfig[selectedTicket.status].color}`}
                    >
                      {statusConfig[selectedTicket.status].label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showStatusMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-muted border border-border rounded-lg shadow-xl z-10 overflow-hidden">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(key)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                              selectedTicket.status === key ? "bg-muted" : ""
                            }`}
                          >
                            <span className={config.color.split(" ")[0]}>{config.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isAgent = message.sender_type === "agent";
                  const isSystem = message.sender_type === "system";

                  if (isSystem) {
                    return (
                      <div key={message.id} className="text-center">
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                          {message.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isAgent ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isAgent ? "bg-blue-500" : "bg-purple-500"
                      }`}>
                        {isAgent ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isAgent
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-muted text-gray-100 rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${isAgent ? "text-blue-200" : "text-muted-foreground"}`}>
                          {message.sender?.username || "Usuario"} · {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Escribe tu respuesta..."
                      className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecciona un ticket para responder</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}