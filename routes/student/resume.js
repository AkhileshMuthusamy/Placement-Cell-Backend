
const router = require('express').Router();
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const mongooseError = require('../../modules/response/mongoose-error');
const {getDateTimeString} = require('../../modules/date-util')

router.post('/', verifyToken, (req, res) => {
    if (!req.file) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    resume = req.file.filename;

    User.updateOne({id: res.locals.user.id}, {$set: {resume}}).then(stats => {
        res.status(200).json({
            data: stats,
            error: false,
            notification: {type: 'Info', message: 'Resume uploaded successfully.'}
        });
    }).catch(err => {
        if (err.hasOwnProperty('code')) {
            mongooseError(res, err)
        } else {
            internalError(res, err)
        }
    });

});

module.exports = router;