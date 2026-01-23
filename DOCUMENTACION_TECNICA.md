# APOCALIPTYX - Documentacion Tecnica Completa

## Resumen Ejecutivo

**Apocaliptyx** es una plataforma de predicciones gamificada de ultima generacion construida como una aplicacion web full-stack. Los usuarios crean, comercian, roban y predicen escenarios futuros mientras compiten por reputacion y moneda virtual (AP Coins). La plataforma incluye interacciones en tiempo real, redes sociales, gamificacion avanzada y capacidades de construccion de comunidades.

---

## 1. STACK TECNOLOGICO PRINCIPAL

### Frontend
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Next.js** | 14.2.5 | Framework React con SSR y App Router |
| **React** | 18 | Libreria de interfaces de usuario |
| **TypeScript** | 5 | Tipado estatico para JavaScript |
| **Tailwind CSS** | 3 | Framework de estilos utility-first |
| **Zustand** | 4.5.7 | Gestion de estado global |
| **Framer Motion** | - | Animaciones fluidas |
| **Radix UI** | - | Componentes accesibles (dialogos, dropdowns, tabs) |
| **Lucide React** | - | Iconografia moderna |

### Backend y Base de Datos
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Node.js** | - | Runtime de JavaScript |
| **Next.js API Routes** | - | Endpoints serverless |
| **PostgreSQL** | - | Base de datos relacional (via Supabase) |
| **Prisma ORM** | 6.19.1 | Object-Relational Mapping |
| **Supabase** | - | Backend-as-a-Service |

### Autenticacion
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **NextAuth.js** | 5.0 beta | Autenticacion multi-proveedor |
| **bcryptjs** | - | Hash de contrasenas |
| **Google OAuth 2.0** | - | Login con Google |
| **Discord OAuth 2.0** | - | Login con Discord |

### Comunicacion en Tiempo Real
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **LiveKit** | 2.15+ | Streaming WebRTC (video/audio) |
| **Supabase Realtime** | - | Actualizaciones en tiempo real (PostgreSQL LISTEN/NOTIFY) |
| **OneSignal** | - | Notificaciones push |
| **Web Push API** | 3.6.7 | Notificaciones nativas del navegador |

### Gestion de Medios
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Cloudinary** | 2.8.0 | Almacenamiento y CDN de imagenes/videos |
| **DiceBear API** | - | Generacion de avatares por defecto |

### Email
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Resend** | 6.6.0 | Servicio de emails transaccionales |
| **@react-email/render** | 2.0.3 | Plantillas de email con React |

### Despliegue
| Tecnologia | Proposito |
|------------|-----------|
| **Vercel** | Hosting y deployment automatico |
| **Vercel Crons** | Tareas programadas (auto-feature cada 6 horas) |

---

## 2. ARQUITECTURA DEL FRONTEND

### Estructura de Carpetas
```
/src
├── /app                    # Rutas y paginas (Next.js App Router)
├── /components            # Componentes React reutilizables
│   ├── /admin            # Dashboard de administracion
│   ├── /animations       # Componentes de animacion
│   ├── /auth             # Login, registro, reset password
│   ├── /collectibles     # Sistema de coleccionables
│   ├── /communities      # Funciones de comunidades
│   ├── /feed             # Feed social y timeline
│   ├── /gamification     # Logros, misiones, niveles
│   ├── /layout           # Navegacion, headers, sidebars
│   ├── /perfil           # Perfiles de usuario
│   ├── /providers        # Proveedores de contexto
│   ├── /pwa              # Progressive Web App
│   ├── /reels            # Videos cortos (tipo TikTok)
│   ├── /stories          # Historias (tipo Instagram)
│   ├── /streaming        # Transmision en vivo
│   ├── /tienda           # Tienda de cosmeticos
│   ├── /tournaments      # Sistema de torneos
│   └── /ui               # Componentes base (shadcn/ui)
├── /hooks                # Hooks personalizados
├── /lib                  # Utilidades y configuraciones
├── /services             # Logica de negocio
├── /stores               # Estado global (Zustand)
├── /styles              # Estilos globales
├── /types               # Definiciones TypeScript
└── /i18n               # Internacionalizacion
```

