import vm from 'vm';
import { VM } from 'vm2';
import cors from 'cors';
import express from 'express';

// Express production rate limit
import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

import adminRouter from './routes/adminRouter.js';
import competitionsRouter from './routes/competitionsRouter.js';
import connectToMongoDb from './mongo.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(cors());

app.use('/admin', adminRouter);
app.use('/competitions', competitionsRouter);
connectToMongoDb(app);

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
  app.use(apiLimiter);
}

app.post('/', (req, res) => {
  const { code } = req.body;
  const context = vm.createContext({
    x: 200,
  });
  const result = vm.runInContext(code, context);

  res.status(201).send({
    result: { oppgave1: result, oppgave2: 'wrong' },
    msg: result,
  });
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
