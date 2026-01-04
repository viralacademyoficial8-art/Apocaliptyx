// src/app/ayuda/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  HelpCircle, Search, ChevronRight, MessageCircle, Mail, 
  BookOpen, Zap, Shield, Coins, Users, Trophy, X, Loader2 
} from "lucide-react";
import Link from "next/link";

interface HelpArticle {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  views: number;
}

const categories = [
  {
    icon: Zap,
    title: "Primeros Pasos",
    description: "Aprende lo básico para comenzar",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    articles: [
      { title: "¿Cómo crear una cuenta?", href: "/ayuda/crear-cuenta" },
      { title: "¿Qué son los AP Coins?", href: "/ayuda/ap-coins" },
      { title: "¿Cómo funciona la plataforma?", href: "/ayuda/como-funciona" },
      { title: "Guía de inicio rápido", href: "/ayuda/guia-inicio" },
    ],
  },
  {
    icon: BookOpen,
    title: "Escenarios",
    description: "Todo sobre predicciones",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    articles: [
      { title: "¿Cómo crear un escenario?", href: "/ayuda/crear-escenario" },
      { title: "¿Cómo participar en escenarios?", href: "/ayuda/participar-escenario" },
      { title: "¿Cómo se resuelven los escenarios?", href: "/ayuda/resolucion-escenarios" },
      { title: "Reglas de los escenarios", href: "/ayuda/reglas-escenarios" },
    ],
  },
  {
    icon: Coins,
    title: "AP Coins y Pagos",
    description: "Moneda virtual y transacciones",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    articles: [
      { title: "¿Cómo obtener AP Coins gratis?", href: "/ayuda/coins-gratis" },
      { title: "¿Cómo comprar AP Coins?", href: "/ayuda/comprar-coins" },
      { title: "Métodos de pago aceptados", href: "/ayuda/metodos-pago" },
      { title: "Política de reembolsos", href: "/ayuda/reembolsos" },
    ],
  },
  {
    icon: Users,
    title: "Comunidad",
    description: "Foro, chat y perfiles",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    articles: [
      { title: "¿Cómo usar el foro?", href: "/ayuda/usar-foro" },
      { title: "¿Cómo enviar mensajes privados?", href: "/ayuda/mensajes-privados" },
      { title: "Personalizar mi perfil", href: "/ayuda/personalizar-perfil" },
      { title: "Seguir a otros usuarios", href: "/ayuda/seguir-usuarios" },
    ],
  },
  {
    icon: Trophy,
    title: "Ranking y Logros",
    description: "Competencia y recompensas",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    articles: [
      { title: "¿Cómo funciona el leaderboard?", href: "/ayuda/leaderboard" },
      { title: "Sistema de niveles y XP", href: "/ayuda/niveles-xp" },
      { title: "Insignias y logros", href: "/ayuda/insignias" },
      { title: "Beneficios premium", href: "/ayuda/premium" },
    ],
  },
  {
    icon: Shield,
    title: "Seguridad y Cuenta",
    description: "Protege tu cuenta",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    articles: [
      { title: "Cambiar contraseña", href: "/ayuda/cambiar-password" },
      { title: "Verificar mi cuenta", href: "/ayuda/verificar-cuenta" },
      { title: "Recuperar acceso a mi cuenta", href: "/ayuda/recuperar-cuenta" },
      { title: "Eliminar mi cuenta", href: "/ayuda/eliminar-cuenta" },
    ],
  },
];

function formatViews(views: number): string {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
}

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [popularArticles, setPopularArticles] = useState<HelpArticle[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Cargar artículos populares
  useEffect(() => {
    async function fetchPopular() {
      try {
        const res = await fetch("/api/help/popular");
        const data = await res.json();
        setPopularArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching popular articles:", error);
      } finally {
        setLoadingPopular(false);
      }
    }
    fetchPopular();
  }, []);

  // Búsqueda con debounce
  const searchArticles = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/help/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.articles || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchArticles(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchArticles]);

  const handleArticleClick = async (slug: string) => {
    // Incrementar vistas
    try {
      await fetch("/api/help/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Encuentra respuestas a tus preguntas y aprende a sacar el máximo provecho de Apocaliptyx
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.map((article) => (
                <Link
                  key={article.slug}
                  href={`/ayuda/${article.slug}`}
                  onClick={() => {
                    handleArticleClick(article.slug);
                    setShowResults(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-white font-medium">{article.title}</p>
                    {article.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{article.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
              ))}
            </div>
          )}

          {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 p-6 text-center">
              <p className="text-gray-400">No se encontraron resultados para &quot;{searchQuery}&quot;</p>
              <p className="text-sm text-gray-500 mt-2">Intenta con otras palabras clave</p>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 ${category.bgColor} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{category.title}</h2>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article.title}>
                      <Link
                        href={article.href}
                        onClick={() => handleArticleClick(article.href.split("/").pop() || "")}
                        className="flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors py-1 group"
                      >
                        <span>{article.title}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Artículos Populares
          </h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            {loadingPopular ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />
              </div>
            ) : popularArticles.length > 0 ? (
              popularArticles.map((article, index) => (
                <Link
                  key={article.slug}
                  href={`/ayuda/${article.slug}`}
                  onClick={() => handleArticleClick(article.slug)}
                  className={`flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors ${
                    index !== popularArticles.length - 1 ? "border-b border-gray-800" : ""
                  }`}
                >
                  <span className="text-gray-300 hover:text-white">{article.title}</span>
                  <span className="text-sm text-gray-500">{formatViews(article.views)} vistas</span>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No hay artículos populares
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Chat en Vivo</h3>
                <p className="text-sm text-gray-400">Respuesta inmediata</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Habla con nuestro equipo de soporte en tiempo real. Disponible de Lunes a Viernes, 9am - 6pm (CST).
            </p>
            <Link 
              href="/chat"
              className="block w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-center"
            >
              Iniciar Chat
            </Link>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Enviar Email</h3>
                <p className="text-sm text-gray-400">Respuesta en 24-48h</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              ¿Tienes una consulta más detallada? Envíanos un email y te responderemos lo antes posible.
            </p>
            <a
              href="mailto:contacto@apocaliptyx.com"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center"
            >
              contacto@apocaliptyx.com
            </a>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">¿No encontraste lo que buscabas?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Ver Preguntas Frecuentes
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contactar Soporte
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}