### Rutas Principales de la Aplicacion
| Ruta | Descripcion |
|------|-------------|
| `/` | Pagina de inicio/landing |
| `/dashboard` | Panel principal del usuario |
| `/crear` | Crear nuevos escenarios |
| `/escenario/[id]` | Ver detalle de escenario |
| `/explorar` | Explorar escenarios por categoria |
| `/leaderboard` | Sistema de rankings |
| `/perfil` | Perfil del usuario |
| `/perfil/[username]` | Ver perfiles de otros usuarios |
| `/tienda` | Tienda de items |
| `/inventario` | Inventario del usuario |
| `/coleccionables` | Sistema de trading |
| `/reels` | Feed de videos |
| `/streaming` | Transmisiones en vivo |
| `/foro` | Foro de discusion |
| `/comunidades` | Listado de comunidades |
| `/mensajes` | Sistema de mensajeria |
| `/notificaciones` | Centro de notificaciones |
| `/admin/*` | Panel de administracion |

### Gestion de Estado (Zustand Stores)
- **`useAuthStore`** - Autenticacion, perfil, balance de AP Coins
- **`useNotificationsStore`** - Gestion de notificaciones
- **`useScenarioStore`** - Estado de escenarios/predicciones
- **`useSocialStore`** - Relaciones de seguidores

---

## 3. ARQUITECTURA DEL BACKEND (API)

### Estructura de Endpoints

#### Autenticacion y Usuarios
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET/POST | `/api/me` | Datos del usuario actual |
| GET/POST | `/api/auth/*` | Handlers de NextAuth.js |
| POST | `/api/email/send` | Envio de notificaciones por email |

#### Sistema de Escenarios (Core)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET/POST | `/api/scenarios` | Listar/crear escenarios |
| GET/POST | `/api/scenarios/[id]` | Detalle y comentarios |
| GET | `/api/scenarios/[id]/history` | Historial de transferencias |
| POST | `/api/scenarios/steal` | Robar un escenario |
| GET | `/api/scenarios/steal/stealable` | Escenarios robables |
| GET | `/api/scenarios/steal/stats` | Estadisticas de robos |
| GET | `/api/scenarios/steal/leaderboard` | Top ladrones |
| POST | `/api/scenarios/shield` | Comprar proteccion |
| GET | `/api/scenarios/auto-feature` | Auto-destacar (Cron job) |

#### Gamificacion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/gamification/profile` | XP, nivel, titulos |
| GET | `/api/gamification/achievements` | Logros desbloqueados |
| GET | `/api/gamification/missions` | Misiones activas |

#### Tienda e Inventario
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/tienda/items` | Listado de items |
| POST | `/api/tienda/purchase` | Comprar items |
| GET | `/api/tienda/inventory` | Inventario del usuario |
| POST | `/api/collectibles/equip` | Equipar cosmeticos |

#### Social y Comunicacion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/chat/conversations` | Crear/obtener conversaciones |
| GET/POST | `/api/notifications/*` | Gestion de notificaciones |
| POST | `/api/stories/*` | Historias |
| POST | `/api/streaming/*` | Transmisiones en vivo |
| GET/POST | `/api/reels/*` | Video reels |

#### Administracion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/admin/users` | Gestion de usuarios |
| GET | `/api/admin/scenarios` | Moderacion de escenarios |
| GET | `/api/admin/reports` | Gestion de reportes |
| GET | `/api/admin/stats` | Analiticas de plataforma |
| POST | `/api/admin/newsletter` | Gestion de newsletter |

---

## 4. MODELO DE BASE DE DATOS (Prisma)

### Tablas Principales

#### User (Usuarios)
```
- id, email, username, displayName
- apCoins (moneda virtual)
- level, experience, reputation
- totalPredictions, correctPredictions, totalEarnings
- role (USER, MODERATOR, ADMIN, SUPER_ADMIN)
- Relaciones: accounts, sessions, scenarios, holdings, transactions, notifications
```

#### Scenario (Escenarios/Predicciones)
```
- id, title, description, category
- status (ACTIVE, COMPLETED, FAILED, CANCELLED, PENDING_RESOLUTION)
- initialPrice, currentPrice, priceMultiplier
- deadline, resolvedAt, outcome (true/false/null)
- votesUp, votesDown
- contentHash (deteccion de duplicados)
- Relaciones: creator, holdings, transactions, comments, votes
```

#### ScenarioHolding (Posesion de Escenarios)
```
- id, userId, scenarioId
- purchasePrice, purchasedAt, soldAt, soldPrice
- isCurrentHolder (flag booleano)
```

