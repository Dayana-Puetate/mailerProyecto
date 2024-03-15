class Email {
  constructor(recipients, subject, text, html, attachments) {
    this.recipients = recipients;
    this.subject = subject;
    this.text = text;
    this.html = html;
    this.attachments = attachments || [];
  }
}

module.exports = Email;
