class PeliasParameterError extends Error {
  constructor(message = '') {
    super(message);
  }

  // syntax had to be changed due to jshint bug
  // https://github.com/jshint/jshint/issues/3358
  ['toString']() {
    return this.message;
  }

  toJSON() {
    return this.message;
  }
}

module.exports = PeliasParameterError;
