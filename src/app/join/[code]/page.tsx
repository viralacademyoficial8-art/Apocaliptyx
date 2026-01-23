'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { chatService } from '@/services/chat.service';
import { Loader2, Users, CheckCircle, XCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const code = params.code as string;

  const [joining, setJoining] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; conversationId?: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Guardar la URL para redirigir después del login
      sessionStorage.setItem('joinAfterLogin', code);
      return;
    }

    // Si ya está autenticado, intentar unirse
    if (session?.user?.id && code) {
      handleJoin();
    }
  }, [status, session, code]);

  const handleJoin = async () => {
    if (!session?.user?.id) return;

    setJoining(true);
    try {
      const response = await chatService.joinViaInviteCode(code, session.user.id);

      if (response.success) {
        setResult({
          success: true,
          message: '¡Te has unido al grupo exitosamente!',
          conversationId: response.conversationId
        });

        // Redirigir al chat después de 2 segundos
        setTimeout(() => {
          router.push(`/mensajes?conv=${response.conversationId}`);
        }, 2000);
      } else {
        setResult({
          success: false,
          message: response.error || 'No se pudo unir al grupo'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error al procesar la invitación'
      });
    } finally {
      setJoining(false);
    }
  };

  // Pantalla de carga
  if (status === 'loading' || joining) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Procesando invitación...</p>
        </div>
      </div>
    );
  }

  // Usuario no autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Invitación a grupo</h1>
          <p className="text-muted-foreground mb-6">
            Inicia sesión para unirte a este grupo
          </p>

          <Link
            href={`/login?callbackUrl=/join/${code}`}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogIn className="w-5 h-5" />
            Iniciar sesión
          </Link>

          <p className="text-xs text-muted-foreground mt-4">
            ¿No tienes cuenta?{' '}
            <Link href={`/register?callbackUrl=/join/${code}`} className="text-purple-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Resultado de unirse
  if (result) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          {result.success ? (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-green-400">¡Bienvenido!</h1>
              <p className="text-muted-foreground mb-6">{result.message}</p>
              <p className="text-sm text-muted-foreground">Redirigiendo al chat...</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
              <p className="text-muted-foreground mb-6">{result.message}</p>
              <Link
                href="/mensajes"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
              >
                Ir a Mensajes
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
