require('dotenv').config();

const emailConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  from: process.env.EMAIL_FROM, // Dirección de correo electrónico del remitente
  apiURL: process.env.EXTERNAL_API_URL // URL de la API externa
};

module.exports = emailConfig;