const router = require('express').Router();
const verifyToken = require('../../modules/auth/verifyToken');
const adminOnly = require('../../modules/auth/adminOnly');
const User = require('../../models/user');
const internalError = require('../../modules/response/internal-error');

router.put('/', adminOnly, verifyToken, (req, res) => {

    // Check if request body contains all required fields
    if (!req.body.ids) return res.status(400).json({error: true, message: 'Field \'ids\' missing' });

    //Find users with matching role and exclude password field in result
    User.updateMany({id: {$in: req.body.ids}}, {$set: {disabled: true}}).then(stats => {
        res.status(200).json({
            data: stats,
            error: false,
            notification: {type: 'Info', message: 'Disabled the user successfully.'}
        });
    })
    .catch(internalError)
});

module.exports = router;