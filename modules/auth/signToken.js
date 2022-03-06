const jwt = require('jsonwebtoken');

function signToken(payload) {
  /**
   * Create and assign a token
   * expiresIn: seconds
   */
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 48 }, (error, token) => {
      if (error) reject(error);

      resolve({
        success: true,
        token: `${token}`,
      });

    });
  });
}

module.exports = signToken;
