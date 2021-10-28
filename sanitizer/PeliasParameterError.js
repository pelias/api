class PeliasParameterError extends Error {
  constructor(message = '') {
    super(message);
  }

  toString() {
    return this.message;
  }

  toJSON() {
    return this.message;
  }
}

module.exports = PeliasParameterError;
