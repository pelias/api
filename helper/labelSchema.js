var _ = require('lodash'),
    check = require('check-types');

module.exports = {
  'USA': {
    'local': getFirstProperty(['localadmin', 'locality', 'neighbourhood', 'county']),
    'regional': getUsState,
    'country': getFirstProperty(['country_a'])
  },
  'GBR': {
    'local': getFirstProperty(['neighbourhood', 'county', 'localadmin', 'locality', 'region']),
    'regional': getFirstProperty(['county','country','region'])
  },
  'SGP': {
    'local': getFirstProperty(['neighbourhood', 'region', 'county', 'localadmin', 'locality']),
    'regional': getFirstProperty(['county','country','region'])
  },
  'SWE': {
    'local': getFirstProperty(['neighbourhood', 'region', 'county', 'localadmin', 'locality']),
    'regional': getFirstProperty(['country'])
  },
  'default': {
    'local': getFirstProperty(['localadmin', 'locality', 'neighbourhood', 'county', 'region']),
    'regional': getFirstProperty(['country'])
  }
};

// find the first field of record that has a non-empty value that's not already in labelParts
function getFirstProperty(fields) {
  return function(record, labelParts) {
    for (var i = 0; i < fields.length; i++) {
      var fieldValue = record[fields[i]];

      if (check.nonEmptyString(fieldValue) && !_.includes(labelParts, fieldValue)) {
        labelParts.push( fieldValue );
        return labelParts;
      }

    }

    return labelParts;

  };

}

// this function is exclusively used for figuring out which field to use for US States
// 1.  if a US state is the most granular bit of info entered, the label should contain
//  the full state name, eg: Pennsylvania, USA
// 2.  otherwise, the state abbreviation should be used, eg: Lancaster, PA, USA
// 3.  if for some reason the abbreviation isn't available, use the full state name
function getUsState(record, labelParts) {
  if ('region' === record.layer && record.region) {
    // add full state name when state is the most granular piece of info
    labelParts.push(record.region);
  } else if (record.region_a) {
    // otherwise just add the region code when available
    labelParts.push(record.region_a);
  } else if (record.region) {
    // add the full name when there's no region code available ()
    labelParts.push(record.region);
  }

  return labelParts;

}
