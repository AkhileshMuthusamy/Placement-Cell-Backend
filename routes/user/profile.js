const router = require('express').Router();
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');

router.get('/', verifyToken, (req, res) => {

    //Check if ID already exists in the database
    User.findOne({ id: res.locals.user.id }, "-password").then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }

        res.status(200).json({data: user, error: false});

    }).catch(err => internalError(res, err));
});

router.put('/', verifyToken, (req, res) => {
    
});

module.exports = router;