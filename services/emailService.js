
const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');
const fs = require('fs');
const path = require('path');

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

        console.error('La lista de destinatarios es inválida.');
        return;
      }

      const emailText = email.text;
      const correoRemitente = `${email.text} ${emailConfig.from}`;
      //const emailText = from: ${correoRemitente}\n${email.text};

      await this.transporter.sendMail({
        from: correoRemitente,
        to: recipients,
        subject: email.subject,
        html: email.html,
        attachments: attachments
      });
      console.log('Correo electrónico enviado con éxito.');

      //eliminar archivos adjuntos después de enviar el correo electrónico
      //this.deleteAttachments(attachments);

    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
    }
  }

  //Función para eliminar archivos adjuntos
  deleteAttachments(attachments) {
    attachments.forEach(attachment => {
      const filePath = path.join(__dirname, '..', 'assets', attachment.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Archivo adjunto '${attachment.filename}' eliminado.`);
        } catch (error) {
          console.error(`Error al eliminar el archivo adjunto '${attachment.filename}':, error`);
        }
      } else {
        console.warn(`El archivo adjunto '${attachment.filename}' no existe.`);
      }
    });
  }

}

module.exports = EmailService;