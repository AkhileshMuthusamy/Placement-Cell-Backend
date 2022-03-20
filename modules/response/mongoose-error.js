
function mongooseError(res, err) {
    console.log(err);
    if (err.code === 11000) {
        return res.status(400).json({ 
            error: true, 
            message: err,
            notification: {type: 'ERROR', message: `${Object.keys(err.keyValue)[0]} already exist`}
        });
    } else {
        return res.status(500).json({ 
            error: true,
            message: err,
            notification: {type: 'ERROR', message: 'Internal Error'}
        });
    }
}

module.exports = mongooseError;