const router = require('express').Router();
const Mark = require('../../models/mark');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');

router.get('/', verifyToken, (req, res) => {

    console.log(req.body);
    Mark.find({'id': res.locals.user.id}).then((studentMarks) => {
        return res.status(200).json({ 
            data: studentMarks,
            error: false, 
        });
    }).catch(err => internalError(res, err));
});

module.exports = router;