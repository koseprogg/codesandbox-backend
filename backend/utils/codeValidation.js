const ensureLegalCode = (req, res, next) => {
  const { code } = req.body;
  const blackList = ['throw', 'Error'];
  const splitCode = code.split(' ');
  let legalCode = true;
  for (let i = 0; i < blackList.length; i += 1) {
    if (splitCode.includes(blackList[i])) {
      legalCode = false;
      res.status(200).send({
        result: {
          score: 0,
          possibleScore: 0,
          achievedScore: 0,
          characterCount: code.length,
          elapsedTimeInMilis: 0,
        },
        msg: `Illegal keyword: ${blackList[i]}`,
      });
      break;
    }
  }
  if (legalCode) next();
};

module.exports = { ensureLegalCode };
