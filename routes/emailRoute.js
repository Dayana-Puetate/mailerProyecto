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

const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

//ruta para enviar los correos
router.post('/send', emailController.sendEmail);

module.exports = router;

