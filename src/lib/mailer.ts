import nodemailer from 'nodemailer';

// Real transactional emails, with a friendly local-dev fallback.
//
// In production, set SMTP_HOST/PORT/USER/PASSWORD (any provider works —
// Resend, Postmark, SendGrid SMTP, a Gmail app password...) and this sends
// a real email. Without them (the default for local development) the
// content is printed to the server console instead, so flows that depend
// on email (signup verification, password reset) are testable end-to-end
// without any external account.
async function sendMail(to: string, subject: string, html: string, consoleFallbackLines: string[]): Promise<{ delivered: boolean }> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.log(`\n[Influply] SMTP no configurado — "${subject}" (solo visible en consola):`);
    console.log(`  Para: ${to}`);
    for (const line of consoleFallbackLines) console.log(`  ${line}`);
    console.log('');
    return { delivered: false };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });

  await transporter.sendMail({
    from: SMTP_FROM || 'Influply <no-reply@influply.com>',
    to,
    subject,
    html
  });

  return { delivered: true };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendMail(
    to,
    'Recupera tu contraseña de Influply',
    `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#5a45e8;">Influply</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p><a href="${resetUrl}" style="background:#6a5af5;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;">Restablecer contraseña</a></p>
        <p>Si no has sido tú, puedes ignorar este correo. El enlace caduca en 1 hora.</p>
      </div>
    `,
    [resetUrl]
  );
}

export async function sendVerificationCodeEmail(to: string, code: string) {
  return sendMail(
    to,
    'Confirma tu email en Influply',
    `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#5a45e8;">Influply</h2>
        <p>Usa este código para confirmar tu email y terminar de crear tu cuenta:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a2e;margin:16px 0;">${code}</p>
        <p>Caduca en 15 minutos. Si no has sido tú, puedes ignorar este correo.</p>
      </div>
    `,
    [`Código de verificación: ${code}`]
  );
}
