var _ = require('lodash');

function setup( paramName, targetMap ) {
  return function( raw, clean ){
    return sanitize( raw, clean );
  };
}

function sanitize( raw, clean, opts ) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  if (_.includes(raw.sources, 'quattroshapes') || _.includes(raw.sources, 'qs')) {
    messages.warnings.push( 'You are using Quattroshapes as a data source in this query. ' +
     'Quattroshapes will be disabled as a data source for Mapzen Search in the next several ' +
     'weeks, and is being replaced by Who\'s on First, an actively maintained data project ' +
     'based on Quattroshapes. Your existing queries WILL CONTINUE TO WORK for the foreseeable ' +
     'future, but results will be coming from Who\'s on First and `source=quattroshapes` will ' +
     'be deprecated. If you have any questions, please email search@mapzen.com.');
  }

  return messages;
}

module.exports = setup;
