const ensureLegalCode = (req, res, next) => {
  const { code } = req.body;
  const blackListReg = [
    {
      regEx: /(throw)\b/g,
      keyword: 'throw',
    },
    {
      regEx: /(Error)\b/g,
      keyword: 'Error',
    },
  ];

  let legalCode = true;

  for (let i = 0; i < blackListReg.length; i += 1) {
    if (blackListReg[i].regEx.test(code)) {
      res.status(200).send({
        msg: `Du får ikke lov til å bruke følgende keyword: ${blackListReg[i].keyword}`,
      });
      legalCode = false;
      break;
    }
  }
  if (legalCode) next();
};

module.exports = { ensureLegalCode };
