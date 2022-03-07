const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const signToken = require('../../modules/auth/signToken');

router.post('/', (req, res) => {
    // Check if request body contains all required fields
    if (!req.body.id || !req.body.password) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }
  
    //Check if ID already exists in the database
    User.findOne({ id: req.body.id }).then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }
    
        // Check if password is valid
        bcrypt.compare(req.body.password, user.password).then(isMatch => {
            if (isMatch) {
                console.log('Password matched');
        
                // Generate JWT token
                signToken({ id: user.id, role: user.role })
                    .then(({token}) => {
                        const profile = {...user._doc};
                        delete profile['_id']
                        delete profile['password']
                        res.status(200).json({data: {token, profile}, error: false});
                    })
                    .catch(error => {
                        console.log(error);
                        return res.status(500).json({ error: true, message: 'Error signing token'});
                    });
            } else {
                return res.status(400).json({ 
                    error: true,
                    message: {password: {message: 'Invalid password'}},
                    notification: {type: 'ERROR', message: 'Invalid password'}
                });
            }
        });
    });
  });

module.exports = router;