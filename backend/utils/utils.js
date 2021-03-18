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

export { normalizeString };
