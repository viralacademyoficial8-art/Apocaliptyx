// src/lib/email/templates/prediction-won.tsx

export function getPredictionWonEmailHtml({
  username,
  scenarioTitle,
  prediction,
  amountWon,
  totalBalance,
}: {
  username: string;
  scenarioTitle: string;
  prediction: 'YES' | 'NO';
  amountWon: number;
  totalBalance: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Ganaste! - Apocaliptyx</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ef4444; font-size: 32px; margin: 0;">
        🔮 APOCALIPTYX
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border-radius: 16px; padding: 32px; border: 1px solid #374151;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 64px;">🎉</span>
      </div>
      
      <h2 style="color: #22c55e; font-size: 28px; margin: 0 0 16px 0; text-align: center;">
        ¡FELICIDADES, ${username}!
      </h2>
      
      <p style="color: #d1d5db; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        Tu predicción fue correcta 🎯
      </p>
      
      <!-- Scenario Box -->
      <div style="background: #262626; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">ESCENARIO</p>
        <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">
          ${scenarioTitle}
        </p>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          Tu predicción: <span style="color: ${prediction === 'YES' ? '#22c55e' : '#ef4444'}; font-weight: bold;">${prediction === 'YES' ? 'SÍ' : 'NO'}</span>
        </p>
      </div>
      
      <!-- Winnings Box -->
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="color: #dcfce7; font-size: 14px; margin: 0 0 8px 0;">💰 GANASTE</p>
        <p style="color: #ffffff; font-size: 42px; font-weight: bold; margin: 0;">
          +${amountWon.toLocaleString()} AP
        </p>
      </div>
      
      <!-- Balance -->
      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
        Tu balance actual: <strong style="color: #fbbf24;">${totalBalance.toLocaleString()} AP Coins</strong>
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://apocaliptyx.vercel.app/explorar" 
           style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Seguir Prediciendo →
        </a>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        © 2024 Apocaliptyx. Todos los derechos reservados.
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
}

export function getPredictionWonEmailText({
  username,
  scenarioTitle,
  prediction,
  amountWon,
  totalBalance,
}: {
  username: string;
  scenarioTitle: string;
  prediction: 'YES' | 'NO';
  amountWon: number;
  totalBalance: number;
}) {
  return `
¡FELICIDADES, ${username}! 🎉

Tu predicción fue correcta.

Escenario: ${scenarioTitle}
Tu predicción: ${prediction === 'YES' ? 'SÍ' : 'NO'}

💰 GANASTE: +${amountWon.toLocaleString()} AP Coins

Tu balance actual: ${totalBalance.toLocaleString()} AP Coins

Sigue prediciendo en: https://apocaliptyx.vercel.app/explorar

© 2024 Apocaliptyx
  `.trim();
}