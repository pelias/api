const _ = require('lodash');
const iso3166 = require('iso3166-1');
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
        req.clean.parser = 'libpostal';
        req.clean.parsed_text = response.reduce(function(o, f) {
          if (field_mapping.hasOwnProperty(f.label)) {
            o[field_mapping[f.label]] = f.value;
          }

          return o;
        }, {});

        if (_.has(req.clean.parsed_text, 'country') && iso3166.is2(_.toUpper(req.clean.parsed_text.country))) {
          req.clean.parsed_text.country = iso3166.to3(_.toUpper(req.clean.parsed_text.country));
        }

        debugLog.push(req, {parsed_text: req.clean.parsed_text});

      }

      debugLog.stopTimer(req, initialTime);
      return next();

    });

  }

  return controller;
}

module.exports = setup;
