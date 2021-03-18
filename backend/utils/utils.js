const normalizeString = (stringToNormalize) => {
  const characterReplacements = {
    å: 'aa',
    ø: 'o',
    æ: 'ae',
  };

  let normalizedString = '';

  [...stringToNormalize
    .toLowerCase()
    .split(' ')
    .join('')]
    .forEach((char) => {
      normalizedString += characterReplacements[char] || char;
    });
  return normalizedString;
};

const runTestCase = (testCase, vm) => {
  const x = 2;
  return x;
};

export { normalizeString };
