const nodemailer = require('nodemailer');
const htmlEmail = require('./htmlRenderer');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NOTIFY_EMAIL,
    pass: process.env.NOTIFY_EMAIL_PASSWORD
  }
});

function sendHtmlEmail(toAddress, subject, bodyTemplate, bodyTemplateData) {
  return new Promise(function(resolve, reject) {
    htmlEmail
      .render(bodyTemplate, bodyTemplateData)
      .then(html => {
        transporter.sendMail(
          {
            from: process.env.NOTIFY_EMAIL, // sender address
            to: toAddress, // list of receivers
            subject: subject, // Subject line
            html: html // html body
          },
          (err, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(info);
            }
          }
        );
      })
      .catch(err => {
        reject(err);
      });
  });
}

function sendEmailWithAttachment(toAddress, subject, body, attachmentBase64) {
  return new Promise(function(resolve, reject) {
    const start = attachmentBase64.indexOf('=');
    const end = attachmentBase64.indexOf(';', start);

    transporter.sendMail(
      {
        from: process.env.NOTIFY_EMAIL, // sender address
        to: toAddress, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
        attachments: [
          {
            filename: `${attachmentBase64.substring(start + 1, end)}`,
            // data uri as an attachment
            path: attachmentBase64
          }
        ]
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      }
    );
  });
}

function sendEmailWithAttachments(toAddress, subject, bodyTemplate, bodyTemplateData, attachments) {
  return new Promise(function(resolve, reject) {
    let emailAttachments = [];
    attachments.forEach(file => {
      emailAttachments.push({ path: `./uploads/${file}` });
    });

    console.dir(emailAttachments);

    htmlEmail
      .render(bodyTemplate, bodyTemplateData)
      .then(html => {
        transporter.sendMail(
          {
            from: process.env.NOTIFY_EMAIL, // sender address
            to: toAddress, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
            attachments: emailAttachments
          },
          (err, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(info);
            }
          }
        );
      }).catch(err => {
        reject(err);
      });
  });
}

module.exports = {
  sendHtmlEmail,
  sendEmailWithAttachment,
  sendEmailWithAttachments
};