#### Transaction (Transacciones)
```
- Tipos: PURCHASE, SALE, STEAL, WIN, LOSS, REWARD, PURCHASE_COINS,
         DAILY_BONUS, ACHIEVEMENT, REFERRAL
- amount, description, createdAt
```

#### Notification (Notificaciones)
```
- Tipos: SCENARIO_STOLEN, SCENARIO_WON, SCENARIO_LOST, NEW_FOLLOWER,
         COMMENT_REPLY, ACHIEVEMENT_UNLOCKED, LEVEL_UP, DAILY_REWARD,
         SYSTEM_ANNOUNCEMENT
- title, message, data (JSON), isRead
```

#### Achievement y UserAchievement (Logros)
```
- name, description, icon, points, rarity
- requirements (JSON), rewards (JSON)
```

#### ShopItem e InventoryItem (Tienda)
```
- Tipos: PROTECTION, POWER, BOOST, COSMETIC, SPECIAL
- price, stock, maxPerUser, effect (JSON)
```

### Otras Tablas
- **Vote** - Votos positivos/negativos en escenarios
- **Follow** - Grafo social de seguidores
- **ForumPost y Comment** - Foro de discusion
- **Account, Session, VerificationToken** - Requisitos de NextAuth
- **PasswordResetToken** - Recuperacion de contrasena

---

## 5. SISTEMA DE AUTENTICACION Y AUTORIZACION

### Proveedores de Autenticacion
1. **Google OAuth 2.0** - Login con cuenta de Google
2. **Discord OAuth 2.0** - Login con cuenta de Discord
3. **Credenciales (Email/Password)** - Autenticacion tradicional con Supabase Auth

### Gestion de Sesiones
- **Estrategia**: JWT (JSON Web Tokens)
- **TTL de Tokens LiveKit**: 6 horas
- **Auto-sincronizacion de Roles**: En cada request, el token se actualiza con el rol actual de la BD

### Sistema de Roles
| Rol | Descripcion | Privilegios Especiales |
|-----|-------------|------------------------|
| `USER` | Jugador estandar | Funcionalidades basicas |
| `STAFF` | Personal de plataforma | Compras gratis en tienda |
| `MODERATOR` | Moderacion de contenido | Compras gratis en tienda |
| `ADMIN` | Administrador | Panel de admin |
| `SUPER_ADMIN` | Control total | Todos los privilegios |

---

## 6. FUNCIONALIDADES EN TIEMPO REAL

### Streaming WebRTC (LiveKit)
**Archivo**: `/src/lib/livekit.ts`

**Caracteristicas**:
- Transmision de video y audio en vivo
- Compartir pantalla (screen sharing)
- Chat en tiempo real via data tracks
- Gestion de participantes
- Capacidad de grabacion
- Tokens con TTL de 6 horas

**Permisos**:
- **Hosts**: Pueden publicar video, audio, compartir pantalla
- **Viewers**: Pueden suscribirse y enviar mensajes de chat

### Base de Datos en Tiempo Real (Supabase Realtime)
- Usa PostgreSQL LISTEN/NOTIFY
- Actualizaciones automaticas para:
  - Robos de escenarios
  - Nuevas notificaciones
  - Mensajes de chat
  - Conteo de participantes en vivo
  - Indicadores de escritura

### Notificaciones Push
**Servicios Integrados**:
1. **OneSignal** - Servicio principal de push notifications
2. **Web Push API** - Notificaciones nativas del navegador

**Tipos de Notificaciones**:
- Escenario robado
- Prediccion ganada/perdida
- Logro desbloqueado
- Subida de nivel
- Nuevo seguidor
- Bonus diario
- Anuncios del sistema

---

## 7. SISTEMA DE ECONOMIA Y PAGOS

### Moneda Virtual: AP Coins (Apocaliptyx Points)
- **Balance Inicial**: 1,000 AP Coins al registrarse

### Tipos de Transacciones
| Tipo | Descripcion |
|------|-------------|
| `PURCHASE` | Comprar escenarios |
| `SALE` | Vender escenarios |
| `STEAL` | Robar un escenario |
| `WIN` | Ganar una prediccion |
| `LOSS` | Perder una prediccion |
| `REWARD` | Recompensas del sistema |
| `PURCHASE_COINS` | Dinero real a AP Coins (futuro) |
| `DAILY_BONUS` | Recompensas de login diario |
| `ACHIEVEMENT` | Recompensas por logros |
| `REFERRAL` | Bonos de referidos |

