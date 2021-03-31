const ensureLegalCode = (req, res, next) => {
  const { code } = req.body;
  const blackList = ['throw', 'Error'];
  const splitCode = code.split(' ');
  let legalCode = true;
  for (let i = 0; i < blackList.length; i += 1) {
    if (splitCode.includes(blackList[i])) {
      legalCode = false;
      res.status(400).send({
        msg: `Du får ikke lov til å bruke følgende keyword: ${blackList[i]}`,
      });
      break;
    }
  }
  if (legalCode) next();
};

module.exports = { ensureLegalCode };
