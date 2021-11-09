const _ = require('lodash');
const regenerate = require('regenerate');

// non-printable control characters
// ref: https://en.wikipedia.org/wiki/List_of_Unicode_characters
const CONTROL_CODES = regenerate()
  .addRange(0x0000, 0x001f) // C0 (0000-001F)
  .add(0x007f) // Delete
  .addRange(0x0080, 0x009f) // C1 (0080-009F)
  .toRegExp('g');

// non-standard spaces
// ref: http://jkorpela.fi/chars/spaces.html
const ALTERNATE_SPACES = regenerate()
  .add(0x00a0) // NO-BREAK SPACE
  .add(0x1680) // OGHAM SPACE MARK
  .add(0x180e) // MONGOLIAN VOWEL SEPARATOR
  .addRange(0x2000, 0x200b) // EN QUAD - ZERO WIDTH SPACE
  .add(0x202f) // NARROW NO-BREAK SPACE
  .add(0x205f) // MEDIUM MATHEMATICAL SPACE
  .add(0x3000) // IDEOGRAPHIC SPACE
  .add(0xfeff) // ZERO WIDTH NO-BREAK SPACE
  .toRegExp('g');

// pattern to match consecutive spaces
// const CONSECUTIVE_SPACES = /\s{2,}/g;

// unicode combining marks
// see: https://github.com/pelias/pelias/issues/829#issuecomment-542614645
// ref: https://en.wikipedia.org/wiki/Combining_character
const COMBINING_MARKS = regenerate()
  .add(0x200d) // ZERO WIDTH JOINER (U+200D)
  .addRange(0x0300, 0x036f) // Combining Diacritical Marks (0300–036F)
  .addRange(0x1ab0, 0x1aff) // Combining Diacritical Marks Extended (1AB0–1AFF)
  .addRange(0x1dc0, 0x1dff) // Combining Diacritical Marks Supplement (1DC0–1DFF)
  .addRange(0x20d0, 0x20ff) // Combining Diacritical Marks for Symbols (20D0–20FF)
  .addRange(0xfe00, 0xfe0f) // Variation Selectors (FE00-FE0F)
  .addRange(0xfe20, 0xfe2f) // Combining Half Marks (FE20–FE2F)
  .add(0x3099) // combining dakuten (U+3099)
  .add(0x309a) // combining handakuten (U+309A)
  .toRegExp('g');

// miscellaneous symbols with no relevance to geocoding
const MISC_UNSUPPORTED_SYMBOLS = regenerate()
  // Superscripts and Subscripts (2070-209F)
  // Currency Symbols (20A0-20CF)
  // Letterlike Symbols (2100-214F)
  // Number Forms (2150-218F)
  // Arrows (2190-21FF)
  // Mathematical Operators (2200-22FF)
  // Miscellaneous Technical (2300-23FF)
  // Control Pictures (2400-243F)
  // Optical Character Recognition (2440-245F)
  // Enclosed Alphanumerics (2460-24FF)
  // Box Drawing (2500-257F)
  // Block Elements (2580-259F)
  // Geometric Shapes (25A0-25FF)
  // Miscellaneous Symbols (2600-26FF)
  // Dingbats (2700-27BF)
  // Miscellaneous Mathematical Symbols-A (27C0-27EF)
  // Supplemental Arrows-A (27F0-27FF)
  // Braille Patterns (2800-28FF)
  // Supplemental Arrows-B (2900-297F)
  // Miscellaneous Mathematical Symbols-B (2980-29FF)
  // Supplemental Mathematical Operators (2A00-2AFF)
  // Miscellaneous Symbols and Arrows (2B00-2BFF)
  .addRange(0x2070, 0x2bff) // A Range Covering Consecutive Blocks Listed Above

  // symbols
  .addRange(0x02b0, 0x02ff) // Spacing Modifier Letters (02B0-02FF)
  .addRange(0x1400, 0x167f) // Unified Canadian Aboriginal Syllabics (1400-167F)
  .addRange(0x1d100, 0x1d1ff) // Musical Symbols (1D100-1D1FF)
  .addRange(0x1d400, 0x1d7ff) // Mathematical Alphanumeric Symbols (1D400-1D7FF)

  // emojis
  .addRange(0x1f300, 0x1f5ff) // Miscellaneous Symbols and Pictographs (1F300-1F5FF)
  .addRange(0x1f3fb, 0x1f3ff) // Emoji Modifier Fitzpatrick (skin tones) (1F3FB–1F3FF)
  .addRange(0x1f600, 0x1f64f) // Emoticons (1F600–1F64F)
  .addRange(0x1f680, 0x1f6ff) // Transport and Map Symbols (1F680-1F6FF)
  .addRange(0x1f900, 0x1f9ff) // Supplemental Symbols and Pictographs (1F900-1F9FF)
  .toRegExp('g');

function normalize(str) {
  // sanity checking
  if (!_.isString(str)) {
    return str;
  }

  return str
    .normalize('NFKC')
    .replace(CONTROL_CODES, '')
    .replace(ALTERNATE_SPACES, ' ')
    .replace(MISC_UNSUPPORTED_SYMBOLS, '')
    .replace(COMBINING_MARKS, '');
}

module.exports.normalize = normalize;
