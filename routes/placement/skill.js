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

router.post('/student', verifyToken, (req, res) => {

    if (!req.body.skills || !req.body.match) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    const {skills, match, batch, department, cgpa} = req.body;
    let query = {};

    if (match === 'ANY') {
        query = {'skills': {$in: skills}};
    } else if (match === 'ALL') {
        query = {$and: skills.map(skill => { return {'skills': skill}})};
    }
    if (cgpa && cgpa > 0) query['cgpa'] = {$gte: cgpa};
    if (batch && batch.length > 0) query['batch'] = {$in: batch};
    if (department && department.length > 0) query['department'] = {$in: department};

    User.find(query).then(users => {

        res.status(200).json({
            data: users,
            error: false,
        });

    }).catch(err => internalError(res, err));
});

module.exports = router;
