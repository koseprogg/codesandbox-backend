const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  if (req.headers.authorization) {
    const [, token] = req.headers.authorization.split(' ');
    if (!token) return next();
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) return next();
      req.user = user;
    });
  }
  return next();
};

module.exports = { jwtAuth };
