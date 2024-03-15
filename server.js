const express = require('express')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const emailRoutes = require('./routes/emailRoute')
const ngrok = require('ngrok')

const app = express()

//middleware para analizar solicitudes con formato JSON
app.use(express.json())

//configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de correo electrónico',
      description: 'Documentación de la API de correo electrónico',
      version: '1.0.0',
    },
  },
  apis: ['./routes/emailRoute.js'], //ruta al archivo que contiene las anotaciones de Swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la aplicación
app.use('/emails', emailRoutes);
const startServer = async () => {
  const PORT = process.env.SERVER_PORT || 3002;

  app.listen(PORT, async () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);

    try {
      const url = await ngrok.connect(PORT);
      console.log(`Aplicacion disponible en ${url}`);
    } catch (error) {
      console.error('Error al iniciar servifdor.', error);
    }
  });


}

startServer();

