
const axios = require('axios');
const emailConfig = require('../config/emailConfig');

class ExternalAPIService {
  async getEmails() {
    let emails;

    //intenta obtener los correos electrónicos de la variable de entorno
    if (emailConfig.apiURL) {
      emails = JSON.parse(emailConfig.apiURL);
    } else {
      //si no hay una URL de API externa, lanza un error
      throw new Error('No se encontraron correos electrónicos en las variables de entorno.');
    }

    //si los correos se obtuvieron correctamente, devuélvelos
    if (emails) {
      return emails;
    }

    // Si no se pudo obtener los correos electrónicos de la variable de entorno,
    //intenta obtenerlos desde la API externa
    try {
      const response = await axios.get(emailConfig.apiURL);
      return response.data.recipients;
    } catch (error) {
      //si ocurre un error al obtener los correos electrónicos desde la API externa, lanza un error
      throw new Error('Error al obtener los destinatarios de la API externa');
    }
  }
}

module.exports = ExternalAPIService;