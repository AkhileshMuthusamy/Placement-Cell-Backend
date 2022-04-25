const router = require('express').Router();
const verifyToken = require('../../modules/auth/verifyToken');
const {schedule} = require('../../modules/scheduler/scheduler');
const Event = require('../../models/event');
const User = require('../../models/user');
const Skill = require('../../models/skill');
const internalError = require('../../modules/response/internal-error');
const agenda = require("../../modules/scheduler/index");
const moment = require('moment');

const fs = require('fs')
const pdfParse = require('pdf-parse');
var textract = require('textract');

router.post('/', verifyToken, (req, res) => {

    delete req.body._id;
    const event = new Event(req.body);
    let error = event.validateSync(); // Validate fields

    if (error) {
        return res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    }

    let query = {};
    if (event.skills && event.skills.length > 0) {
        query = {$and: event.skills.map(skill => { return {'skills': skill}})};
    }
    query['cgpa'] = {$gte: event.minCgpa ? event.minCgpa : 0};
    query['hsMark'] = {$gte: event.minHSMark ? event.minHSMark : 0};
    if (event.batch && event.batch.length > 0) query['batch'] = {$in: event.batch};
    if (event.department && event.department.length > 0) query['department'] = {$in: event.department};

    console.log(query);
    event.save().then(() => {

        User.find(query, "email phone").then(users => {

            let toNumbers = users.map(user => user.phone);
            toNumbers = toNumbers.filter(phone => !!phone);
            let emails = users.map(user => user.email);

            console.log(query, emails, toNumbers);

            if (emails.length > 0) {
                const emailTemplateData = { body: event.body }
                const toAddress = emails.join(', ');
                let subject = `New Event Invitation: ${event.title}`;
                const emailTemplate = './modules/email/templates/new_event.ejs';
    
                schedule.sendEventAlert({'data': {toAddress, subject, emailTemplate, emailTemplateData, jd: event.jd}}).then(() => {
                    res.status(200).json({
                        data: event,
                        error: false,
                        notification: {type: 'INFO', message: 'Event added successfully!'}
                    });
                });

                let body = `You are invited to event '${event.title}' scheduled at ${moment(event.date).format('MMMM Do YYYY, h:mm:ss a')}`

                schedule.sendSMSEventAlert({'data': {toNumbers, body}});

                let dateTime = event.remindAt;
                if (dateTime) {
                    subject = `[Reminder] Event: ${event.title}`;
                    schedule.remindEventThroughEmail({'data': {toAddress, subject, emailTemplate, emailTemplateData, dateTime, jd: event.jd}}).then(jobId => {
                        event.reminderJob = jobId;
                        event.save().catch(err => {
                            console.log(err);
                        })
                    });
                }
            }

        });


    }).catch(err => internalError(res, err));


    
});

router.put('/', verifyToken, (req, res) => {

    const _event = new Event(req.body);
    let error = _event.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    }

    const eventId = req.body._id
    delete req.body._id

    
    
    Event.findByIdAndUpdate(eventId, req.body).then(event => {
        
        let query = {};
        if (_event.skills && _event.skills.length > 0) {
            query = {$and: _event.skills.map(skill => { return {'skills': skill}})};
        }
        query['cgpa'] = {$gte: _event.minCgpa ? _event.minCgpa : 0};
        query['hsMark'] = {$gte: _event.minHSMark ? _event.minHSMark : 0};
        if (_event.batch && _event.batch.length > 0) query['batch'] = {$in: _event.batch};
        if (_event.department && _event.department.length > 0) query['department'] = {$in: _event.department};

        User.find(query, "email").distinct('email').then(emails => {
            console.log(query, emails);

            if (emails.length > 0) {
                const emailTemplateData = { body: _event.body }
                const toAddress = emails.join(', ');
                let subject = `Event Updated: ${_event.title}`;
                const emailTemplate = './modules/email/templates/new_event.ejs';
    
                schedule.sendEventAlert({'data': {toAddress, subject, emailTemplate, emailTemplateData, jd: _event.jd}}).then((jobId) => {
                    res.status(200).json({
                        data: event,
                        error: false,
                        notification: {type: 'INFO', message: 'Event updated successfully!'}
                    });
                });

                const oldReminderJob = event.reminderJob;

                let dateTime = _event.remindAt;
                if (dateTime) {
                    subject = `[Reminder] Event: ${_event.title}`;
                    schedule.remindEventThroughEmail({'data': {toAddress, subject, emailTemplate, emailTemplateData, dateTime, jd: _event.jd}}).then(jobId => {
                        event.reminderJob = jobId;
                        event.save().catch(err => {
                            console.log(err);
                        })
                    });
                }

                // Remove old reminder job from database
                if (oldReminderJob) {
                    agenda.cancel({'_id': oldReminderJob}).then(result => {
                        // 1 => cancelled
                        // 0 => Failed to cancel
                        console.log('Old job canceled', result);
                    });
                }
            } else {
                res.status(400).json({
                    error: false,
                    notification: {type: 'ERROR', message: 'No student is eligible to attend the event under this condition. Please update the condition.'}
                });
            }

        });
    });
    
});


router.delete('/', verifyToken, (req, res) => {
    let _id = req.query._id;

    if (!_id) return res.status(400).json({error: true, message: 'Field \'_id\' missing' });

    // In-order for pre hook to work, the doc must be fetched and then deleted
    Event.findOne({_id}).then(event => {
        event.deleteOne().then(result => {
            res.status(200).json({
                data: result,
                error: false,
                notification: {type: 'INFO', message: 'Event deleted successfully!'}
            });
        }).catch(err => internalError(res, err));
    });
});



router.get('/list', verifyToken, (req, res) => {

    Event.find().then(events => {
        res.status(200).json({
            data: events,
            error: false,
        });
    })
    .catch(err => internalError(res, err));
});

function extractMatchedSkills(fileContent, skills) {
    fileContent = fileContent.toLowerCase();
    matchedSkills = []

    skills.forEach(skill => {
        console.log(skill.toLowerCase());

        let combination_1 = fileContent.includes(`${skill.toLowerCase()},`);
        let combination_2 = fileContent.includes(`${skill.toLowerCase()}.`);
        let combination_3 = fileContent.includes(`${skill.toLowerCase()} `);

        if (combination_1 || combination_2 || combination_3) {
            matchedSkills.push(skill);
        }
    });

    return matchedSkills;
}

router.post('/fetch-skills', (req, res) => {

    console.log(req.file)

    if (!req.file) return res.status(400).json({error: true, message: 'Field \'file\' missing' });

    Skill.find({}).distinct('name').then(skills => {
        
        if (req.file.mimetype === 'application/pdf') {
            // let fileContent = extractPDF(`./uploads/${req.file.filename}`);
            let fileSync = fs.readFileSync(`./uploads/${req.file.filename}`);
            pdfParse(fileSync).then(result => {
                console.log(result);
                
                let matchedSkills = extractMatchedSkills(result.text, skills);
            
                return res.status(200).json({
                    data: {
                        skills: matchedSkills,
                        jd: req.file.filename
                    },
                    error: false,
                });
            }).catch(err => internalError(res, err));

        } else {
            textract.fromFileWithPath(`./uploads/${req.file.filename}`, function( error, text ) {
                console.log(text);
                let matchedSkills = extractMatchedSkills(text, skills);
        
                return res.status(200).json({
                    data: matchedSkills,
                    error: false,
                });
            });
        }

    
    }).catch(err => internalError(res, err));

});



module.exports = router;