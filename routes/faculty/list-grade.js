const router = require('express').Router();
const Mark = require('../../models/mark');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const userOnly = require('../../modules/auth/userOnly');


router.get('/', userOnly, verifyToken, (req, res) => {

    Mark.find({'uploadedBy': res.locals.user.id}).distinct('uploadedAt').then(result => {
        res.status(200).json({
            data: result,
            error: false,
        });
    }).catch(err => internalError(res, err));
});

module.exports = router;
