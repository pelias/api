const _ = require('lodash');
const Debug = require('../helper/debug');
const debugLog = new Debug('controller:libpostal');
const logger = require('pelias-logger').get('api');

// if there's a house_number in the libpostal response, return it
// otherwise return the postcode field (which may be undefined)
function findHouseNumberField(response) {
  const house_number_field = response.find(f => f.label === 'house_number');

  if (house_number_field) {
    return house_number_field;
  }

  return response.find(f => f.label === 'postcode');

}

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

      } else {
        // figure out which field contains the probable house number, prefer house_number
        // libpostal parses some inputs, like `3370 cobbe ave`, as a postcode+street
        // so because we're treating the entire field as a street address, it's safe
        // to assume that an identified postcode is actually a house number.
        const house_number_field = findHouseNumberField(response);

        // if we're fairly certain that libpostal identified a house number
        // (from either the house_number or postcode field), place it into the
        // number field and remove the first instance of that value from address
        // and assign to street
        // eg - '1090 N Charlotte St' becomes number=1090 and street=N Charlotte St
        if (house_number_field) {
          req.clean.parsed_text.number = house_number_field.value;

          // remove the first instance of the number and trim whitespace
          req.clean.parsed_text.street = _.trim(_.replace(req.clean.parsed_text.address, req.clean.parsed_text.number, ''));

        } else {
          // otherwise no house number was identifiable, so treat the entire input
          // as a street
          req.clean.parsed_text.street = req.clean.parsed_text.address;

        }

        // the address field no longer means anything since it's been parsed, so remove it
        delete req.clean.parsed_text.address;

        debugLog.push(req, {parsed_text: response});

      }

      debugLog.stopTimer(req, initialTime);
      return next();

    });

  }

  return controller;
}

module.exports = setup;
