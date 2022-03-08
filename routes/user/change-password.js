const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const mailer = require('../../modules/email/mailer');

router.post('/', verifyToken, (req, res) => {
    // Check if request body contains all required fields
    if (!req.body.newPassword || !req.body.oldPassword) {
        return res.status(400).json({
            error: true,
            message: 'One or more required field missing',
            notification: {type: 'ERROR', message: 'One or more required field missing'} 
        });
    }

    //Check if ID already exists in the database
    User.findOne({ id: res.locals.user.id }).then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }
        
        // Check if password is valid
        bcrypt.compare(req.body.oldPassword, user.password).then(isMatch => {
            if (isMatch) {
                user.password = req.body.newPassword;
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
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ 
                        error: true,
                        message: err,
                        notification: {type: 'ERROR', message: 'Unable to change password'}
                    });
                });
            } else {
                return res.status(400).json({ 
                    error: true,
                    message: {oldPassword: {message: 'Invalid password'}},
                    notification: {type: 'ERROR', message: 'Invalid password'}
                });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ 
                error: true,
                message: err,
                notification: {type: 'ERROR', message: 'Unable to verify password'}
            });
        });
    });
});

module.exports = router;