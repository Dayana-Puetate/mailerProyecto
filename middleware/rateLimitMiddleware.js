//Este middleware controla el ritmo de envío de correos electrónicos para evitar 
//sobrecargar la API al enviar muchos correos electrónicos al mismo tiempo.


const rateLimit = require('express-rate-limit');

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // Límite de 100 solicitudes por ventana de tiempo
});

module.exports = rateLimitMiddleware;
