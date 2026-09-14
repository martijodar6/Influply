import nodemailer from 'nodemailer';

// Real password-reset emails, with a friendly local-dev fallback.
//
// In production, set SMTP_HOST/PORT/USER/PASSWORD (any provider works —
// Resend, Postmark, SendGrid SMTP, a Gmail app password...) and this sends
// a real email. Without them (the default for local development) the
// reset link is printed to the server console instead, so the whole
// signup -> forgot -> reset flow is testable end-to-end without any
// external account.
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.log('\n[Influply] SMTP no configurado — enlace de recuperación (solo visible en consola):');
    console.log(`  Para: ${to}`);
    console.log(`  ${resetUrl}\n`);
    return { delivered: false as const };
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
    subject: 'Recupera tu contraseña de Influply',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#5a45e8;">Influply</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p><a href="${resetUrl}" style="background:#6a5af5;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;">Restablecer contraseña</a></p>
        <p>Si no has sido tú, puedes ignorar este correo. El enlace caduca en 1 hora.</p>
      </div>
    `
  });

  return { delivered: true as const };
}
