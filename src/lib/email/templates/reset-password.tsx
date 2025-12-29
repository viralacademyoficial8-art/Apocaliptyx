// src/lib/email/templates/reset-password.tsx

export function getResetPasswordEmailHtml({
  username,
  resetLink,
}: {
  username: string;
  resetLink: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña - Apocaliptics</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ef4444; font-size: 32px; margin: 0;">
        🔮 APOCALIPTICS
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border-radius: 16px; padding: 32px; border: 1px solid #374151;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🔑</span>
      </div>
      
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
        Recuperar Contraseña
      </h2>
      
      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hola <strong>${username}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.
      </p>
      
      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Haz clic en el botón de abajo para crear una nueva contraseña:
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetLink}" 
           style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Restablecer Contraseña
        </a>
      </div>
      
      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Este enlace expirará en <strong>1 hora</strong>.
      </p>
      
      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
        Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2024 Apocaliptics. Todos los derechos reservados.
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
}

export function getResetPasswordEmailText({
  username,
  resetLink,
}: {
  username: string;
  resetLink: string;
}) {
  return `
Recuperar Contraseña - Apocaliptics

Hola ${username},

Recibimos una solicitud para restablecer tu contraseña.

Haz clic aquí para crear una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignora este correo.

© 2024 Apocaliptics
  `.trim();
}