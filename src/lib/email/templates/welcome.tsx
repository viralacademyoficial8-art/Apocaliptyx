// src/lib/email/templates/welcome.tsx

export function getWelcomeEmailHtml({
  username,
  apCoins = 1000,
}: {
  username: string;
  apCoins?: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Apocaliptyx</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ef4444; font-size: 32px; margin: 0;">
        🔮 APOCALIPTYX
      </h1>
      <p style="color: #9ca3af; margin-top: 8px;">Predice el Futuro. Gana Prediciendo.</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border-radius: 16px; padding: 32px; border: 1px solid #374151;">
      
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">
        ¡Bienvenido, ${username}! 🎉
      </h2>
      
      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Tu cuenta ha sido creada exitosamente. Ahora eres parte de la comunidad de profetas más grande del mundo.
      </p>
      
      <!-- Bonus Box -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="color: #e9d5ff; font-size: 14px; margin: 0 0 8px 0;">🎁 BONO DE BIENVENIDA</p>
        <p style="color: #ffffff; font-size: 36px; font-weight: bold; margin: 0;">
          ${apCoins.toLocaleString()} AP Coins
        </p>
        <p style="color: #e9d5ff; font-size: 14px; margin: 8px 0 0 0;">¡Listos para usar!</p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://apocaliptyx.vercel.app/dashboard" 
           style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Comenzar a Predecir →
        </a>
      </div>
      
      <!-- Features -->
      <div style="border-top: 1px solid #374151; padding-top: 24px;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">¿Qué puedes hacer en Apocaliptyx?</p>
        <ul style="color: #d1d5db; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>🎯 Crear escenarios de predicción</li>
          <li>💰 Apostar AP Coins en el futuro</li>
          <li>🏆 Competir en el leaderboard</li>
          <li>🛒 Comprar items en la tienda</li>
        </ul>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2024 Apocaliptyx. Todos los derechos reservados.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
        <a href="https://apocaliptyx.vercel.app" style="color: #9ca3af;">Visitar sitio</a>
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
}

export function getWelcomeEmailText({
  username,
  apCoins = 1000,
}: {
  username: string;
  apCoins?: number;
}) {
  return `
¡Bienvenido a Apocaliptyx, ${username}! 🎉

Tu cuenta ha sido creada exitosamente.

🎁 BONO DE BIENVENIDA: ${apCoins.toLocaleString()} AP Coins

Comienza a predecir en: https://apocaliptyx.vercel.app/dashboard

¿Qué puedes hacer?
- Crear escenarios de predicción
- Apostar AP Coins en el futuro
- Competir en el leaderboard
- Comprar items en la tienda

© 2024 Apocaliptyx
  `.trim();
}