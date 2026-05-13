type PasswordResetEmailPayload = {
  to: string;
  code: string;
  name: string;
};

const buildResetEmailText = ({ code, name }: PasswordResetEmailPayload) => {
  return [
    `Hola ${name},`,
    '',
    `Tu codigo de verificacion para restablecer la contrasena de DiveMetric es ${code}.`,
    'El codigo vence en 15 minutos. Si no pediste este cambio, ignora este correo.',
    '',
    'Equipo DiveMetric',
  ].join('\n');
};

export const sendPasswordResetEmail = async (
  payload: PasswordResetEmailPayload
) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM || 'DiveMetric <no-reply@divemetric.app>';

  if (!resendApiKey) {
    console.log(
      `[password-reset] Codigo para ${payload.to}: ${payload.code}`
    );
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom,
      to: payload.to,
      subject: 'Codigo de verificacion DiveMetric',
      text: buildResetEmailText(payload),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`No se pudo enviar el correo: ${body}`);
  }
};
