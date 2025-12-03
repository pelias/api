const _ = require('lodash');
const Debug = require('../helper/debug');
const debugLog = new Debug('controller:libpostal');

// Find field in libpostal response 
function findField(response, field, replacementField) {
  const libpostalField = response.find(f => f.label === field);

  if (libpostalField) {
    return libpostalField;
  } else if(replacementField) {
    return response.find(f => f.label === replacementField);
  } else {
    return;
  }
}


function setup(libpostalService, should_execute) {
  function controller( req, res, next ){
    // bail early if req/res don't pass conditions for execution
    if (!should_execute(req, res)) {
      return next();
    }

    const start = Date.now();
    libpostalService(req, (err, response) => {
      if (err) {
        // push err.message or err onto req.errors
        req.errors.push( _.get(err, 'message', err) );

      } else {
        // figure out which field contains the probable house number, prefer house_number
        // libpostal parses some inputs, like `3370 cobbe ave`, as a postcode+street
        // so because we're treating the entire field as a street address, it's safe
        // to assume that an identified postcode is actually a house number.
        // if there's a house_number in the libpostal response, return it
        // otherwise return the postcode field (which may be undefined)
        const house_number_field = findField(response, 'house_number', 'postcode');

        // if we're fairly certain that libpostal identified a house number
        // (from either the house_number or postcode field), place it into the
        // number field and remove the first instance of that value from address
        // and assign to street
        // eg - '1090 N Charlotte St' becomes number=1090 and street=N Charlotte St
        if (house_number_field) {
          req.clean.parsed_text.housenumber = house_number_field.value;

          // remove the first instance of the number and trim whitespace
          req.clean.parsed_text.street = _.trim(replaceIgnoreCase(req.clean.parsed_text.address, req.clean.parsed_text.housenumber, ''));

          // If libpostal have parsed unit then add it for search
          const unit_field = findField(response, 'unit');
          if(unit_field) {
            req.clean.parsed_text.unit = unit_field.value;
            // Removing unit from street and trim
            req.clean.parsed_text.street = _.trim(replaceIgnoreCase(req.clean.parsed_text.street, req.clean.parsed_text.unit, ''));
          }

        } else {
          // otherwise no house number was identifiable, so treat the entire input
          // as a street
          req.clean.parsed_text.street = req.clean.parsed_text.address;

        }

        // the address field no longer means anything since it's been parsed, so remove it
        delete req.clean.parsed_text.address;

        debugLog.push(req, {
          parsed_text: response,
          duration: Date.now() - start
        });
      }
      
      return next();

    });

  }

  return controller;
}

function replaceIgnoreCase(str, match, replacement) {
  if (!_.isString(str) || !str.length) { return ''; }
  return str.replace(new RegExp(_.escapeRegExp(match), 'i'), replacement);
}

module.exports = setup;
