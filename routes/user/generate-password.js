const router = require('express').Router();
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const adminOnly = require('../../modules/auth/adminOnly');
const mailer = require('../../modules/email/mailer');
const generateRandomNumber = require('../../modules/utils');

router.post('/', adminOnly, verifyToken, async (req, res) => {
    // Check if request body contains all required fields
    if (!req.body.id) return res.status(400).json({error: true, message: 'ID field missing' });

    //Check if ID already exists in the database
    User.findOne({ id: req.body.id }).then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }

        try {
            let password = generateRandomNumber();
            user.password = password;
            const emailTemplateData = { username: user.id, password, firstName: user.firstName }
            const toAddress = user.email;
            const subject = `Account Password Reset`;
            const emailTemplate = './modules/email/templates/generate_new_password.ejs';

            mailer
                .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
                .then(info => {
                    console.log('Email sent: %s', info.messageId);
                    user.hasNotified = true;
                    user.save().then(() => {
                        res.status(200).json({
                            data: user._id,
                            error: false,
                            notification: {type: 'INFO', message: 'Successfully emailed password!'}
                        });
                    });
                })
                .catch(err => {
                    console.log(err);
                    user.hasNotified = false;
                    user.save().then(() => {
                        res.status(400).json({ 
                            error: true,
                            message: {email: {message: 'Unable to send email'}},
                            notification: {type: 'ERROR', message: 'Unable to send email'}
                        });
                    });
                });
        } catch (err) {
            res.status(400).json({ error: true, message: err });
        }
    });
});

module.exports = router;