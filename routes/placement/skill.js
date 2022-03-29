const router = require('express').Router();
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');

router.get('/', verifyToken, (req, res) => {

    User.find({'skills': {$ne: null}}).distinct('skills').then(users => {

        res.status(200).json({
            data: users,
            error: false,
        });

    }).catch(err => internalError(res, err));
});

module.exports = router;
