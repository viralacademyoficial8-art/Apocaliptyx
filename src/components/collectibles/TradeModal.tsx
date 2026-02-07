'use client';

import { useState } from 'react';
import { ArrowLeftRight, Plus, Minus, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Collectible {
  id: string;
  name: string;
  nameEs: string;
  assetUrl: string;
  rarity: string;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  myCollectibles: Collectible[];
  targetUser?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    collectibles: Collectible[];
  };
  onSendTrade: (data: {
    receiverId: string;
    senderItems: string[];
    receiverItems: string[];
    senderApCoins: number;
    receiverApCoins: number;
    message: string;
  }) => void;
}

export function TradeModal({
  isOpen,
  onClose,
  myCollectibles,
  targetUser,
  onSendTrade,
}: TradeModalProps) {
  const [selectedMyItems, setSelectedMyItems] = useState<string[]>([]);
  const [selectedTheirItems, setSelectedTheirItems] = useState<string[]>([]);
  const [myApCoins, setMyApCoins] = useState(0);
  const [theirApCoins, setTheirApCoins] = useState(0);
  const [message, setMessage] = useState('');

  const toggleMyItem = (id: string) => {
    setSelectedMyItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTheirItem = (id: string) => {
    setSelectedTheirItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSendTrade = () => {
    if (!targetUser) return;

    onSendTrade({
      receiverId: targetUser.id,
      senderItems: selectedMyItems,
      receiverItems: selectedTheirItems,
      senderApCoins: myApCoins,
      receiverApCoins: theirApCoins,
      message,
    });

    // Reset
    setSelectedMyItems([]);
    setSelectedTheirItems([]);
    setMyApCoins(0);
    setTheirApCoins(0);
    setMessage('');
    onClose();
  };

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-purple-400" />
            Intercambio con {targetUser.displayName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* My Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Tú ofreces</span>
            </div>

            {/* My Items */}
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
              {myCollectibles.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleMyItem(item.id)}
                  className={`relative p-2 rounded-lg border-2 transition-colors ${
                    selectedMyItems.includes(item.id)
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-border hover:border-border'
                  }`}
                >
                  <img
                    src={item.assetUrl}
                    alt={item.nameEs}
                    className="w-full h-12 object-contain"
                  />
                  <p className="text-xs truncate mt-1">{item.nameEs}</p>
                  {selectedMyItems.includes(item.id) && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* My AP Coins */}
            <div className="flex items-center gap-3">
              <span className="text-yellow-400">🪙</span>
              <Input
                type="number"
                min={0}
                value={myApCoins}
                onChange={(e) => setMyApCoins(parseInt(e.target.value) || 0)}
                className="bg-muted border-border"
                placeholder="AP Coins a ofrecer"
              />
            </div>
          </div>

          {/* Their Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="w-6 h-6">
                <AvatarImage src={targetUser.avatarUrl} />
                <AvatarFallback>{targetUser.username[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{targetUser.displayName} ofrece</span>
            </div>

            {/* Their Items */}
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
              {targetUser.collectibles.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTheirItem(item.id)}
                  className={`relative p-2 rounded-lg border-2 transition-colors ${
                    selectedTheirItems.includes(item.id)
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border hover:border-border'
                  }`}
                >
                  <img
                    src={item.assetUrl}
                    alt={item.nameEs}
                    className="w-full h-12 object-contain"
                  />
                  <p className="text-xs truncate mt-1">{item.nameEs}</p>
                  {selectedTheirItems.includes(item.id) && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Their AP Coins (requested) */}
            <div className="flex items-center gap-3">
              <span className="text-yellow-400">🪙</span>
              <Input
                type="number"
                min={0}
                value={theirApCoins}
                onChange={(e) => setTheirApCoins(parseInt(e.target.value) || 0)}
                className="bg-muted border-border"
                placeholder="AP Coins a solicitar"
              />
            </div>
          </div>
        </div>

        {/* Trade Summary */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-medium mb-2">Resumen del intercambio</h4>
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <p>Ofreces: {selectedMyItems.length} items</p>
              {myApCoins > 0 && <p>+ {myApCoins.toLocaleString()} AP</p>}
            </div>
            <ArrowLeftRight className="w-5 h-5 text-purple-400" />
            <div className="text-muted-foreground text-right">
              <p>Recibes: {selectedTheirItems.length} items</p>
              {theirApCoins > 0 && <p>+ {theirApCoins.toLocaleString()} AP</p>}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensaje opcional..."
            className="bg-muted border-border"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendTrade}
            disabled={
              selectedMyItems.length === 0 &&
              selectedTheirItems.length === 0 &&
              myApCoins === 0 &&
              theirApCoins === 0
            }
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar oferta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
