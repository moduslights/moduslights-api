const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const config = require("config");

module.exports = class Email {
  constructor(user) {
    this.to = config.get("appEmail");
    this.email = user.email;
    this.phone = user.phone;
    this.firstName = user.name;
    this.message = user.message;
    this.from = config.get("appEmail");
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        host: config.get("emailHost"),
        port: config.get("emailPort"),
        auth: {
          user: config.get("appEmail"),
          pass: config.get("appEmailPassword")
        }
      });
    }

    return nodemailer.createTransport({
      host: config.get("emailHost"),
      port: config.get("emailPort"),
      auth: {
        user: config.get("appEmail"),
        pass: config.get("appEmailPassword")
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      message: this.message,
      email: this.email,
      phone: this.phone,
      pingEmail: config.get("appEmail"),
      pingPhone: config.get("pingPhone"),
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendModusligtsInfo(name) {
    await this.send("welcome", `A New Message from ${name}`);
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
