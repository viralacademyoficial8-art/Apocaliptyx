'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Skull, 
  Home, 
  Search, 
  ArrowLeft,
  Ghost,
  Flame
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Ghost className="w-32 h-32 text-purple-500 mx-auto" />
            </motion.div>
            
            {/* Floating flames */}
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
              }}
              className="absolute -top-2 -right-2"
            >
              <Flame className="w-8 h-8 text-orange-500" />
            </motion.div>
            <motion.div
              animate={{ 
                opacity: [1, 0.5, 1],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute -bottom-2 -left-2"
            >
              <Flame className="w-6 h-6 text-red-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-red-500 to-orange-500 mb-4">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            ¡Esta predicción no existe!
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Parece que esta página desapareció en el apocalipsis. 
            Ni el mejor profeta pudo predecir esto.
          </p>
        </motion.div>

        {/* Fun facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 p-4 bg-card border border-border rounded-lg max-w-md mx-auto"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-purple-400 font-semibold">¿Sabías que?</span> El código 404 
            viene de la habitación 404 en el CERN, donde estaban los primeros servidores web. 
            <span className="text-yellow-400"> 🤓</span>
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-border hover:bg-muted"
            >
              <Skull className="w-5 h-5 mr-2" />
              Ver Escenarios
            </Button>
          </Link>
          
          <Link href="/buscar">
            <Button 
              size="lg" 
              variant="ghost" 
              className="w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </Button>
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <button 
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la página anterior
          </button>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
          }}
          transition={{ 
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-red-500/5 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
}
