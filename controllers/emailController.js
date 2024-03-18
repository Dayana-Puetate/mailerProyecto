/**
 * @swagger
 * /emails/send:
 *   post:
 *     summary: Envía un correo electrónico
 *     description: Permite enviar un correo electrónico con un asunto, texto, HTML y archivos adjuntos.
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 description: El asunto del correo electrónico
 *               text:
 *                 type: string
 *                 description: El texto del correo electrónico
 *               html:
 *                 type: string
 *                 description: El contenido HTML del correo electrónico
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Los archivos adjuntos del correo electrónico (opcional)
 *     responses:
 *       '200':
 *         description: Correo electrónico enviado exitosamente
 *       '400':
 *         description: Error al enviar el correo electrónico
 */


const EmailService = require('../services/emailService');
const emailService = new EmailService();
const EmailValidationService = require('../services/emailValidationService');
const emailValidationService = new EmailValidationService();
const ExternalAPIService = require('../services/externalAPIService');
const externalAPIService = new ExternalAPIService();
const { handleServerError } = require('../utils/errorHandlers');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const max_file_size_MB = 25;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: max_file_size_MB * 1024 * 1024
  }
}).array('attachments');


async function sendEmail(req, res) {
  try {

    //subir archivos adjuntos al servidor
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error al subir archivos adjuntos:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }

      const { subject, text, html } = req.body;
      let attachments = [];

      //verificar si se subieron archivos
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => {
          return {
            filename: file.filename,
            path: file.path,
            size: file.size
          };
        });
      }

      //verificar el tamaño de cada archivo adjunto
      const invalidAttachments = attachments.filter(attachment => attachment.size > max_file_size_MB * 1024 * 1024);
      if (invalidAttachments.length > 0) {
        const invalidFileNames = invalidAttachments.map(attachment => attachment.filename);
        return res.status(400).json({ error: `Los siguientes archivos exceden el tamaño máximo de ${max_file_size_MB} MB: ${invalidFileNames.join(', ')}` });
      }

      // Función para verificar si el correo tiene texto o HTML
      function hasTextOrHtml(email) {
        return email.text !== undefined || email.html !== undefined;
      }

      const recipients = await externalAPIService.getEmails();
      const invalidEmails = [];

      for (const recipient of recipients) {

        // Validar formato de correo
        if (!emailValidationService.validateEmailFormat(recipient)) {
          invalidEmails.push(recipient);
          continue;
        }

        const email = { recipients: [recipient], subject, text, html, attachments };

        // Verificar si el correo electrónico tiene texto o HTML
        if (hasTextOrHtml(email)) {
          if (!emailValidationService.validateEmail(email)) {
            invalidEmails.push(recipient);
            continue;
          }
        } else {
          invalidEmails.push(recipient);
          continue;
        }

        //correo válido, continuar con el envío
        await emailService.sendEmail(email);
      }

      if (invalidEmails.length > 0) {
        return res.status(400).json({ error: `Emails inválidos: ${invalidEmails.join(', ')}` });
      }

      //Eliminar archivos adjuntos después del envío del correo electrónico
      attachments.forEach(attachment => {
        fs.unlinkSync(attachment.path);
      });

      res.status(200).json({ message: 'Envío exitoso.' });
    });
  } catch (error) {
    handleServerError(res, error);
  }
}

module.exports = { sendEmail };
