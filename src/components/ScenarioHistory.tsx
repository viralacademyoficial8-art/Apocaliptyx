"use client";

import { useState, useEffect } from "react";
import { ScenarioTransfer } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Plus, Repeat, Shield } from "lucide-react";
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
  currentPrice,
  createdAt,
}: ScenarioHistoryProps) {
  const router = useRouter();
  const [transfers, setTransfers] = useState<ScenarioTransfer[]>([]);

  useEffect(() => {
    const baseUsername = creatorUsername ?? "creador_desconocido";
    const baseAvatar =
      creatorAvatar ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseUsername}`;
    const createdAtDate = createdAt
      ? new Date(createdAt as any)
      : new Date();

    const mockTransfers: ScenarioTransfer[] = [
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
    ];

    const basePrice = 20;
    const price = currentPrice ?? basePrice;

    if (price > basePrice) {
      const stealCount = Math.floor((price - basePrice) / 5);
      const usernames = [
        "prophet_maria",
        "oracle_carlos",
        "tech_prophet",
        "future_seer",
      ];

      for (let i = 0; i < Math.min(stealCount, 4); i++) {
        const fromUsername = i === 0 ? baseUsername : usernames[i - 1];
        mockTransfers.push({
          id: `transfer_${i + 2}`,
          scenarioId,
          fromUserId: `user_${i}`,
          fromUsername,
          fromAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fromUsername}`,
          toUserId: `user_${i + 1}`,
          toUsername: usernames[i],
          toAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[i]}`,
          price: basePrice + (i + 1) * 5,
          timestamp: new Date(
            Date.now() - (stealCount - i) * 24 * 60 * 60 * 1000
          ),
          type: "steal",
        });
      }
    }

    setTransfers(mockTransfers);
  }, [scenarioId, creatorUsername, creatorAvatar, currentPrice, createdAt]);

  const getTransferIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <Plus className="w-4 h-4 text-green-400" />;
      case "steal":
        return <Repeat className="w-4 h-4 text-red-400" />;
      case "recovery":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-400" />;
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
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Repeat className="w-5 h-5 text-purple-400" />
        Historial de Transferencias
      </h3>

      {transfers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Repeat className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay transferencias aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="relative pl-8 pb-4 border-l-2 border-gray-700 last:border-l-0 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-[-9px] top-0 w-4 h-4 bg-gray-900 border-2 border-gray-700 rounded-full flex items-center justify-center">
                {getTransferIcon(transfer.type)}
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={getTransferColor(transfer.type)}
                  >
                    {getTransferLabel(transfer.type)}
                  </Badge>
                  <span className="text-xs text-gray-500">
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
                          <AvatarFallback className="text-xs bg-gray-600">
                            {transfer.fromUsername
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          @{transfer.fromUsername}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
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
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total de transferencias:</span>
          <span className="font-semibold">{transfers.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Precio inicial → actual:</span>
          <span className="font-semibold text-yellow-400">
            20 AP → {currentPrice ?? 20} AP
          </span>
        </div>
      </div>
    </div>
  );
}
