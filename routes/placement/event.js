const router = require('express').Router();
const verifyToken = require('../../modules/auth/verifyToken');
const {schedule} = require('../../modules/scheduler/scheduler');
const Event = require('../../models/event');
const User = require('../../models/user');
const internalError = require('../../modules/response/internal-error');

router.post('/', verifyToken, (req, res) => {

    delete req.body._id;
    const event = new Event(req.body);
    let error = event.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    }

    event.save().then(() => {

        User.find({'cgpa': {$gte: event.minCgpa}}, "email").distinct('email').then(emails => {
            console.log(emails);

            if (emails.length > 0) {
                const emailTemplateData = { body: event.body }
                const toAddress = emails.join(', ');
                const subject = `New Event Invitation: ${event.title}`;
                const emailTemplate = './modules/email/templates/new_event.ejs';
    
                // console.dir({toAddress, subject, emailTemplate, emailTemplateData});
    
                schedule.sendEventAlert({'data': {toAddress, subject, emailTemplate, emailTemplateData}}).then(() => {
                    res.status(200).json({
                        data: event,
                        error: false,
                        notification: {type: 'INFO', message: 'Event added successfully!'}
                    });
                });
            }

        });


    }).catch(err => internalError(res, err));


    
});

router.put('/', verifyToken, (req, res) => {

    const event = new Event(req.body);
    let error = event.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    }

    const eventId = req.body._id
    console.log(eventId, req.body)
    delete req.body._id


    Event.findByIdAndUpdate(eventId, req.body).then(stats => {
        res.status(200).json({
            data: stats,
            error: false,
            notification: {type: 'INFO', message: 'Event updated successfully!'}
        });
    });

    // await schedule.sendEventAlert(req.body);

    
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

module.exports = router;