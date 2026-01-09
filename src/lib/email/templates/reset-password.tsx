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
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 16px 32px; border-radius: 16px;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">
          APOCALIPTICS
        </h1>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(180deg, #18181b 0%, #09090b 100%); border-radius: 24px; padding: 40px 32px; border: 1px solid #27272a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

      <!-- Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%); padding: 20px; border-radius: 20px;">
          <span style="font-size: 48px;">🔐</span>
        </div>
      </div>

      <!-- Title -->
      <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; text-align: center; font-weight: 800;">
        Recuperar Contraseña
      </h2>

      <p style="color: #a1a1aa; font-size: 16px; text-align: center; margin: 0 0 32px 0;">
        Solicitud de restablecimiento de contraseña
      </p>

      <!-- Divider -->
      <div style="height: 1px; background: linear-gradient(90deg, transparent, #3f3f46, transparent); margin: 0 0 32px 0;"></div>

      <!-- Content -->
      <p style="color: #e4e4e7; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Hola <strong style="color: #a855f7;">${username}</strong>,
      </p>

      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Apocaliptics. Haz clic en el boton de abajo para crear una nueva contraseña:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetLink}"
           style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 40px -10px rgba(147, 51, 234, 0.5);">
          ✨ Restablecer Contraseña
        </a>
      </div>

      <!-- Info Box -->
      <div style="background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #c084fc; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
          ⏰ Este enlace expirara en <strong>1 hora</strong>
        </p>
      </div>

      <!-- Security Note -->
      <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
        Si no solicitaste este cambio, puedes ignorar este correo.<br>
        Tu contraseña no sera modificada.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #52525b; font-size: 12px; margin: 0 0 8px 0;">
        © 2025 Apocaliptics. Todos los derechos reservados.
      </p>
      <p style="color: #3f3f46; font-size: 11px; margin: 0;">
        Este correo fue enviado desde noreply@apocaliptyx.com
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
APOCALIPTICS - Recuperar Contraseña

Hola ${username},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Apocaliptics.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

⏰ Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.

---
© 2025 Apocaliptics. Todos los derechos reservados.
  `.trim();
}
