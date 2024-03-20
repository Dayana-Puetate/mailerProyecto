class EmailValidationService {
  constructor() {
    this.sensitiveWords = ['contraseña', 'inicio de sesión', 'rápido'];
  }

  containsSensitiveWords(body) {
    const lowercaseBody = body.toLowerCase();
    for (const word of this.sensitiveWords) {
      if (lowercaseBody.includes(word)) {
        return true;
      }
    }
    return false;
  }

  validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validateEmail(email) {
    const { recipients, subject, text, html } = email;
    if (!this.validateEmailFormat(recipients)) {
      return false; //formatoinvalido
    }
    if (this.containsSensitiveWords(subject) || this.containsSensitiveWords(text) || this.containsSensitiveWords(html)) {
      return false; // El correo contiene palabras sensibles
    }
    return true; // El correo es válido
  }
}

module.exports = EmailValidationService;