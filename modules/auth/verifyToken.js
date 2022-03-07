const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    /**
     * Middleware function to verify JWT token received from frontend
     */

    const token = req.header('Authorization');
    // 401 Unauthorized
    if (!token) return res.status(401).json({ error: true, message: 'Access Denied' });

    jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
        if (error) return res.status(401).json({ error: true, message: 'Invalid token' });

        if (res.locals.role && payload.hasOwnProperty('role')) {
            if (res.locals.role.indexOf(payload['role']) == -1) {
                // 403 Forbidden
                return res.status(403).json({ error: true, message: 'Access Denied!' })
            }
        }

        console.log(payload);
        res.locals.user = payload;
        next();
    });
}

module.exports = verifyToken;