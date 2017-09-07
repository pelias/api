'use strict';

module.exports = () => {
  const stack = new Error().stack.split('\n');
  let targetLine;

  stack.forEach((line) => {
    if(line.indexOf('at controller') !== -1) {
      targetLine = line.trim();
    }
  });
  return targetLine;
};
