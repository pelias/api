const _ = require('lodash');
const iso3166 = require('../helper/iso3166');
const Debug = require('../helper/debug');
const debugLog = new Debug('controller:libpostal');
const logger = require('pelias-logger').get('api');

// mapping object from libpostal fields to pelias fields
var field_mapping = {
  island:         'island',
  category:       'category',
  house:          'query',
  house_number:   'number',
  road:           'street',
  suburb:         'neighbourhood',
  city_district:  'borough',
  city:           'city',
  state_district: 'county',
  state:          'state',
  postcode:       'postalcode',
  country:        'country'
};

// This controller calls the hosted libpostal service and converts the response
// to a generic format for later use.  The hosted service returns an array like:
//
// ```
// [
//  {
//    label: 'house_number',
//    value: '30'
//  },
//  {
//    label: 'road',
//    value: 'west 26th street'
//  },
//  {
//    label: 'city',
//    value: 'new york'
//  },
//  {
//    label: 'state',
//    value: 'ny'
//  }
//]
// ```
//
// where `label` can be any of (currently):
// - house (generally interpreted as unknown, treated by pelias like a query term)
// - category (like "restaurants")
// - house_number
// - road
// - unit (apt or suite #)
// - suburb (like a neighbourhood)
// - city
// - city_district (like an NYC borough)
// - state_district (like a county)
// - state
// - postcode
// - country
//
// The Pelias query module is not concerned with unit.
//
function setup(libpostalService, should_execute) {
  function controller( req, res, next ){
    // bail early if req/res don't pass conditions for execution
    if (!should_execute(req, res)) {
      return next();
    }

    const initialTime = debugLog.beginTimer(req);

    libpostalService(req, (err, response) => {

      if (err) {
        // push err.message or err onto req.errors
        req.errors.push( _.get(err, 'message', err) );

      } else if (_.some(_.countBy(response, o => o.label), count => count > 1)) {
        logger.warn(`discarding libpostal parse of '${req.clean.text}' due to duplicate field assignments`);
        return next();

      } else if (_.isEmpty(response)) {
        return next();

      } else {

        // apply fixes for known bugs in libpostal
        response = patchBuggyResponses(response);

        req.clean.parser = 'libpostal';
        req.clean.parsed_text = response.reduce(function(o, f) {
          if (field_mapping.hasOwnProperty(f.label)) {
            o[field_mapping[f.label]] = f.value;
          }

          return o;
        }, {});

        if (_.has(req.clean.parsed_text, 'country') && iso3166.isISO2Code(req.clean.parsed_text.country)) {
          req.clean.parsed_text.country = iso3166.convertISO2ToISO3(req.clean.parsed_text.country);
        }

        debugLog.push(req, {parsed_text: req.clean.parsed_text});

      }

      debugLog.stopTimer(req, initialTime);
      return next();

    });

  }

  return controller;
}

const DIAGONAL_DIRECTIONALS = ['ne','nw','se','sw'];

// apply fixes for known bugs in libpostal
function patchBuggyResponses(response){
  if( !Array.isArray(response) || !response.length ){ return response; }

  // known bug where the street name is only a directional, in this case we will merge it
  // with the subsequent element.
  // note: the bug only affects diagonals, not N,S,E,W
  // https://github.com/OpenTransitTools/trimet-mod-pelias/issues/20#issuecomment-417732128
  for( var i=0; i<response.length-1; i++ ){ // dont bother checking the last element
    if( 'road' !== response[i].label ){ continue; }
    if( 'string' !== typeof response[i].value ){ continue; }
    if( 2 !== response[i].value.length ){ continue; }
    if( DIAGONAL_DIRECTIONALS.includes( response[i].value.toLowerCase() ) ){
       if( 'string' !== typeof response[i+1].value ){ continue; }
      response[i].value += ' ' + response[i+1].value; // merge elements
      response.splice(i+1, 1); // remove merged element
      break;
    }
  }

  return response;
}

module.exports = setup;
