const router = require('express').Router();
const User = require('../../models/user');
const verifyToken = require('../../modules/auth/verifyToken');
const adminOnly = require('../../modules/auth/adminOnly');


router.post('/', adminOnly, verifyToken, async (req, res) => {
    /**
     * Register new user
     */
    const user = new User(req.body);
    let error = user.validateSync(); // Validate fields

    if (error) {
        res.status(400).json({error: true, message: error.errors})
    } else {
        try {
            await user.save(); // Save it to database
            res.status(200).json({ data: user._id, error: false });
        } catch (err) {
            res.status(400).json({ error: true, message: err });
        }
    }

})


module.exports = router;