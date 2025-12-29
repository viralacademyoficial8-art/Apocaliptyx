// src/components/auth/RegisterForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser, checkEmailExists, checkUsernameExists } from "@/lib/actions/auth.actions";
import { SocialButtons } from "./SocialButtons";
import { Mail, Lock, Eye, EyeOff, User, Loader2, AlertCircle, Check, X } from "lucide-react";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validaciones en tiempo real
  const [validation, setValidation] = useState({
    emailExists: false,
    usernameExists: false,
    checkingEmail: false,
    checkingUsername: false,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
  };

  // Verificar email con debounce
  const handleEmailBlur = async () => {
    if (!formData.email) return;
    setValidation((prev) => ({ ...prev, checkingEmail: true }));
    const exists = await checkEmailExists(formData.email);
    setValidation((prev) => ({ ...prev, emailExists: exists, checkingEmail: false }));
  };

  // Verificar username con debounce
  const handleUsernameBlur = async () => {
    if (!formData.username || formData.username.length < 3) return;
    setValidation((prev) => ({ ...prev, checkingUsername: true }));
    const exists = await checkUsernameExists(formData.username);
    setValidation((prev) => ({ ...prev, usernameExists: exists, checkingUsername: false }));
  };

  const passwordValidation = {
    minLength: formData.password.length >= 6,
    hasNumber: /\d/.test(formData.password),
    matches: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
  };

  const isFormValid =
    formData.name &&
    formData.username.length >= 3 &&
    formData.email &&
    passwordValidation.minLength &&
    passwordValidation.matches &&
    acceptTerms &&
    !validation.emailExists &&
    !validation.usernameExists;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        name: formData.name,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch (error) {
      // Redirect esperado
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
        <p className="text-gray-400">
          Únete a la comunidad de profetas
        </p>
      </div>

      {/* Bonus Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-center">
        <p className="text-yellow-400 font-bold">🎁 ¡Bono de Bienvenida!</p>
        <p className="text-yellow-300/80 text-sm">
          Recibe <span className="font-bold">1,000 AP Coins</span> gratis al registrarte
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Social Buttons */}
      <SocialButtons disabled={isLoading} />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-900 text-gray-400">
            o regístrate con email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Tu nombre"
              required
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              onBlur={handleUsernameBlur}
              placeholder="tu_usuario"
              required
              minLength={3}
              disabled={isLoading}
              className={`w-full pl-8 pr-10 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 ${
                validation.usernameExists ? "border-red-500" : "border-gray-700"
              }`}
            />
            {validation.checkingUsername && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
            )}
            {!validation.checkingUsername && formData.username.length >= 3 && (
              validation.usernameExists ? (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              ) : (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )
            )}
          </div>
          {validation.usernameExists && (
            <p className="text-red-400 text-xs mt-1">Este nombre de usuario ya está en uso</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
              className={`w-full pl-10 pr-10 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 ${
                validation.emailExists ? "border-red-500" : "border-gray-700"
              }`}
            />
            {validation.checkingEmail && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
            )}
          </div>
          {validation.emailExists && (
            <p className="text-red-400 text-xs mt-1">Este email ya está registrado</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={isLoading}
              className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {/* Password Requirements */}
          <div className="mt-2 space-y-1">
            <p className={`text-xs flex items-center gap-1 ${passwordValidation.minLength ? "text-green-400" : "text-gray-500"}`}>
              {passwordValidation.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Mínimo 6 caracteres
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 ${
                formData.confirmPassword && !passwordValidation.matches ? "border-red-500" : "border-gray-700"
              }`}
            />
          </div>
          {formData.confirmPassword && !passwordValidation.matches && (
            <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-400">
            Acepto los{" "}
            <Link href="/terminos" className="text-red-400 hover:text-red-300">
              Términos de Servicio
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" className="text-red-400 hover:text-red-300">
              Política de Privacidad
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear Cuenta Gratis"
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-6 text-center text-gray-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}