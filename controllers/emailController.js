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
    let attachments = [];
    let validEmails = [];
    let invalidEmails = [];

    // Subir archivos adjuntos al servidor
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error al subir archivos adjuntos:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }

      const { subject, text, html } = req.body;

      // Verificar si se subieron archivos
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => {
          return {
            filename: file.filename,
            path: file.path,
            size: file.size
          };
        });
      }

      // Verificar el tamaño de cada archivo adjunto
      const invalidAttachments = attachments.filter(attachment => attachment.size > max_file_size_MB * 1024 * 1024);
      if (invalidAttachments.length > 0) {
        const invalidFileNames = invalidAttachments.map(attachment => attachment.filename);
        return res.status(400).json({ error: `Los siguientes archivos exceden el tamaño máximo de ${max_file_size_MB} MB: ${invalidFileNames.join(', ')}` });
      }

      const recipients = await externalAPIService.getEmails();
      console.log(recipients);

      let subGroupPromises = [];

      for (const subGroup of recipients) {
        const validSubGroup = [];
        const invalidSubGroup = [];

        for (const recipient of subGroup) {
          if (emailValidationService.validateEmailFormat(recipient)) {
            validSubGroup.push(recipient);
          } else {
            invalidSubGroup.push(recipient);
          }
        }

        const uniqueEmails = [...new Set(validSubGroup)];
        console.log(uniqueEmails);

        validEmails.push(uniqueEmails);
        invalidEmails.push(invalidSubGroup);

        if (uniqueEmails.length > 0) {
          const email = { recipients: [uniqueEmails], subject, text, html, attachments };
          subGroupPromises.push(emailService.sendEmail(email));
        }
      }

      // Enviar correos electrónicos por subgrupo de manera simultánea
      await Promise.all(subGroupPromises);

      // for (let i = 0; i < validEmails.length; i++) {
      //   if (validEmails[i].length > 0) {
      //     console.log(`Subgrupo ${i + 1} enviado correctamente.`);
      //   }
      // }

      // if (invalidEmails.length > 0) {
      //   return res.status(400).json({ error: `Emails inválidos: ${invalidEmails.join(', ')}` });
      // }

      res.status(200).json({ message: 'Envío exitoso.', validEmails, invalidEmails });
    });
    emailService.deleteAttachments(attachments);
  } catch (error) {
    handleServerError(res, error);
  }
}




module.exports = { sendEmail };