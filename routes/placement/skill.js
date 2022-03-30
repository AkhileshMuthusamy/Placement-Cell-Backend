const router = require('express').Router();
const Support = require('../../models/support');
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const mailer = require('../../modules/email/mailer');

router.get('/', verifyToken, (req, res) => {

    User.find({'skills': {$ne: null}}).distinct('skills').then(users => {

        res.status(200).json({
            data: users,
            error: false,
        });

    }).catch(err => internalError(res, err));
});

router.post('/student', verifyToken, (req, res) => {

    if (!req.body.skills || !req.body.match) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    const {skills, match, batch, department, cgpa} = req.body;
    let query = {};

    if (match === 'ANY') {
        query = {'skills': {$in: skills}};
    } else if (match === 'ALL') {
        query = {$and: skills.map(skill => { return {'skills': skill}})};
    }
    if (cgpa && cgpa > 0) query['cgpa'] = {$gte: cgpa};
    if (batch && batch.length > 0) query['batch'] = {$in: batch};
    if (department && department.length > 0) query['department'] = {$in: department};

    User.find(query).then(users => {

        res.status(200).json({
            data: users,
            error: false,
        });

    }).catch(err => internalError(res, err));
});

router.post('/support', verifyToken, (req, res) => {

    const support = new Support(req.body);
    let error = support.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    } else {
        const emailTemplateData = { body: support.body }
        const toAddress = support.emails.join(', ');
        const subject = support.subject;
        const emailTemplate = './modules/email/templates/new_event.ejs';

        mailer
            .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
            .then(info => {
                console.log('Email sent: %s', info.messageId);
                support.save().then(() => {
                    res.status(200).json({
                        data: support._doc,
                        error: false,
                        notification: {type: 'INFO', message: 'Email sent successfully!'}
                    });
                });
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({ 
                    error: true,
                    message: {email: {message: 'Unable to send email'}},
                    notification: {type: 'ERROR', message: 'Unable to send email'}
                });
            });
    }

});


router.get('/support', verifyToken, (req, res) => {

    Support.find({'performedBy': res.locals.user.id}).then(users => {

        res.status(200).json({
            data: users,
            error: false,
        });

    }).catch(err => internalError(res, err));
});

module.exports = router;