### Sistema de Tienda
**Archivo**: `/src/services/shop.service.ts`

**Tipos de Items**:
- `PROTECTION` - Escudos de proteccion
- `POWER` - Potenciadores
- `BOOST` - Mejoras temporales
- `COSMETIC` - Cosmeticos visuales
- `SPECIAL` - Items especiales

**Caracteristicas**:
- Gestion de stock global
- Limites de compra por usuario
- Sistema de descuentos
- Rareza de items (Common, Rare, Epic, Legendary)

### Sistema de Trading de Coleccionables
**Archivo**: `/src/services/collectibles.service.ts`

**Tipos de Coleccionables**:
- Marcos de perfil (Frames)
- Efectos de animacion
- Fondos de perfil
- Estilos de badges
- Packs de emojis
- Temas

**Caracteristicas del Trading**:
- Enviar/recibir ofertas de intercambio
- Flujo de aceptacion/rechazo
- Intercambio de AP Coins en trades
- Numeros de serie para items limitados
- Niveles de rareza: Common, Rare, Epic, Legendary, Mythic, Exclusive

---

## 8. MECANICAS DE JUEGO (CORE FEATURES)

### Sistema de Escenarios (Feature Principal)

**Flujo del Sistema**:
1. **Crear**: Usuario crea un escenario con titulo, descripcion, fecha limite, categoria
2. **Dinamica de Precios**: Empieza con precio inicial (ej: 11 AP Coins)
3. **Deteccion de Duplicados**: Sistema verifica escenarios similares
4. **Comprar/Mantener**: Otros usuarios compran el escenario (precio aumenta)
5. **Transferencia**: Al ser robado, la propiedad cambia + precio aumenta
6. **Resolucion**: Creador resuelve resultado (SI/NO) o auto-resolucion
7. **Pago**: Ganadores reciben AP Coins del pool

**Categorias Disponibles**:
- TECNOLOGIA, POLITICA, DEPORTES, FARANDULA
- GUERRA, ECONOMIA, SALUD, CIENCIA
- ENTRETENIMIENTO, OTROS

**Estados de Escenarios**:
- `ACTIVE` - En curso
- `COMPLETED` - Resuelto como verdadero
- `FAILED` - Resuelto como falso
- `CANCELLED` - Eliminado
- `PENDING_RESOLUTION` - Esperando resultado

### Mecanica de Robo de Escenarios (Innovador)
**Archivo**: `/src/services/scenarioStealing.service.ts`

**Mecanicas**:
1. **Precio de Robo**: Aumenta despues de cada robo (basado en multiplicador)
2. **Pool de Robos**: Monedas acumuladas de todos los robos
3. **Escudos de Proteccion**:
   - **Escudo Basico** (6 horas, 15 AP Coins)
   - **Escudo Premium** (24 horas, 40 AP Coins)
   - **Escudo Ultimate** (72 horas, 100 AP Coins)
4. **Historial de Robos**: Rastrea todos los robos con info del usuario
5. **Leaderboard**: Top ladrones (mas robos)
6. **Notificacion**: La victima recibe notificacion cuando roban su escenario

**Reglas Especiales**:
- No puedes robar tus propios escenarios
- No puedes robar escenarios protegidos
- El precio de robo crece exponencialmente

### Sistema de Gamificacion
**Archivo**: `/src/services/gamification.service.ts`

#### Sistema de Niveles
- Nivel base: 1
- Acumulacion de XP
- Hitos de nivel con recompensas

#### Titulos/Rangos (Tematica de Profecia)
| Titulo | Rango de Puntuacion |
|--------|---------------------|
| Mony Vidente | 0 - 999 |
| Oraculo en Entrenamiento | 1,000 - 4,999 |
| Vidente Legendario | 5,000 - 14,999 |
| Nostradamus Supremo | 15,000+ |

#### Sistema de Rachas (Streaks)
- Racha de login
- Racha de predicciones
- Racha de predicciones correctas
- Seguimiento de racha mas larga

#### Logros (Achievements)
- **Categorias**: predicciones, robos, social, coleccion
- **Niveles de rareza**: common, rare, epic, legendary, mythic
- **Logros secretos**
- **Seguimiento de progreso**
- **Recompensas en puntos**

#### Misiones/Quests
| Tipo | Descripcion |
|------|-------------|
| `daily` | Diarias |
| `weekly` | Semanales |
| `monthly` | Mensuales |
| `special` | Especiales |
| `seasonal` | De temporada |

