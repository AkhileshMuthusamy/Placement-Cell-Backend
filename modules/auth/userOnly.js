
function adminOnly(req, res, next) {
    /**
     * Middleware function to set custom parameter to request
     * 
     * Note: Do not use req or request object to add properties
     * https://davidburgos.blog/how-to-pass-parameters-between-middleware-in-expressjs/
     */
    res.locals.role = ['FACULTY', 'PLACEMENT'];
    next();
}

module.exports = adminOnly;