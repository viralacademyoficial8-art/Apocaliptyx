'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/stores';
import { mockUsers } from '@/lib/mock-data';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skull, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const user: User | undefined = mockUsers.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (!user) {
        toast.error('Credenciales inválidas');
        return;
      }

      // Usamos el mock user y lo seteamos en el store
      login(user);
      toast.success('¡Bienvenido de vuelta, profeta!');
      router.push('/dashboard');
    } catch (error) {
      console.error('[LoginPage] Error al iniciar sesión', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black text-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="
          absolute left-4 top-4 sm:left-6 sm:top-6 
          inline-flex items-center gap-2 
          rounded-full bg-black/40 px-3 py-1.5 
          text-xs sm:text-sm text-gray-300 
          ring-1 ring-white/10 
          backdrop-blur 
          transition-colors 
          hover:text-white hover:bg-black/60
          z-10
        "
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md sm:max-w-lg bg-gray-900/60 border-gray-800/80 backdrop-blur-xl shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-3">
                <Skull className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
              Bienvenido de vuelta
            </h1>
            <p className="text-sm text-gray-400 sm:text-base">
              Inicia sesión para continuar prediciendo el futuro
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 pl-10 text-sm bg-gray-800 border-gray-700 focus:border-red-500 sm:h-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-11 pl-10 text-sm bg-gray-800 border-gray-700 focus:border-red-500 sm:h-12"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 w-full bg-red-600 text-base font-semibold text-white hover:bg-red-700 sm:h-12"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="bg-gray-900/60 px-2 text-gray-400">O</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-xs text-gray-400 sm:text-sm">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/registro"
                className="font-semibold text-red-400 hover:text-red-300"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