- **Categorias**: predictions, stealing, social, collecting
- **Dificultades**: easy, medium, hard, extreme
- **Recompensas**: AP Coins + XP

### Sistema de Votacion
- Votos positivos/negativos en escenarios
- Un voto por usuario por escenario
- Conteo de votos visible

### Deteccion de Duplicados
**Archivo**: `/src/services/duplicateDetection.service.ts`

**Algoritmos Utilizados**:
1. **Content Hash** - Comparacion de hash simple
2. **Similitud Jaccard** - Similitud basada en conjuntos (70% peso en titulo)
3. **Distancia Levenshtein** - Similitud por distancia de edicion (30% peso en descripcion)
4. **Puntuacion Combinada** - Promedio ponderado

**Umbral**: > 50% similitud marcado como duplicado
**Sugerencias**: Top 5 escenarios similares mostrados al usuario

---

## 9. FUNCIONALIDADES SOCIALES

### Grafo Social
**Archivo**: `/src/services/publicProfile.service.ts`

**Caracteristicas**:
1. **Sistema de Seguidores/Siguiendo**
   - Relaciones one-to-many
   - Acciones de seguir/dejar de seguir
   - Notificaciones de nuevos seguidores

2. **Perfiles de Usuario**
   - Perfiles publicos con estadisticas
   - Perfiles privados (configuracion)
   - Bio, avatar, banner
   - Badges de verificacion

3. **Estadisticas Mostradas**
   - Total de predicciones creadas
   - Predicciones correctas
   - Tasa de acierto
   - Ganancias totales
   - Racha actual

### Foro y Discusion
**Archivo**: `/src/services/forum.service.ts`

**Caracteristicas**:
- Crear posts con enlaces opcionales a escenarios
- Comentarios en posts
- Respuestas anidadas a comentarios
- Likes en posts y comentarios
- Tags: Prediccion, Debate, Analisis, Noticia, Estrategia, Humor
- Menciones a otros usuarios
- Busqueda full-text

### Sistema de Historias (Stories)
**Similar a Instagram Stories**

**Caracteristicas**:
- Posts de texto + emoji
- Subida de imagenes/videos
- Colores de fondo y fuentes
- Expiracion en 24 horas
- Seguimiento de vistas
- Reacciones/emojis
- Highlights permanentes
- Compartir enlaces

### Comunidades
**Archivo**: `/src/services/community.service.ts`

**Caracteristicas**:
- Publicas/Privadas (control de acceso)
- Roles: Member, Moderator, Admin, Owner
- Eventos: Torneos, AMA, Concursos de prediccion
- Reglas de comunidad
- Organizacion por categorias
- Badges de comunidad verificada

### Chat en Tiempo Real
**Archivo**: `/src/services/chat.service.ts`

**Caracteristicas**:
- Mensajeria directa (1-on-1)
- Chats grupales con controles del creador
- Codigos de invitacion para grupos
- Etiquetas de conversacion
- Silenciar/favoritos/archivar
- Indicadores de escritura
- Vista previa del ultimo mensaje
- Estado online
- Confirmacion de lectura (opcional)

### Sistema de Notificaciones
**Archivo**: `/src/services/notifications.service.ts`

**Tipos de Notificaciones**:
- Eventos de escenarios (robado, ganado, perdido)
- Eventos sociales (nuevo seguidor, respuestas)
- Gamificacion (logros, subida de nivel)
- Anuncios del sistema

**Canales de Entrega**:
- Notificaciones in-app (almacenadas en BD)
- Push notifications (OneSignal)
- Notificaciones por email (Resend)
- Web push (basadas en navegador)

---

## 10. GESTION DE MEDIOS

### Cloudinary - Imagenes y Videos
**Archivo**: `/src/services/cloudinary.service.ts`

**Metodos de Subida**:
- Buffer upload (para archivos grandes)
- URL upload (para fuentes remotas)
- Stream upload (para eficiencia)

**Tipos de Media**:
1. **Video Reels**
   - Carpeta: `apocaliptyx/reels`
   - Generacion automatica de thumbnails
   - Tracking de duracion
   - Captura de dimensiones
   - Streaming adaptativo (HLS/MP4)

2. **Imagenes**
   - Imagenes de avatar
   - Imagenes de escenarios
   - Imagenes de historias
   - Banners de comunidades

