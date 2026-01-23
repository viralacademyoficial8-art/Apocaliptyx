// src/app/(auth)/restablecer-password/page.tsx

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Validar el token al cargar
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token no proporcionado");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Token invalido o expirado");
        }

        setTokenValid(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Token invalido o expirado");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Validacion de contrasena
  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("Minimo 8 caracteres");
    if (!/[A-Z]/.test(pwd)) errors.push("Una mayuscula");
    if (!/[a-z]/.test(pwd)) errors.push("Una minuscula");
    if (!/[0-9]/.test(pwd)) errors.push("Un numero");
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      setError("La contrasena no cumple los requisitos");
      return;
    }

    if (!passwordsMatch) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contrasena");
      }

      setSuccess(true);

      // Redirigir al login despues de 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contrasena");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-zinc-400">Verificando enlace...</p>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid && !success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Enlace invalido o expirado
        </h2>
        <p className="text-zinc-400 mb-6">
          {error || "El enlace de recuperacion ha expirado o ya fue utilizado. Solicita uno nuevo."}
        </p>
        <Link
          href="/recuperar-password"
          className="inline-flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-5 h-5" />
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Contrasena actualizada
        </h2>
        <p className="text-zinc-400 mb-6">
          Tu contrasena ha sido restablecida exitosamente. Seras redirigido al login en unos segundos...
        </p>
        <div className="flex items-center justify-center gap-2 text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirigiendo...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Nueva contrasena
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="w-full pl-12 pr-12 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        {password && (
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { check: password.length >= 8, label: "8+ caracteres" },
              { check: /[A-Z]/.test(password), label: "Mayuscula" },
              { check: /[a-z]/.test(password), label: "Minuscula" },
              { check: /[0-9]/.test(password), label: "Numero" },
            ].map((req, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-lg ${
                  req.check
                    ? "bg-green-500/20 text-green-400"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {req.check ? "✓" : "○"} {req.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Confirmar contrasena
        </label>
        <div className="relative">
          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className={`w-full pl-12 pr-12 py-3.5 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 transition-all ${
              confirmPassword && !passwordsMatch
                ? "border-red-500/50 focus:border-red-500/50"
                : confirmPassword && passwordsMatch
                ? "border-green-500/50 focus:border-green-500/50"
                : "border-zinc-700/50 focus:border-purple-500/50"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="mt-2 text-sm text-red-400">Las contrasenas no coinciden</p>
        )}
        {confirmPassword && passwordsMatch && (
          <p className="mt-2 text-sm text-green-400">Las contrasenas coinciden</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || passwordErrors.length > 0 || !passwordsMatch}
        className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Actualizando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Restablecer contrasena
          </>
        )}
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    </form>
  );
}

export default function RestablecerPasswordPage() {
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

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl">
              <Image
                src="/apocaliptyx-logo.png"
                alt="Apocaliptyx"
                width={24}
                height={24}
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
            </div>
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              APOCALIPTYX
            </span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Glass Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />

            <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
              {/* Back Link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesion
              </Link>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Nueva Contrasena
                </h1>
                <p className="text-zinc-400">
                  Ingresa tu nueva contrasena
                </p>
              </div>

              <Suspense fallback={
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
                </div>
              }>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
