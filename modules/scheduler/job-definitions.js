const mailer = require('../../modules/email/mailer');
const client = require('twilio')(process.env.TWILIO_ACC_SID, process.env.TWILIO_AUTH_TOKEN);


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

    agenda.define("send sms", async(job, done) => {

        const {toNumbers, body} = job.attrs.data;

        for (let toNumber of toNumbers) {
            await client.messages
                .create({
                    body: body,
                    to: toNumber, // Text this number
                    from: process.env.TWILIO_PHONE_NO, // From a valid Twilio number
                })
                .then((message) => {
                    console.log(message.sid);
                })
                .catch(err => {
                    console.error('Job Error: Send SMS');
                    console.log(err);
                });
        }

        done();
    });
};

module.exports = { jobDefinitions }