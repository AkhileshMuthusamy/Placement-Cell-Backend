
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

router.get('/', verifyToken, (req, res) => {

    if (!req.query.id) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    User.findOne({ id: req.query.id }).then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }

        if (user.resume) {
            res.download(`./uploads/${user.resume}`);
        } else {
            res.status(400).json({
                error: true,
                message: 'No file to download' 
            })
        }
    });
});

module.exports = router;