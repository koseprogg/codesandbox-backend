const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  if (req.headers.authorization) {
    const [, token] = req.headers.authorization.split(' ');
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (!err) req.user = user;
      });
    }
  }
  next();
};

module.exports = { jwtAuth };
