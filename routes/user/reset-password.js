const router = require('express').Router();
const User = require('../../models/user');
const mailer = require('../../modules/email/mailer');
const internalError = require('../../modules/response/internal-error');

router.post('/', (req, res) => {
    // Check if request body contains all required fields
    if (!req.body.resetToken || !req.body.newPassword) {
        return res.status(400).json({
            error: true,
            message: 'One or more required field missing',
            notification: {type: 'ERROR', message: 'One or more required field missing'}
        });
    }

    User.findOne({resetPasswordToken: req.body.resetToken, resetPasswordExpires: {$gt: Date.now()}}).then((user) => {
        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Token expired!",
                notification: {type: 'ERROR', message: 'Token expired!'}
            });
        }

        //Set the new password
        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // TODO: Check password validation

        user.save().then(() => {
            const emailTemplateData = { username: user.id, firstName: user.firstName }
            const toAddress = user.email;
            const subject = `Password change alert`;
            const emailTemplate = './modules/email/templates/password_changed.ejs';
            
            mailer
            .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
            .then(info => {
                console.log('Email sent: %s', info.messageId);
                user.hasNotified = true;
                user.save().then(() => {
                    res.status(200).json({
                        data: user._id,
                        error: false,
                        notification: {type: 'INFO', message: 'Password changed successfully!'}
                    });
                });
            })
            .catch(err => {
                console.log(err);
                user.hasNotified = false;
                user.save().then(() => {
                    return res.status(500).json({ 
                        error: true,
                        message: err,
                        notification: {type: 'ERROR', message: 'Unable to send email'}
                    });
                });
            });
        })
        .catch(err => internalError(res, err));


    })
    .catch(err => {
        console.log(err);
        return res.status(400).json({ 
            error: true,
            message: err,
            notification: {type: 'ERROR', message: 'Unable to verify token'}
        });
    });

});

module.exports = router;