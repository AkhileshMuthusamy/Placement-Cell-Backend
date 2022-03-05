const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ error: true, message: 'Access Denied' });

  jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
    if (error) return res.status(401).json({ error: true, message: 'Invalid token' });

    console.log(payload);
    req.user = payload;
    next();
  });
}

module.exports = auth;