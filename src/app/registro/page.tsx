'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/stores';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Skull,
  Mail,
  Lock,
  User as UserIcon,
  ArrowLeft,
  Zap,
} from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: formData.username,
        displayName: formData.username,
        email: formData.email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          formData.username
        )}&backgroundColor=0f172a`,
        prophetLevel: 'monividente',
        reputationScore: 0,
        apCoins: 1000, // bono de bienvenida
        scenariosCreated: 0,
        scenariosWon: 0,
        winRate: 0,
        followers: 0,
        following: 0,
        createdAt: new Date(),
      };

      // Simulamos "registro" guardando al usuario en el store
      login(newUser);
      toast.success('¡Cuenta creada! Bienvenido a Apocaliptics');
      router.push('/dashboard');
    } catch (error) {
      console.error('[RegistroPage] Error al crear la cuenta', error);
      toast.error('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black text-white flex flex-col">
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
      <div className="relative z-10">
        <Link
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Wrapper para centrar y permitir scroll en móviles */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Card className="relative w-full max-w-md bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl z-10">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Skull className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Únete a Apocaliptics
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Crea tu cuenta y comienza a predecir el futuro
              </p>
            </div>

            {/* Welcome Bonus */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4 mb-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-400 text-sm sm:text-base">
                    ¡Bono de Bienvenida!
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-200/80">
                    Recibe 1,000 AP Coins gratis al registrarte
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300 text-sm">
                  Nombre de usuario
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="nostradamus2024"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 focus:border-red-500 text-sm"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 focus:border-red-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 text-sm">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 focus:border-red-500 text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-300 text-sm"
                >
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 focus:border-red-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 sm:py-5 text-base sm:text-lg font-semibold mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear Cuenta Gratis'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-gray-900/70 text-gray-400">O</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/login"
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
