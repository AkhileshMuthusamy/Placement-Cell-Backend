const router = require('express').Router();
const Mark = require('../../models/mark');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const userOnly = require('../../modules/auth/userOnly');


router.post('/', userOnly, verifyToken, (req, res) => {

    if (!req.body.uploadedAt) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    Mark.deleteMany({'uploadedBy': res.locals.user.id, 'uploadedAt': req.body.uploadedAt}).then(result => {
        res.status(200).json({
            data: result,
            error: false,
        });
    }).catch(err => internalError(res, err));
});

module.exports = router;
