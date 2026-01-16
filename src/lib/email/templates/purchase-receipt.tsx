// src/lib/email/templates/purchase-receipt.tsx

export function getPurchaseReceiptEmailHtml({
  username,
  itemName,
  itemPrice,
  quantity,
  totalPaid,
  remainingBalance,
}: {
  username: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  totalPaid: number;
  remainingBalance: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Compra - Apocaliptyx</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ef4444; font-size: 32px; margin: 0;">
        🔮 APOCALIPTYX
      </h1>
      <p style="color: #9ca3af; margin-top: 8px;">Recibo de Compra</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border-radius: 16px; padding: 32px; border: 1px solid #374151;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🛒</span>
      </div>
      
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 24px 0; text-align: center;">
        ¡Gracias por tu compra, ${username}!
      </h2>
      
      <!-- Receipt Details -->
      <div style="background: #262626; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding: 8px 0;">Item:</td>
            <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right; font-weight: bold;">${itemName}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding: 8px 0;">Precio unitario:</td>
            <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right;">${itemPrice.toLocaleString()} AP</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding: 8px 0;">Cantidad:</td>
            <td style="color: #ffffff; font-size: 14px; padding: 8px 0; text-align: right;">${quantity}</td>
          </tr>
          <tr style="border-top: 1px solid #374151;">
            <td style="color: #ffffff; font-size: 16px; padding: 16px 0 8px 0; font-weight: bold;">TOTAL:</td>
            <td style="color: #fbbf24; font-size: 18px; padding: 16px 0 8px 0; text-align: right; font-weight: bold;">${totalPaid.toLocaleString()} AP</td>
          </tr>
        </table>
      </div>
      
      <!-- Balance -->
      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
        Balance restante: <strong style="color: #fbbf24;">${remainingBalance.toLocaleString()} AP Coins</strong>
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://apocaliptyx.vercel.app/perfil" 
           style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Ver mi Inventario →
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

export function getPurchaseReceiptEmailText({
  username,
  itemName,
  itemPrice,
  quantity,
  totalPaid,
  remainingBalance,
}: {
  username: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  totalPaid: number;
  remainingBalance: number;
}) {
  return `
RECIBO DE COMPRA - Apocaliptyx

¡Gracias por tu compra, ${username}!

Detalles:
- Item: ${itemName}
- Precio unitario: ${itemPrice.toLocaleString()} AP
- Cantidad: ${quantity}
- TOTAL: ${totalPaid.toLocaleString()} AP Coins

Balance restante: ${remainingBalance.toLocaleString()} AP Coins

Ver tu inventario: https://apocaliptyx.vercel.app/perfil

© 2024 Apocaliptyx
  `.trim();
}