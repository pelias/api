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
  house_number:   'housenumber',
  road:           'street',
  suburb:         'neighbourhood',
  city_district:  'borough',
  city:           'city',
  state_district: 'county',
  state:          'state',
  postcode:       'postalcode',
  country:        'country',
  unit:           'unit',
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

    const start = Date.now();
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

        debugLog.push(req, {
          parsed_text: req.clean.parsed_text,
          duration: Date.now() - start
        });
      }

      return next();
    });
  }

  return controller;
}

const RECAST_LABELS = [{ value: 'zoo', label: { to: 'house' } }];
const DIAGONAL_DIRECTIONALS = ['ne','nw','se','sw'];
const IS_NUMERIC_REGEXP = /^\d+$/;

// apply fixes for known bugs in libpostal
function patchBuggyResponses(response){
  if( !Array.isArray(response) || !response.length ){ return response; }

  // patches which are only applied when a single label is generated
  if( response.length === 1 ){
    let first = response[0];

    // given only a number, libpostal will attempt to classify it.
    // if we find a single label which is entirely numeric then it's recast to the
    // libpostal label 'house', which is mapped to 'query' in our schema.
    // note: there is a possibility that the number is correctly parsed as
    // a unit or housenumber, but this case is rare and the parse inconsistent.
    // eg: libpostal parses: 99=neighbourhood, 9=city
    if( IS_NUMERIC_REGEXP.test(( first.value || '' )) ){
      first.label = 'house';
      return response;
    }

    // recast labels for certain values, currently only applied to parses which return a single label.
    // the RECAST_LABELS array contains match/replace conditions which are applied in order.
    // the 'value' and 'label.to' properties are mandatory, they define the value to match on and
    // the replacement label to assign. you may optionally also provide 'label.from' which will restrict
    // replacements to only records with BOTH a matching 'value' and a matching 'label.from'.
    RECAST_LABELS.forEach(recast => {
      if( !_.has(recast, 'label') || !_.has(recast.label, 'to') ){ return; }
      if( recast.value !== first.value ){ return; }
      if( _.has(recast.label, 'from') && recast.label.from !== first.label ){ return; }
      first.label = recast.label.to;
    });
  }

  // generate an index to avoid multiple iterations over the response array
  let idx = {};
  response.forEach((res, pos) => idx[res.label] = _.assign({ _pos: pos }, res));

  // known bug where the road name directional is parsed into an adjacent label, in
  // this case we will merge it with the road label.
  // note: the bug only affects diagonals, not N,S,E,W
  // https://github.com/OpenTransitTools/trimet-mod-pelias/issues/20#issuecomment-417732128
  if (_.size(response) > 1) {

    // find the road label
    const road = _.get(idx, 'road');
    if (_.isPlainObject(road) && _.isString(road.value)) {

      // find the label which directly follows the road label
      const next = _.nth(response, road._pos + 1);
      if (_.isPlainObject(next) && _.isString(next.value)) {

        // detect the two different occurrences of the bug
        if (
          // where the road label contains the directional
          // eg. { 'label':'road', 'value':'nw' }, { 'label':'suburb', 'value':'foo st' }
          (_.size(road.value) === 2 && DIAGONAL_DIRECTIONALS.includes(road.value.toLowerCase())) ||

          // or where the following label contains the directional
          // eg. { 'label':'road', 'value':'foo st' }, { 'label':'suburb', 'value':'nw' }
          (_.size(next.value) === 2 && DIAGONAL_DIRECTIONALS.includes(next.value.toLowerCase()))
        ) {
          // concatenate the two labels
          response[road._pos].value += ` ${next.value}`;

          // remove the obsolete label
          _.pullAt(response, road._pos + 1);
        }
      }
    }
  }

  // known bug where Australian unit numbers are incorrectly included in the house_number label
  // note: in the case where a 'unit' label already exists, do nothing.
  // https://github.com/pelias/pelias/issues/753
  let unit = _.get(idx, 'unit');
  let house_number = _.get(idx, 'house_number');
  if( _.isPlainObject(house_number) && !_.isPlainObject(unit) && _.isString(house_number.value) ){
    let split = _.trim(_.trim(house_number.value),'/').split('/');
    if( split.length === 2 ){
      response[house_number._pos].value = _.trim(split[1]); // second part (house number)
      response.push({ label: 'unit', value: _.trim(split[0]) }); // first part (unit number)
    }
  }

  // union square should be venue, not neighbourhood
  let suburb = _.get(idx, 'suburb');
  // change suburb to house (turned into 'query' by pelias)
  if (suburb && suburb.label === 'suburb' && suburb.value === 'union square') {
    _.pullAt(response, suburb._pos);
    response.push({ label: 'house', value: suburb.value });
  }

  return response;
}

module.exports = setup;
