const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(email) {
    try {
      const attachments = email.attachments || [];
      let recipients = '';

      // Verificar si email.recipients es un arreglo definido
      if (Array.isArray(email.recipients) && email.recipients.length > 0) {
        recipients = email.recipients.join(', ');
      } else {
        // Manejar el caso en el que email.recipients no sea un arreglo o esté vacío
        console.error('La lista de destinatarios es inválida.');
        return; // Salir de la función sin enviar el correo
      }

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: recipients,
        subject: email.subject,
        text: email.text,
        html: email.html,
        attachments: attachments
      });
      console.log('Correo electrónico enviado con éxito.');
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
    }
  }
}

module.exports = EmailService;
