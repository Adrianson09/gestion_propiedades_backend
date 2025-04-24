const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar correo:', error.response?.body || error.message);
    throw new Error('No se pudo enviar el correo');
  }
};

module.exports = sendEmail;
