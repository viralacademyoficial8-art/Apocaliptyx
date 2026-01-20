'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';
import { 
  Bell, 
  Loader2, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Megaphone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_pinned: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  SUCCESS: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  ERROR: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

export default function AnunciosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error loading announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Megaphone className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Anuncios</h1>
            <p className="text-gray-400">Noticias y actualizaciones de Apocaliptyx</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-400">Cargando anuncios...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No hay anuncios</h2>
            <p className="text-gray-500">
              Cuando haya novedades, las verás aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const config = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.INFO;
              const Icon = config.icon;

              return (
                <div
                  key={announcement.id}
                  className={`border rounded-xl p-5 ${config.bg} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        {announcement.is_pinned && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                            📌 Fijado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{announcement.content}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(announcement.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}