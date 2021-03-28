const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const jwtAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const [, token] = req.headers.authorization.split(' ');
    if (token) {
      await jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
        if (!err) {
          const dbUser = await User.findOne({ username: user.data.username });
          if (dbUser) req.user = dbUser;
        }
      });
    }
  }
  next();
};

const ensureAuth = (req, res, next) => {
  if (!req.user) res.status(401).send('Unauthenticated: Please log in to see this resource');
  else next();
};

module.exports = { jwtAuth, ensureAuth };
