const { VM } = require('vm2');
const { AuthorizationCode } = require('simple-oauth2');
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const adminRouter = require('./routes/adminRouter');
const competitionsRouter = require('./routes/competitionsRouter');

const connectToMongoDb = require('./mongo');

const User = require('./models/UserModel');
const { jwtAuth } = require('./utils/auth');

const app = express();
const port = process.env.PORT || 3000;

const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';

dotenv.config();

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// If the env is PROD we use a simple redis rate-limiter
if (process.env.NODE_ENV === 'production') {
  const apiLimiter = new RateLimit({
    store: new RedisStore({
      redisURL: 'redis://redis:6379',
      expiry: 1,
    }),
    max: 50,
    statusCode: 429,
    message: 'Rate limit exceeded. Please wait',
  });
  app.set('trust proxy', true);
  app.use(apiLimiter);
}

// jwtAuth appends user data to the request
// access with req.user
// May be undefined if not authenticated
app.use(jwtAuth);

app.use(express.json());
app.use(cors());

const config = {
  client: {
    id: process.env.OAUTH2_ID,
    secret: process.env.OAUTH2_SECRET,
  },
  auth: {
    tokenHost: process.env.OAUTH2_HOST,
    tokenPath: '/authorization/oauth2/token/',
    authorizePath: '/authorization/oauth2/authorize/',
  },
};

const client = new AuthorizationCode(config);

connectToMongoDb(app);

app.use('/admin', adminRouter);
app.use('/competitions', competitionsRouter);

app.get('/auth', async (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: `${serverUrl}/auth/callback`,
    scope: 'user',
  });

  res.redirect(authorizationUri);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  const tokenParams = {
    code,
    redirect_uri: `${serverUrl}/auth/callback`,
  };

  const accessToken = await client.getToken(tokenParams);
  const userDataRaw = await fetch(
    `${process.env.OAUTH2_HOST}/api/v1/users/oauth2_userdata`,
    {
      headers: {
        Authorization: `Bearer ${accessToken.token.access_token}`,
      },
    },
  );
  const userData = await userDataRaw.json();

  const {
    username,
    firstName,
    lastName,
    emailAddress,
    profilePicture,
  } = userData;

  const user = await User.findOneAndUpdate(
    { username },
    {
      firstName,
      lastName,
      emailAddress,
      profilePicture,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  const token = jwt.sign(
    {
      data: user,
    },
    process.env.SECRET_KEY,
    { expiresIn: '3 days' },
  );

  res.cookie('auth', token);
  res.redirect(frontendUrl);

  return res.status(200);
});

app.post('/script', (req, res) => {
  /*
    Uses vm2 instead of vm. Supposedly more secure: https://odino.org/eval-no-more-understanding-vm-vm2-nodejs/
    */
  const vm2 = new VM();
  const preExistingCode = 'x = 200';
  const { code } = req.body;
  let stacktrace = null;
  let result = null;
  try {
    vm2.run(preExistingCode);
    result = vm2.run(code);
  } catch (e) {
    stacktrace = e;
  }

  res.status(200).send({
    result: `RES: ${result} ----- msg: ${stacktrace.toString()}`,
    msg: stacktrace.toString(),
  });
});

app.listen(port, () => {
  console.log(`backend listening at ${port}`);
});
