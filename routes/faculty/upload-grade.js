const router = require('express').Router();
const User = require('../../models/user');
const Mark = require('../../models/mark');
const verifyToken = require('../../modules/auth/verifyToken');
const userOnly = require('../../modules/auth/userOnly');
const internalError = require('../../modules/response/internal-error');

router.post('/', userOnly, verifyToken, (req, res) => {

    Mark.insertMany(req.body).then((markStat) => {
        req.body.forEach((studentMark, index) => {
            User.updateOne({id: studentMark.id}, {$set: {'cgpa': studentMark.cgpa}}).catch(err => {
                return res.status(400).json({ 
                    error: true, 
                    message: err,
                    notification: {type: 'ERROR', message: 'Error while updating student CGPA'}
                });
            });
        });
        return res.status(200).json({data: markStat, error: false, notification: {type: 'INFO', message: 'Data uploaded successfully!'}});
    }).catch(err => internalError(res, err));
});

router.post('/verify', userOnly, verifyToken, (req, res) => {


    User.find().where('id').in(req.body.ids).select('id').lean().then((s) => {
        validUsers = s.map(doc => doc.id);
        console.log(validUsers);
        return res.status(200).json({data: validUsers, error: false});
    }).catch(err => internalError(res, err));

});

module.exports = router;