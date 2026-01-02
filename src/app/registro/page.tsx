'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
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
  Loader2,
  CheckCircle,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

    // Validar que username solo tenga caracteres permitidos
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('El nombre de usuario solo puede contener letras, números y guiones bajos');
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
      // Verificar si el username ya existe
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username.toLowerCase())
        .single();

      if (existingUsername) {
        toast.error('Este nombre de usuario ya está en uso');
        setLoading(false);
        return;
      }

      // Verificar si el email ya existe
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (existingEmail) {
        toast.error('Este email ya está registrado');
        setLoading(false);
        return;
      }

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            username: formData.username.toLowerCase(),
            display_name: formData.username,
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('already registered')) {
          toast.error('Este email ya está registrado');
        } else {
          toast.error(authError.message || 'Error al crear la cuenta');
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Error al crear la cuenta');
        setLoading(false);
        return;
      }

      // 2. Crear perfil en tabla users
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: formData.email.toLowerCase(),
        username: formData.username.toLowerCase(),
        display_name: formData.username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          formData.username
        )}&backgroundColor=0f172a`,
        role: 'USER',
        ap_coins: 1000, // Bono de bienvenida
        level: 1,
        xp: 0,
        is_verified: false,
        is_premium: false,
        is_banned: false,
        total_predictions: 0,
        correct_predictions: 0,
        total_earnings: 0,
      });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Si falla crear el perfil, el auth.config.ts lo creará en el primer login
      }

      // 3. Crear notificación de bienvenida
      await supabase.from('notifications').insert({
        user_id: authData.user.id,
        type: 'welcome',
        title: '¡Bienvenido a Apocaliptics!',
        message: 'Tu cuenta ha sido creada. Recibiste 1,000 AP Coins de bono de bienvenida. ¡Comienza a predecir el futuro!',
        is_read: false,
      });

      setSuccess(true);
      toast.success('¡Cuenta creada exitosamente!');

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black text-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-500/20 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">¡Cuenta Creada!</h1>
          <p className="text-gray-400 mb-6">
            Tu cuenta ha sido creada exitosamente. Revisa tu email para confirmar tu cuenta y luego inicia sesión.
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">+1,000 AP Coins de bienvenida</span>
          </div>
          <p className="text-sm text-gray-500">
            Redirigiendo al login...
          </p>
        </Card>
      </div>
    );
  }

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
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Solo letras, números y guiones bajos
                </p>
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear Cuenta Gratis'
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <Link href="/terminos" className="text-red-400 hover:text-red-300">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacidad" className="text-red-400 hover:text-red-300">
                Política de Privacidad
              </Link>
            </p>

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