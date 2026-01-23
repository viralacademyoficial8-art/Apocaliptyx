"use client";

import { useState, useEffect, useCallback } from "react";
import { ScenarioTransfer } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Plus, Repeat, Shield, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface ScenarioHistoryProps {
  scenarioId: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  currentPrice?: number;
  createdAt?: Date | string;
}

export function ScenarioHistory({
  scenarioId,
  creatorUsername,
  creatorAvatar,
  currentPrice: initialPrice,
  createdAt,
}: ScenarioHistoryProps) {
  const router = useRouter();
  const [transfers, setTransfers] = useState<ScenarioTransfer[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice ?? 20);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar historial desde la API
  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/history`);
      const data = await response.json();

      if (data.transfers && data.transfers.length > 0) {
        setTransfers(
          data.transfers.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          }))
        );
        if (data.currentPrice) {
          setCurrentPrice(data.currentPrice);
        }
      } else {
        // Si no hay datos de la API, mostrar al menos la creación
        const baseUsername = creatorUsername ?? "creador_desconocido";
        const baseAvatar =
          creatorAvatar ??
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseUsername}`;
        const createdAtDate = createdAt ? new Date(createdAt as any) : new Date();

        setTransfers([
          {
            id: "transfer_1",
            scenarioId,
            fromUserId: "system",
            fromUsername: "Sistema",
            fromAvatar: "",
            toUserId: "user_creator",
            toUsername: baseUsername,
            toAvatar: baseAvatar,
            price: 20,
            timestamp: createdAtDate,
            type: "creation",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      // Fallback a datos básicos en caso de error
      const baseUsername = creatorUsername ?? "creador_desconocido";
      const baseAvatar =
        creatorAvatar ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseUsername}`;
      const createdAtDate = createdAt ? new Date(createdAt as any) : new Date();

      setTransfers([
        {
          id: "transfer_1",
          scenarioId,
          fromUserId: "system",
          fromUsername: "Sistema",
          fromAvatar: "",
          toUserId: "user_creator",
          toUsername: baseUsername,
          toAvatar: baseAvatar,
          price: 20,
          timestamp: createdAtDate,
          type: "creation",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [scenarioId, creatorUsername, creatorAvatar, createdAt]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getTransferIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <Plus className="w-4 h-4 text-green-400" />;
      case "steal":
        return <Repeat className="w-4 h-4 text-red-400" />;
      case "recovery":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <ArrowRight className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransferLabel = (type: string) => {
    switch (type) {
      case "creation":
        return "Creado";
      case "steal":
        return "Robado";
      case "recovery":
        return "Recuperado";
      default:
        return "Transferido";
    }
  };

  const getTransferColor = (type: string) => {
    switch (type) {
      case "creation":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "steal":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "recovery":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-muted-foreground border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Repeat className="w-5 h-5 text-purple-400" />
          Historial de Transferencias
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Repeat className="w-5 h-5 text-purple-400" />
        Historial de Transferencias
      </h3>

      {transfers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Repeat className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay transferencias aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="relative pl-8 pb-4 border-l-2 border-border last:border-l-0 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-[-9px] top-0 w-4 h-4 bg-background border-2 border-border rounded-full flex items-center justify-center">
                {getTransferIcon(transfer.type)}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={getTransferColor(transfer.type)}
                  >
                    {getTransferLabel(transfer.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(transfer.timestamp),
                      "dd MMM yyyy HH:mm",
                      { locale: es }
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {transfer.type !== "creation" && (
                    <>
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                        onClick={() =>
                          router.push(`/perfil/${transfer.fromUsername}`)
                        }
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={transfer.fromAvatar} />
                          <AvatarFallback className="text-xs bg-muted">
                            {transfer.fromUsername
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          @{transfer.fromUsername}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </>
                  )}

                  <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() =>
                      router.push(`/perfil/${transfer.toUsername}`)
                    }
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={transfer.toAvatar} />
                      <AvatarFallback className="text-xs bg-purple-600">
                        {transfer.toUsername
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">
                      @{transfer.toUsername}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-1 text-yellow-400 font-semibold">
                    <Flame className="w-4 h-4" />
                    {transfer.price} AP
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total de transferencias:</span>
          <span className="font-semibold">{transfers.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Precio inicial → actual:</span>
          <span className="font-semibold text-yellow-400">
            20 AP → {currentPrice} AP
          </span>
        </div>
      </div>
    </div>
  );
}
