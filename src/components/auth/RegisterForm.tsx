// src/components/auth/RegisterForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { checkEmailExists, checkUsernameExists } from "@/lib/actions/auth.actions";
import { SocialButtons } from "./SocialButtons";
import { Mail, Lock, Eye, EyeOff, User, Loader2, AlertCircle, Check, X } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
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

  const handleEmailBlur = async () => {
    if (!formData.email) return;
    setValidation((prev) => ({ ...prev, checkingEmail: true }));
    const exists = await checkEmailExists(formData.email);
    setValidation((prev) => ({ ...prev, emailExists: exists, checkingEmail: false }));
  };

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

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Link href="/">
          <Image
            src="/apocaliptyx-logo.png"
            alt="Apocaliptyx"
            width={180}
            height={50}
            className="h-14 w-auto"
            priority
          />
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Crear Cuenta</h1>
        <p className="text-muted-foreground">Únete a la comunidad de profetas</p>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-center">
        <p className="text-yellow-400 font-bold">🎁 ¡Bono de Bienvenida!</p>
        <p className="text-yellow-300/80 text-sm">
          Recibe <span className="font-bold">1,000 AP Coins</span> gratis al registrarte
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <SocialButtons disabled={isLoading} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground">o regístrate con email</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Tu nombre"
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Nombre de usuario</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              onBlur={handleUsernameBlur}
              placeholder="tu_usuario"
              minLength={3}
              disabled={isLoading}
              className={`w-full pl-8 pr-10 py-3 bg-muted border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 ${
                validation.usernameExists ? "border-red-500" : "border-border"
              }`}
            />
            {validation.checkingUsername && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
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

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="tu@email.com"
              disabled={isLoading}
              className={`w-full pl-10 pr-10 py-3 bg-muted border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 ${
                validation.emailExists ? "border-red-500" : "border-border"
              }`}
            />
            {validation.checkingEmail && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            )}
          </div>
          {validation.emailExists && (
            <p className="text-red-400 text-xs mt-1">Este email ya está registrado</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="••••••••"
              minLength={6}
              disabled={isLoading}
              className="w-full pl-10 pr-12 py-3 bg-muted border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <p className={`text-xs flex items-center gap-1 ${passwordValidation.minLength ? "text-green-400" : "text-muted-foreground"}`}>
              {passwordValidation.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Mínimo 6 caracteres
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-3 bg-muted border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 ${
                formData.confirmPassword && !passwordValidation.matches ? "border-red-500" : "border-border"
              }`}
            />
          </div>
          {formData.confirmPassword && !passwordValidation.matches && (
            <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-border bg-muted text-red-600 focus:ring-red-500"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            Acepto los{" "}
            <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
              Términos de Servicio
            </a>{" "}
            y la{" "}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
              Política de Privacidad
            </a>
          </label>
        </div>

        <button
          type="button"
          id="register-button"
          disabled={!isFormValid || isLoading}
          onClick={async () => {
            console.log("=== BUTTON CLICKED ===");
            
            if (!isFormValid) {
              console.log("Form not valid");
              return;
            }

            if (isLoading) {
              console.log("Already loading");
              return;
            }

            // No podemos usar setIsLoading aquí directamente, así que usamos un approach diferente
            const button = document.getElementById('register-button') as HTMLButtonElement;
            if (button) {
              button.disabled = true;
              button.innerHTML = '<span class="animate-spin">⏳</span> Creando cuenta...';
            }

            try {
              console.log("Calling /api/auth/register...");
              
              const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: formData.email,
                  password: formData.password,
                  username: formData.username,
                  name: formData.name,
                }),
              });

              console.log("Response status:", response.status);
              
              const result = await response.json();
              console.log("Response result:", result);

              if (!result.success) {
                alert(result.message || "Error al registrar");
                if (button) {
                  button.disabled = false;
                  button.innerHTML = 'Crear Cuenta Gratis';
                }
                return;
              }

              console.log("Registration successful, attempting auto-login...");

              const loginResult = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
              });

              console.log("Login result:", loginResult);

              if (loginResult?.error) {
                console.log("Auto-login failed, redirecting to login...");
                alert("Cuenta creada! Por favor inicia sesión.");
                router.push("/login");
                return;
              }

              console.log("Login successful, redirecting to dashboard...");
              router.push("/dashboard");
              router.refresh();

            } catch (error) {
              console.error("Register error:", error);
              alert("Error al crear la cuenta");
              if (button) {
                button.disabled = false;
                button.innerHTML = 'Crear Cuenta Gratis';
              }
            }
          }}
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
      </div>

      <p className="mt-6 text-center text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}