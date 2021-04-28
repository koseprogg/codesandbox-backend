const parseCodewarriorRes = (out) => {
  let testRes = {};
  let nestedRes = {};
  let isNested = false;
  const results = [];
  out.split('\n').forEach((line) => {
    const parsedLine = /^<(\w+):(\w*):(\w*)>(.*)$/.exec(line);
    const [, token, , , value] = parsedLine || [line, null, null, null, line];

    const res = isNested ? nestedRes : testRes;

    switch (token) {
      case 'DESCRIBE':
        testRes = { testDescription: value };
        break;
      case 'IT':
        isNested = true;
        nestedRes = { testDescription: value };
        break;
      case 'PASSED':
        res.success = true;
        break;
      case 'FAILED':
        res.success = false;
        break;
      case 'POINTS':
        res.achievedWeight = value ? Number.parseInt(value, 10) : 0;
        break;
      case null:
      case undefined:
        if (line.length > 0) testRes.yourOutput = line;
        break;
      case 'COMPLETEDIN':
        res.time = value ? Number.parseInt(value.replace('ms'), 10) : 0;
        results.push({ ...res });
        if (isNested) {
          nestedRes = {};
          isNested = false;
        } else {
          testRes = {};
        }
        break;
      default:
    }
  });
  results.push({ ...testRes });
  return results.filter(Boolean);
};

module.exports = { parseCodewarriorRes };
