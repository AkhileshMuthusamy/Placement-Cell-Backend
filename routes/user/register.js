const router = require('express').Router();
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const adminOnly = require('../../modules/auth/adminOnly');
const mailer = require('../../modules/email/mailer');
const generateRandomNumber = require('../../modules/utils');


router.post('/', adminOnly, verifyToken, async (req, res) => {
    /**
     * Register new user
     */
    const user = new User(req.body);
    let error = user.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    } else {
        try {
            let password = generateRandomNumber();
            user.password = password;
            await user.save(); // Save it to database
            const emailTemplateData = { username: user.id, password, firstName: user.firstName }
            const toAddress = user.email;
            const subject = `Welcome to our College!`;
            const emailTemplate = './modules/email/templates/new_user_registration.ejs';

            mailer
                .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
                .then(info => {
                    console.log('Email sent: %s', info.messageId);
                    user.hasNotified = true;
                    user.save().then(() => {
                        res.status(200).json({
                            data: user._id,
                            error: false,
                            notification: {type: 'INFO', message: 'User created successfully!'}
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
    }

})


module.exports = router;