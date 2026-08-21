import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConfirmationEmail = async (email: string, name: string, token: string) => {
  const confirmationLink = `https://website-da-rede.vercel.app/confirm-account?confirm=${token}&continueParam=yes`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirme a sua conta</title>
</head>
<body style="margin:0; padding:0; background-color:#111111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111; padding:48px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:20px; font-weight:700; letter-spacing:2px; color:#ffffff; text-transform:uppercase;">Rede</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#1d1d1b; border-radius:12px; padding:48px 40px;">

              <!-- Badge de estado -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:rgba(230,51,42,0.12); border-radius:20px; padding:6px 14px;">
                    <span style="color:#e6332a; font-size:12px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">Confirmação pendente</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; font-weight:700; color:#ffffff;">
                Olá, ${name}
              </h1>

              <p style="margin:0 0 32px; font-size:15px; line-height:1.7; color:#c4c4c5;">
                A sua conta foi criada com sucesso. Para ativar o acesso e garantir a segurança do seu perfil, confirme o seu endereço de email clicando no botão abaixo.
              </p>

              <!-- Botão -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${confirmationLink}" target="_blank"
                      style="background-color:#e6332a; color:#ffffff; text-decoration:none; padding:16px 40px; font-weight:600; font-size:15px; border-radius:8px; display:inline-block;">
                      Confirmar a minha conta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Aviso -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111; border-radius:8px;">
                <tr>
                  <td style="padding:16px 18px; border-left:3px solid #e6332a;">
                    <p style="margin:0; font-size:13px; line-height:1.6; color:#818284;">
                      <strong style="color:#e6332a;">Atenção:</strong> este link expira dentro de 24 horas. Se não reconhece este registo, pode ignorar este email com segurança.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px; padding-top:24px; border-top:1px solid #2e2e2c;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px; font-size:12px; color:#818284;">
                      Se o botão não funcionar, copie e cole este link no navegador:
                    </p>
                    <p style="margin:0; font-size:12px; word-break:break-all;">
                      <a href="${confirmationLink}" style="color:#e6332a; text-decoration:none;">${confirmationLink}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0; font-size:12px; color:#818284;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_DOMAIN!,
    to: [email],
    subject: "Confirme a sua conta",
    html: htmlContent,
  });

  if (error) {
    console.error(`[Resend] Falha ao enviar email de confirmação para ${email}:`, error);
    throw error;
  }

  console.log(`E-mail de confirmação enviado para ${email} (id: ${data?.id})`);
};