3. **Audio**
   - Posts de audio
   - Audio de streams
   - Mensajes de voz (futuro)

**Transformaciones**:
- Generacion de thumbnails en offset `0s`
- Redimensionamiento responsive (720x1280 para movil)
- Optimizacion de calidad (auto)
- Conversion de formato (mp4, jpg)

### Generacion de Avatares
- **DiceBear API** - Avatares por defecto si no se proporciona uno
- URL: `api.dicebear.com`

### Configuracion de Tamano Maximo
- **Limite de subida**: 100MB (configurado en Next.js)

---

## 11. INTEGRACIONES DE TERCEROS

### Lista Completa de Integraciones

| Servicio | Proposito | Tipo |
|----------|-----------|------|
| **Google OAuth** | Autenticacion | Auth Provider |
| **Discord OAuth** | Autenticacion | Auth Provider |
| **Supabase** | Base de datos + Auth | BaaS |
| **LiveKit** | Streaming WebRTC | Real-time |
| **OneSignal** | Push notifications | Notificaciones |
| **Cloudinary** | CDN de medios | Media |
| **Resend** | Emails transaccionales | Email |
| **Vercel** | Hosting + Crons | Deployment |

---

## 12. DESPLIEGUE E INFRAESTRUCTURA

### Plataforma de Hosting: Vercel

**Configuracion**: `/vercel.json`

**Caracteristicas de Vercel**:
- Auto-deployment en git push
- HTTPS automatico
- CDN global
- Funciones serverless
- Edge functions (via middleware)

### Cron Jobs Programados
```json
{
  "crons": [
    {
      "path": "/api/scenarios/auto-feature",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Job Auto-Feature**: Marca escenarios como hot/featured basado en:
- Minimo de robos: 3 (hot), 5 (featured)
- Minimo de participantes: 5 (hot), 10 (featured)
- Minimo de pool: 100 AP (hot), 500 AP (featured)
- Edad maxima: 7 dias (solo hot)

### Variables de Entorno Requeridas

**Esenciales**:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

**Opcionales**:
```
NEXT_PUBLIC_LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
NEXT_PUBLIC_ONESIGNAL_APP_ID
NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

### Configuracion de Next.js
**Archivo**: `/next.config.js`

```javascript
{
  images: {
    domains: ['api.dicebear.com', 'res.cloudinary.com'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '100mb' }
  }
}
```

### Sistema de Estilos (Tailwind)
**Archivo**: `/tailwind.config.ts`

**Colores del Tema Apocaliptyx**:
- Colores estandar (primary, secondary, accent)
- Colores tematicos (dark, blood, fire, gold, ash, smoke)
- Sistema de variables CSS para temas dinamicos
- Soporte de modo oscuro (class-based)

---

## 13. FUNCIONALIDADES INNOVADORAS Y UNICAS

### 1. Mecanica de Robo de Escenarios
Una caracteristica unica en juegos de prediccion donde los usuarios pueden literalmente "robar" predicciones de otros, aumentando la apuesta y creando jugabilidad competitiva. El precio de robo aumenta exponencialmente y las victimas reciben notificaciones.

### 2. Sistema de Multiplicador de Precio Dinamico
Los escenarios empiezan con un precio base y aumentan con cada transferencia/robo, creando una economia auto-balanceada. Los escenarios populares se vuelven mas caros, desalentando el acaparamiento.

### 3. Deteccion de Duplicados por Contenido
Usa algoritmos inteligentes (similitud Jaccard, distancia Levenshtein) para prevenir duplicacion de escenarios con umbrales de > 50% de similitud. Sugiere escenarios similares existentes.

### 4. Sistema de Escudos de Proteccion
Los usuarios pueden proteger sus escenarios del robo por 6/24/72 horas usando AP Coins. Crea toma de decisiones estrategicas.

### 5. Streaming en Tiempo Real Integrado
Streaming WebRTC integrado que permite a los usuarios transmitir discusiones de predicciones, AMAs y torneos.

### 6. Sistema de Historias (tipo Instagram)
Contenido efimero de 24 horas con fondos, efectos de texto, compartir enlaces y seguimiento de vistas. Las historias pueden guardarse como "highlights".

### 7. Sistema de Gamificacion Tematica
- Sistema de niveles multi-tier (4 niveles profeticos)
- Logros con rarezas (common a mythic)
- Misiones diarias/semanales/mensuales/estacionales
- Rachas de login y predicciones
- Titulos y badges

