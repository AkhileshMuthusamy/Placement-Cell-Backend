const router = require('express').Router();
const User = require('../../models/user');
const mailer = require('../../modules/email/mailer');

router.post('/', (req, res) => {
    // Check if request body contains all required fields
    if (!req.body.id) {
        return res.status(400).json({
            error: true,
            message: 'One or more required field missing',
            notification: {type: 'ERROR', message: 'One or more required field missing'} 
        });
    }

    //Check if ID already exists in the database
    User.findOne({ id: req.body.id }).then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }

        user.generatePasswordReset()

        user.save().then(() => {
            const emailTemplateData = { 
                username: user.id,
                firstName: user.firstName,
                link: `${process.env.FRONTEND_URL}reset-password/${user.resetPasswordToken}`
            }
            const toAddress = user.email;
            const subject = `Reset Password`;
            const emailTemplate = './modules/email/templates/forgot-password.ejs';
            
            mailer
            .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
            .then(info => {
                console.log('Email sent: %s', info.messageId);
                user.hasNotified = true;
                user.save().then(() => {
                    res.status(200).json({
                        data: user._id,
                        error: false,
                        notification: {type: 'INFO', message: 'An email has been sent to reset your password. Please check your inbox.'}
                    });
                });
            })
            .catch(err => {
                console.log(err);
                user.hasNotified = false;
                user.save().then(() => {
                    return res.status(400).json({ 
                        error: true,
                        message: {email: {message: 'Unable to send email'}},
                        notification: {type: 'ERROR', message: 'Unable to send email'}
                    });
                });
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({ 
                error: true,
                message: 'Unable to reset password',
                notification: {type: 'ERROR', message: 'Unable to reset password'}
            });
        });

    });
});

module.exports = router;