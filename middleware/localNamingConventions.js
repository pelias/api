
function setup() {
  return applyLocalNamingConventions;
}

function applyLocalNamingConventions(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  // loop through data items and flip relevant number/street
  res.data.filter(function(place){
    // only relevant for German addresses
    if( 'DEU' !== place.parent.country_a ){ return false; }
    if( !place.hasOwnProperty('address') ){ return false; }
    if( !place.address.hasOwnProperty('number') ){ return false; }
    if( !place.address.hasOwnProperty('street') ){ return false; }
    return true;
  })
  .forEach( flipNumberAndStreet );

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
