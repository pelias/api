var _ = require('lodash');
var iterate = require('../helper/iterate');

function setup() {
  return applyLocalNamingConventions;
}

function applyLocalNamingConventions(req, res, next) {

  if (!res) {
    return next();
  }

  iterate(res.results, function(result) {
    // do nothing if no result data set
    if(_.isUndefined(result.data)) { return; }

    // loop through data items and flip relevant number/street
    result.data.filter(function(place){
      // only relevant for German addresses
      if( 'DEU' !== place.alpha3 ){ return false; }
      if( !place.hasOwnProperty('address') ){ return false; }
      if( !place.address.hasOwnProperty('number') ){ return false; }
      if( !place.address.hasOwnProperty('street') ){ return false; }
      return true;
    })
    .forEach( flipNumberAndStreet );
  });

  next();
}

// DE address should have the housenumber and street name flipped
// eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
function flipNumberAndStreet(place) {
  var standard = ( place.address.number + ' ' + place.address.street ),
      flipped  = ( place.address.street + ' ' + place.address.number );

  // flip street name and housenumber
  if( place.name.default === standard ){
    place.name.default = flipped;
  }
}

module.exports = setup;
