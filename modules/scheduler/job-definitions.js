const mailer = require('../../modules/email/mailer');


const jobDefinitions = (agenda) => {
    agenda.define("send email", async(job, done) => {

        const {toAddress, subject, emailTemplate, emailTemplateData} = job.attrs.data;

        await mailer
            .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
            .then(info => {
                console.log('Email sent: %s', info.messageId);                
            })
            .catch(err => {
                console.error('Job Error: Send Email');
                console.log(err);
            });

        done();
    });
};

module.exports = { jobDefinitions }