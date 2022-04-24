const router = require('express').Router();
const Support = require('../../models/support');
const User = require('../../models/user');
const Skill = require('../../models/skill');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const mongooseError = require('../../modules/response/mongoose-error');
const mailer = require('../../modules/email/mailer');

router.get('/', verifyToken, (req, res) => {

    // User.find({'skills': {$ne: null}}).distinct('skills').then(skills => {

    //     res.status(200).json({
    //         data: skills,
    //         error: false,
    //     });

    // }).catch(err => internalError(res, err));

    Skill.find({}).distinct('name').then(skills => {
        res.status(200).json({
            data: skills,
            error: false,
        });
    
    }).catch(err => internalError(res, err));
});

router.get('/list', verifyToken, (req, res) => {

    Skill.find({}).then(skills => {
        res.status(200).json({
            data: skills,
            error: false,
        });
    
    }).catch(err => internalError(res, err));
});

router.post('/add', verifyToken, (req, res) => {

    const skill = new Skill(req.body);
    let error = skill.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    } else {
        skill.save().then(() => {
            res.status(200).json({
                data: skill._doc,
                error: false,
                notification: {type: 'INFO', message: 'Skill added successfully!'}
            });
        }).catch(err => {
            if (err.hasOwnProperty('code')) {
                mongooseError(res, err);
            } else {
                internalError(res, err);
            }
        });
    }
});


router.delete('/', verifyToken, (req, res) => {
    
    let _id = req.query._id;

    if (!_id) return res.status(400).json({error: true, message: 'Field \'_id\' missing' });

    // In-order for pre hook to work, the doc must be fetched and then deleted
    Skill.findOne({_id}).then(skill => {
        skill.deleteOne().then(result => {
            res.status(200).json({
                data: result,
                error: false,
                notification: {type: 'INFO', message: 'Skill deleted successfully!'}
            });
        }).catch(err => internalError(res, err));
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
