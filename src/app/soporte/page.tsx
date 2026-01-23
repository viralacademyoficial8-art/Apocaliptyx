// src/app/soporte/page.tsx
"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  MessageCircle, Send, ArrowLeft, Plus, Clock, CheckCircle, 
  AlertCircle, Loader2, User, Bot, X
} from "lucide-react";
import Link from "next/link";
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
  open: { label: "Abierto", color: "text-blue-400 bg-blue-500/20", icon: Clock },
  in_progress: { label: "En progreso", color: "text-yellow-400 bg-yellow-500/20", icon: AlertCircle },
  resolved: { label: "Resuelto", color: "text-green-400 bg-green-500/20", icon: CheckCircle },
  closed: { label: "Cerrado", color: "text-muted-foreground bg-gray-500/20", icon: X },
};

export default function SoportePage() {
  const { data: session } = useSession();
  const supabase = getSupabaseBrowser();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);
  
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
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [session, fetchTickets]);

  // Cargar mensajes del ticket seleccionado
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

  // Suscripción en tiempo real
  useEffect(() => {
    if (!selectedTicket) return;

    const channel = supabase
      .channel(`support-${selectedTicket.id}`)
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
      getSupabaseBrowser().removeChannel(channel);
    };
  }, [selectedTicket]);

  // Crear nuevo ticket
  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setCreatingTicket(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newTicketSubject,
          message: newTicketMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowNewTicket(false);
        setNewTicketSubject("");
        setNewTicketMessage("");
        await fetchTickets();
        setSelectedTicket(data.ticket);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreatingTicket(false);
    }
  };

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
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Centro de Soporte</h1>
          <p className="text-muted-foreground mb-8">
            Inicia sesión para acceder al chat de soporte en tiempo real.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            Iniciar Sesión
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Centro de Soporte</h1>
            <p className="text-muted-foreground">Chat en tiempo real con nuestro equipo</p>
          </div>
          {!showNewTicket && !selectedTicket && (
            <button
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Ticket
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de tickets */}
          <div className="lg:col-span-1 bg-card/50 border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Mis Tickets</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes tickets aún</p>
                  <button
                    onClick={() => setShowNewTicket(true)}
                    className="mt-4 text-purple-400 hover:text-purple-300"
                  >
                    Crear uno nuevo
                  </button>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowNewTicket(false);
                      }}
                      className={`w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-white line-clamp-1">{ticket.subject}</p>
                        {ticket.unread_count > 0 && (
                          <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                            {ticket.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                          {status.label}
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

          {/* Chat / Nuevo ticket */}
          <div className="lg:col-span-2 bg-card/50 border border-border rounded-xl overflow-hidden flex flex-col">
            {showNewTicket ? (
              // Formulario nuevo ticket
              <div className="flex-1 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold">Nuevo Ticket</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="¿En qué podemos ayudarte?"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder="Describe tu problema o consulta..."
                      rows={6}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleCreateTicket}
                    disabled={!newTicketSubject.trim() || !newTicketMessage.trim() || creatingTicket}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-muted disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {creatingTicket ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : selectedTicket ? (
              // Chat del ticket
              <>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="font-semibold line-clamp-1">{selectedTicket.subject}</h2>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[selectedTicket.status].color}`}>
                        {statusConfig[selectedTicket.status].label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isUser = message.sender_type === "user" || message.sender_type === "guest";
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
                        className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isUser ? "bg-purple-500" : "bg-blue-500"
                        }`}>
                          {isUser ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isUser
                              ? "bg-purple-600 text-white rounded-br-sm"
                              : "bg-muted text-gray-100 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${isUser ? "text-purple-200" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(message.created_at), { 
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
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-muted disabled:cursor-not-allowed rounded-lg transition-colors"
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
              // Placeholder
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un ticket o crea uno nuevo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}