### 8. Foro con Escenarios Vinculados
Los posts de discusion pueden vincularse a escenarios especificos, creando conversaciones con contexto.

### 9. Chat en Tiempo Real con Grupos
Sistema de chat completo tipo WhatsApp con mensajeria 1-on-1, chats grupales, indicadores de escritura, fijacion de mensajes y controles de privacidad.

### 10. Sistema de Trading de Coleccionables
Los jugadores pueden intercambiar cosmeticos del juego con numeros de serie para items limitados, niveles de rareza, intercambio de AP Coins y flujo de propuestas de trade.

---

## 14. ARCHIVOS DE SERVICIOS CLAVE

| Servicio | Proposito | Ubicacion |
|----------|-----------|-----------|
| Scenario Stealing | Mecanica de robo | `/src/services/scenarioStealing.service.ts` |
| Gamification | Niveles, logros, misiones | `/src/services/gamification.service.ts` |
| Shop | Items de tienda, compras | `/src/services/shop.service.ts` |
| Chat | Mensajeria, conversaciones | `/src/services/chat.service.ts` |
| Forum | Posts, comentarios | `/src/services/forum.service.ts` |
| Community | Grupos, eventos, torneos | `/src/services/community.service.ts` |
| Collectibles | Trading cards, cosmeticos | `/src/services/collectibles.service.ts` |
| Notifications | Alertas, notificaciones | `/src/services/notifications.service.ts` |
| Content | Reels, streams, audio | `/src/services/content.service.ts` |
| Admin | Analiticas de plataforma | `/src/services/admin.service.ts` |
| Profile | Perfiles de usuario | `/src/services/profile.service.ts` |
| Duplicate Detection | Anti-spam, verificacion | `/src/services/duplicateDetection.service.ts` |
| Cloudinary | Subidas de media | `/src/services/cloudinary.service.ts` |
| Push Notifications | Push del navegador | `/src/services/pushNotifications.service.ts` |

---

## 15. ESTADISTICAS DEL PROYECTO

| Metrica | Valor |
|---------|-------|
| Total de Paginas/Rutas | 40+ |
| Endpoints de API | 50+ |
| Tablas de Base de Datos | 20+ |
| Servicios | 15+ |
| Componentes | 100+ |
| Hooks Personalizados | 6 |
| Zustand Stores | 5+ |
| Responsive Movil | Si (Tailwind-based) |
| Soporte Modo Oscuro | Si (Tailwind class-based) |
| Soporte PWA | Si (manifest + service worker) |
| Internacionalizacion | Preparado (estructura i18n) |

---

## 16. CARACTERISTICAS DE SEGURIDAD

### Autenticacion
- NextAuth.js con sesiones JWT
- Hash de contrasenas con bcryptjs
- Integracion con Supabase Auth
- Multiples proveedores OAuth

### Autorizacion
- Control de acceso basado en roles (RBAC)
- Rutas de API protegidas
- Middleware a nivel de ruta

### Seguridad de Base de Datos
- Supabase RLS (Row Level Security)
- Prevencion de SQL injection via Prisma ORM
- Service role key para operaciones admin

### Proteccion de Datos
- Variables de entorno para secretos
- Encriptacion en reposo de Supabase
- HTTPS forzado
- Soporte para rotacion de API keys

### Validacion de Input
- Verificacion de tipos TypeScript
- Validacion de parametros en endpoints API
- Deteccion de duplicados previene spam

---

## RESUMEN FINAL

**Apocaliptyx** es una plataforma de predicciones social gamificada que combina:

- **Tecnologia moderna**: Next.js 14, TypeScript, Tailwind CSS
- **Backend robusto**: PostgreSQL, Prisma, Supabase
- **Tiempo real**: LiveKit WebRTC, Supabase Realtime, WebSockets
- **Economia virtual**: Sistema de AP Coins con trading y tienda
- **Gamificacion profunda**: Niveles, logros, misiones, rachas
- **Social completo**: Seguidores, chat, foro, comunidades, historias
- **Mecanicas unicas**: Robo de escenarios, escudos de proteccion, multiplicadores dinamicos
- **Media rich**: Cloudinary para videos/imagenes, streaming en vivo
- **Seguridad**: RBAC, JWT, encriptacion, validacion

La plataforma esta disenada para escalar y proporcionar una experiencia de usuario fluida en dispositivos moviles y desktop, con soporte PWA para uso offline.
