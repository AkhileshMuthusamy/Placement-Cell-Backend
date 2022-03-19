const router = require('express').Router();
const verifyToken = require('../../modules/auth/verifyToken');
const adminOnly = require('../../modules/auth/adminOnly');
const User = require('../../models/user');

router.post('/', adminOnly, verifyToken, (req, res) => {

    // Check if request body contains all required fields
    if (!req.body.role) return res.status(400).json({error: true, message: 'Field \'role\' missing' });

    //Find users with matching role and exclude password field in result
    User.find({role: req.body.role}, "-password").then(users => {
        res.status(200).json({
            data: users,
            error: false,
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ 
            error: true,
            message: err,
            notification: {type: 'ERROR', message: 'Internal Error'}
        });
    })
});

module.exports = router;