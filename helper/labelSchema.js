var _ = require('lodash');

module.exports = {
  'default': {
    'local': getFirstProperty(['locality', 'localadmin']),
    'country': getFirstProperty(['country'])
  },
  'GBR': {
    'local': getFirstProperty(['locality', 'localadmin']),
    'regional': getFirstProperty(['macroregion']),
    'country': getFirstProperty(['country'])
  },
  'USA': {
    'borough': getFirstProperty(['borough']),
    'local': getFirstProperty(['locality', 'localadmin', 'county']),
    'regional': getUsOrCaOrAusState,
    'country': getUSACountryValue
  },
  'AUS': {
    'local' : getFirstProperty(['locality', 'localadmin']),
    'regional' : getUsOrCaOrAusState,
    'country': getFirstProperty(['country'])
  },
  'CAN': {
    'local': getFirstProperty(['locality']), // no localadmins in CAN
    'regional': getUsOrCaOrAusState,
    'country': getFirstProperty(['country'])
  }
};

// find the first field of record that has a non-empty value that's not already in labelParts
function getFirstProperty(fields) {
  return function(record) {
    for (var i = 0; i < fields.length; i++) {
      var fieldValue = record[fields[i]];

      if (!_.isEmpty(fieldValue)) {
        return fieldValue;
      }

    }

  };

}

// this function is exclusively used for figuring out which field to use for US/CA States
// 1.  if a US/CA state is the most granular bit of info entered, the label should contain
//  the full state name, eg: Pennsylvania, USA and Ontario, CA
// 2.  otherwise, the state abbreviation should be used, eg: Lancaster, PA, USA and Bruce, ON, CA
// 3.  if for some reason the abbreviation isn't available, use the full state name
function getUsOrCaOrAusState(record) {
  if ('region' === record.layer && record.region) {
    // return full state name when state is the most granular piece of info
    return record.region;

  } else if (record.region_a) {
    // otherwise just return the region code when available
    return record.region_a;

  } else if (record.region) {
    // return the full name when there's no region code available
    return record.region;

  }

}

// this function returns the full name of a country if the result is in the
// country layer (for "United States" record).  It returns the abbreviation
// otherwise (eg - Lancaster, PA, USA).
function getUSACountryValue(record) {
  if ('country' === record.layer && record.country) {
    return record.country;
  }

  return record.country_a;
}
