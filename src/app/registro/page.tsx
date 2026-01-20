'use client';

export const dynamic = 'force-dynamic';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowLeft,
  Zap,
  Loader2,
  CheckCircle,
  Sparkles,
  Gift,
} from 'lucide-react';


export default function RegistroPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
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
      toast.error('El nombre de usuario solo puede contener letras, numeros y guiones bajos');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contrasenas no coinciden');
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
        toast.error('Este nombre de usuario ya esta en uso');
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
        toast.error('Este email ya esta registrado');
        setLoading(false);
        return;
      }

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await getSupabaseBrowser().auth.signUp({
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
          toast.error('Este email ya esta registrado');
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
      const { error: profileError } = await getSupabaseBrowser().from('users').insert({
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
        // Si falla crear el perfil, el auth.config.ts lo creara en el primer login
      }

      // 3. Crear notificacion de bienvenida
      await getSupabaseBrowser().from('notifications').insert({
        user_id: authData.user.id,
        type: 'welcome',
        title: 'Bienvenido a Apocaliptyx!',
        message: 'Tu cuenta ha sido creada. Recibiste 1,000 AP Coins de bono de bienvenida. Comienza a predecir el futuro!',
        is_read: false,
      });

      setSuccess(true);
      toast.success('Cuenta creada exitosamente!');

      // Redirigir al login despues de 2 segundos
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

  // Pantalla de exito
  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-10 text-center max-w-md">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-green-500/20 rounded-full border border-green-500/30">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-black mb-4">Cuenta Creada!</h1>
            <p className="text-zinc-400 mb-6">
              Tu cuenta ha sido creada exitosamente. Revisa tu email para confirmar tu cuenta y luego inicia sesion.
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl py-3 px-4">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">+1,000 AP Coins de bienvenida</span>
            </div>
            <p className="text-sm text-zinc-500">
              Redirigiendo al login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Back to home */}
      <div className="relative z-10 p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 sm:py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />

            <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <Link href="/" className="inline-block mb-4 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 p-3 rounded-2xl border border-zinc-700/50">
                      <Image
                        src="/apocaliptyx-logo.png"
                        alt="Apocaliptyx"
                        width={120}
                        height={35}
                        className="h-8 w-auto"
                      />
                    </div>
                  </div>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black mb-2">
                  Unete a Apocaliptyx
                </h1>
                <p className="text-zinc-400 text-sm">
                  Crea tu cuenta y comienza a predecir el futuro
                </p>
              </div>

              {/* Welcome Bonus */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-400 text-sm">
                      Bono de Bienvenida!
                    </p>
                    <p className="text-xs text-yellow-200/80">
                      Recibe 1,000 AP Coins gratis al registrarte
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      id="username"
                      type="text"
                      placeholder="nostradamus2024"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 transition-all text-sm"
                      required
                      minLength={3}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Solo letras, numeros y guiones bajos
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 transition-all text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Contrasena
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 transition-all text-sm"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Minimo 6 caracteres
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                    Confirmar Contrasena
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
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
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 transition-all text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Crear Cuenta Gratis
                    </>
                  )}
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </form>

              {/* Terms */}
              <p className="text-xs text-zinc-500 text-center mt-4">
                Al registrarte, aceptas nuestros{' '}
                <Link href="/terminos-y-condiciones" className="text-purple-400 hover:text-purple-300">
                  Terminos de Servicio
                </Link>{' '}
                y{' '}
                <Link href="/privacidad" className="text-purple-400 hover:text-purple-300">
                  Politica de Privacidad
                </Link>
              </p>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-zinc-900/80 text-zinc-500">O</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-zinc-400 text-sm">
                  Ya tienes una cuenta?{' '}
                  <Link
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Inicia sesion
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
