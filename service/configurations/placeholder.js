const _ = require('lodash');

function PlaceHolder( baseUrl ){
  this.baseUrl = baseUrl;
}

PlaceHolder.prototype.getName = function() {
  return 'placeholder';
};

PlaceHolder.prototype.getBaseUrl = function() {
  return this.baseUrl;
};

PlaceHolder.prototype.getUrl = function(req) {
  return `${this.baseUrl}/search`;
};

PlaceHolder.prototype.getParameters = function(req) {
  const parameters = {
    text: req.clean.text
  };

  if (_.has(req.clean, 'lang.iso6393')) {
    parameters.lang = req.clean.lang.iso6393;
  }

  return parameters;
};

PlaceHolder.prototype.getHeaders = function(req) {
  return {};
};

// export
module.exports = PlaceHolder;
