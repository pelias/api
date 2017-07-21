var _ = require('lodash');

/**
  In the process of phasing out the 'quattroshapes' source in favour of 'whosonfirst'
  we will emit a warning to users so they can begin upgrading their clients.

  In the interim we will automatically rewrite all requests for quattroshapes to whosonfirst.

  @todo: this is only temporary
  @see: https://github.com/pelias/api/issues/442
**/

function _sanitize( raw, clean, opts ) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // only applicably when 'sources' param is privided
  if( raw.hasOwnProperty('sources') ){

    var sources = raw.sources.split(',');
    if (_.includes(sources, 'quattroshapes') || _.includes(sources, 'qs')) {

      // emit a warning message so users can transition.
      messages.warnings.push('You are using Quattroshapes as a data source in this query. ' +
       'Quattroshapes has been disabled as a data source for Mapzen Search, and has been' +
       'replaced by Who\'s on First, an actively maintained data project based on Quattroshapes' +
       'Your existing queries WILL CONTINUE TO WORK for the foreseeable future, but results will ' +
       'be coming from Who\'s on First and `sources=quattroshapes` will be interpreted as ' +
       '`sources=whosonfirst`. If you have any questions, please email search@mapzen.com.');

       // user requested 'quattroshapes', we will give them 'whosonfirst' instead.
       sources = _.without(sources, 'quattroshapes', 'qs');
       sources.push('whosonfirst');
       raw.sources = sources.join(',');
    }
  }

  return messages;
}

module.exports = () => ({
  sanitize: _sanitize
});
