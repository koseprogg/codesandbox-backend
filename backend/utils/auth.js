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

const ensureAdmin = (req, res, next) => {
  if (!req.user.isAdmin) res.status(403).send('User is not allowed to access this resource');
  else next();
};

const canEdit = (user, document) => {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (document.createdBy && document.createdBy._id.equals(user._id)) return true;
  return false;
};

module.exports = {
  jwtAuth,
  ensureAuth,
  ensureAdmin,
  canEdit,
};
