const router = require('express').Router();
const verifyToken = require('../../modules/auth/verifyToken');
const {schedule} = require('../../modules/scheduler/scheduler');
const Event = require('../../models/event');
const internalError = require('../../modules/response/internal-error');

router.post('/', verifyToken, (req, res) => {

    const event = new Event(req.body);
    let error = event.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    }

    event.save().then(() => {
        res.status(200).json({
            data: event,
            error: false,
            notification: {type: 'INFO', message: 'Event added successfully!'}
        });
    }).catch(err => internalError(res, err));

    // await schedule.sendEventAlert(req.body);

    
});

router.put('/', verifyToken, (req, res) => {

    const event = new Event(req.body);
    let error = event.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors, notification: {type: 'ERROR', message: 'One or more fields has error'}})
    }

    eventId = req.body._id
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