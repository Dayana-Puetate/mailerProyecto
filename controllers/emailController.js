
const EmailService = require('../services/emailService');
const emailService = new EmailService();
const EmailValidationService = require('../services/emailValidationService');
const emailValidationService = new EmailValidationService();
const ExternalAPIService = require('../services/externalAPIService');
const externalAPIService = new ExternalAPIService();
const { handleServerError } = require('../utils/errorHandlers');

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


async function sendEmail(req, res) {
  try {
    const { subject, text, html } = req.body;
    const attachments = req.files || [];

    //obtener los destinatarios de la API externa o de la variable de entorno
    const recipients = await externalAPIService.getEmails();
    const invalidEmails = [];


    for (const recipient of recipients) {
      //alidarformato
      if (!emailValidationService.validateEmailFormat(recipient)) {
        invalidEmails.push(recipient);
        continue;
      }

      const email = { recipients: [recipient], subject, text, html, attachments };

      //validar contenido
      if (!emailValidationService.validateEmail(email)) {
        invalidEmails.push(recipient);
        continue;
      }

      //El correo electrónico es válido, continuar con el envío
      await emailService.sendEmail(email);
    }

    /*if (invalidEmails.length > 0) {
      return res.status(400).json({ error: `Email Inválidos: ${invalidEmails.join(', ')}` });
    }*/


    res.status(200).json({ message: 'Envío exitoso.' });

  } catch (error) {
    handleServerError(res, error); //manejo de errores del servidor
  }
}

module.exports = { sendEmail };
