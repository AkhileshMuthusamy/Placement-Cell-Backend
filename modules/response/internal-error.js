
function internalError(res, err) {
    console.log(err);
    return res.status(500).json({ 
        error: true,
        message: err,
        notification: {type: 'ERROR', message: 'Internal Error'}
    });
}

module.exports = internalError;