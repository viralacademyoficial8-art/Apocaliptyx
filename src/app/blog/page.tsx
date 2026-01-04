// src/app/blog/page.tsx

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Calendar, User, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Blog | Apocaliptyx",
  description: "Noticias, guías y actualizaciones de Apocaliptyx",
};

// Datos de ejemplo - en el futuro pueden venir de una base de datos
const blogPosts = [
  {
    id: 1,
    slug: "bienvenidos-a-apocaliptyx",
    title: "Bienvenidos a Apocaliptyx: Tu nueva plataforma de predicciones",
    excerpt: "Descubre cómo funciona nuestra plataforma y por qué somos diferentes a todo lo que has visto.",
    image: "/blog/welcome.jpg",
    category: "Anuncios",
    author: "Equipo Apocaliptyx",
    date: "2026-01-01",
    readTime: "5 min",
  },
  {
    id: 2,
    slug: "guia-principiantes",
    title: "Guía para principiantes: Cómo empezar a predecir",
    excerpt: "Todo lo que necesitas saber para comenzar tu carrera como profeta digital en Apocaliptyx.",
    image: "/blog/guide.jpg",
    category: "Guías",
    author: "Equipo Apocaliptyx",
    date: "2025-12-28",
    readTime: "8 min",
  },
  {
    id: 3,
    slug: "estrategias-prediccion",
    title: "5 estrategias para mejorar tus predicciones",
    excerpt: "Aprende las técnicas que usan los mejores profetas del leaderboard para maximizar sus aciertos.",
    image: "/blog/strategies.jpg",
    category: "Estrategias",
    author: "Equipo Apocaliptyx",
    date: "2025-12-20",
    readTime: "6 min",
  },
  {
    id: 4,
    slug: "actualizacion-enero-2026",
    title: "Actualización de Enero 2026: Nuevas funciones",
    excerpt: "Chat de soporte en tiempo real, centro de ayuda mejorado y más novedades este mes.",
    image: "/blog/update.jpg",
    category: "Actualizaciones",
    author: "Equipo Apocaliptyx",
    date: "2026-01-04",
    readTime: "4 min",
  },
];

const categories = [
  { name: "Todos", count: 4 },
  { name: "Anuncios", count: 1 },
  { name: "Guías", count: 1 },
  { name: "Estrategias", count: 1 },
  { name: "Actualizaciones", count: 1 },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Noticias, guías, estrategias y actualizaciones de Apocaliptyx
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="font-bold text-white mb-4">Categorías</h2>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <button className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 rounded-lg transition-colors text-left">
                      <span className="text-gray-400">{cat.name}</span>
                      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">{cat.count}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                <h3 className="font-bold mb-2">Newsletter</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Recibe las últimas noticias en tu correo
                </p>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                />
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
                  Suscribirse
                </button>
              </div>
            </div>
          </aside>

          {/* Posts */}
          <div className="lg:col-span-3">
            {/* Featured post */}
            <article className="mb-8 group">
              <Link href={`/blog/${blogPosts[0].slug}`}>
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-purple-400/50" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                      {blogPosts[0].category}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-400 mb-4">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(blogPosts[0].date).toLocaleDateString('es-MX')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
              </Link>
            </article>

            {/* Grid de posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.slice(1).map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-700" />
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('es-MX')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Más posts */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">Mostrando 4 de 4 artículos</p>
              <button disabled className="px-6 py-3 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed">
                No hay más artículos
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}