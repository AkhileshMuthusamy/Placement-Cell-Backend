const router = require('express').Router();
const verifyToken = require('../../modules/auth/verifyToken');
const {schedule} = require('../../modules/scheduler/scheduler');

router.post('/', verifyToken, async (req, res) => {



    console.log(req.body)

    await schedule.sendEventAlert(req.body);


    return res.status(506).send('Not implemented')

    
});

module.exports = router;