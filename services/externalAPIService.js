const axios = require('axios');
const emailConfig = require('../config/emailConfig');

class ExternalAPIService {

  async getEmails() {
    let emails;
  
    if (emailConfig.apiURL) {
      try {
        const apiUrlData = JSON.parse(emailConfig.apiURL);
        if (Array.isArray(apiUrlData)) {
          // Si es un array, simplemente asigna los correos electrónicos
          emails = apiUrlData;
        } else if (apiUrlData && apiUrlData.data && Array.isArray(apiUrlData.data)) {
          // Si es un objeto y tiene una propiedad 'data' que es un array, extrae los correos electrónicos
          emails = apiUrlData.data.reduce((acc, item) => {
            if (item.correos && Array.isArray(item.correos)) {
              acc.push(item.correos);
            }
            return acc;
          }, []);
        }
      } catch (error) {
        throw new Error('Error al analizar EXTERNAL_API_URL');
      }
    } else {
      throw new Error('No se encontró EXTERNAL_API_URL');
    }
  
    if (!emails || emails.length === 0) {
      throw new Error('No se encontraron correos electrónicos válidos en EXTERNAL_API_URL');
    }
  
    return emails;
  }
  
  
}

module.exports = ExternalAPIService;