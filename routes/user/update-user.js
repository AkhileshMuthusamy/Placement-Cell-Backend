
const router = require('express').Router();
const User = require('../../models/user');
const adminOnly = require('../../modules/auth/adminOnly');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const mongooseError = require('../../modules/response/mongoose-error');

router.put('/', adminOnly, verifyToken, (req, res) => {
    if (!req.body.id || !req.body.data) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    User.updateOne({id: req.body.id}, {$set: req.body.data}).then(stats => {
        res.status(200).json({
            data: stats,
            error: false,
            notification: {type: 'Info', message: 'Profile updated successfully.'}
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