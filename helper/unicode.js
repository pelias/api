const _ = require('lodash');
const regenerate = require('regenerate');

// non-printable control characters
// ref: https://en.wikipedia.org/wiki/List_of_Unicode_characters
const CONTROL_CODES = regenerate()
  .addRange(0x0000, 0x001F) // C0 (0000-001F)
  .add(0x007F) // Delete
  .addRange(0x0080, 0x009F) // C1 (0080-009F)
  .toRegExp('g');

const ALTERNATE_SPACES = regenerate()
  .add(0x00A0) // Non-breaking space
  .toRegExp('g');

// unicode combining marks
// see: https://github.com/pelias/pelias/issues/829#issuecomment-542614645
// ref: https://en.wikipedia.org/wiki/Combining_character
const COMBINING_MARKS = regenerate()
  .addRange(0x0300, 0x036F) // Combining Diacritical Marks (0300–036F)
  .addRange(0x1AB0, 0x1AFF) // Combining Diacritical Marks Extended (1AB0–1AFF)
  .addRange(0x1DC0, 0x1DFF) // Combining Diacritical Marks Supplement (1DC0–1DFF)
  .addRange(0x20D0, 0x20FF) // Combining Diacritical Marks for Symbols (20D0–20FF)
  .addRange(0xFE20, 0xFE2F) // Combining Half Marks (FE20–FE2F)
  .add(0x3099) // combining dakuten (U+3099)
  .add(0x309A) // combining handakuten (U+309A)
  .toRegExp('g');

function normalize(str) {
  
  // sanity checking
  if(!_.isString(str)){ return str; }

  return str
    .normalize('NFC')
    .replace(CONTROL_CODES, '')
    .replace(ALTERNATE_SPACES, ' ')
    .replace(COMBINING_MARKS, '');
}

module.exports.normalize = normalize;
