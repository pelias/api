// This query is useful for specifying all the combinations of inputs starting
// from most granular to least granular.  For example, given the input:
// `30 w 26th street, new york, ny, usa`
// the following pseudo-query would be generated:
//
// - (housenumber=30 && street=w 26th street && city=new york && state=ny && country=usa) ||
// - (city=new york && state=ny && country=usa) ||
// - (state=ny && country=usa) ||
// - (country=usa)
//
// That is, it specifies as much as possible from the analyzed form, then falling
// back in decreasing granularity.
//
// In the event of an input like `Socorro, Pennsylvania, Canada` where there is
// no city named Socorro in Pennsylvania and there is no region named Pennsylvania
// in Canada, the single result would be for country=Canada
//
// In the case that a full street+city+state+country is correct and found, all
// OR'd queries will return results so only the most specific result should be
// retained
//
// If the analyzed input contains both a query and housenumber+street, then
// the constructured query searches for the query term in the context of the coarse
// inputs, then falls back to the housenumber+street.  It's important to not
// search for the query term and housenumber+street at the same time because
// only venues matching the query term at that exact housenumber+street would
// be returned.

var _ = require('lodash');
var baseQuery = require('./baseQuery');

const match_phrase = require('./match_phrase');
const fuzzy_street_match = require('./fuzzy_street_match');

function Layout(){
    this._score = [];
    this._filter = [];
}

Layout.prototype.score = function( view ){
    this._score.push( view );
    return this;
};

Layout.prototype.filter = function( view ){
    this._filter.push( view );
    return this;
};

function addPrimary(value, layer, fields, likely_to_have_abbreviation) {
    // base primary query should match on layer and one of the admin fields via
    // multi_match
    var o = {
        bool: {
            _name: 'fallback.' + layer,
            must: [
                {
                    multi_match: {
                        query: value,
                        type: 'phrase',
                        fields: fields
                    }
                }
            ],
            filter: {
                term: {
                    layer: layer
                }
            }
        }
    };

    // When the value is likely to have abbreviations, as in the case of regions
    //  and countries, don't add the must match on phrase.default.  For example,
    //  when the input 'Socorro, PA' falls back to just 'PA' (because there's no
    //  place in PA called Socorro), forcing a phrase match on 'PA' would fail
    //  since the indexed value is 'Pennsylvania', not 'PA'.  Having this conditional
    //  here allows primary matches in regions and countries, where there is less
    //  danger of analysis ambiguity, to only have to match on region/region_a or
    //  country/country_a.  Commented out to show intent.
    //
    // if (!likely_to_have_abbreviation) {
    //   o.bool.must.push(
    //     {
    //       match_phrase: {
    //         'phrase.default': {
    //           query: value
    //         }
    //       }
    //     }
    //   );
    // }

    return o;

}

// Secondary matches are for less granular administrative areas that have been
// specified.  For example, in "Socorro, NM", "Socorro" is primary, whereas
// "NM" is secondary.
function addSecondary(value, fields) {
    return {
        multi_match: {
            query: value,
            type: 'phrase',
            fields: fields
        }
    };

}

// add the postal code if supplied
function addSecPostCode(vs, o) {
    // add postcode if specified
    if (vs.isset('input:postcode')) {
        o.bool.should.push(
            match_phrase('address_parts.zip', vs.var('input:postcode'))
        );
    }
}

function addSecNeighbourhood(vs, o) {
    // add neighbourhood if specified
    if (vs.isset('input:neighbourhood')) {
        o.bool.must.push(addSecondary(
            vs.var('input:neighbourhood').toString(),
            [
                'parent.neighbourhood',
                'parent.neighbourhood_a'
            ]
        ));
    }
}

function addSecBorough(vs, o) {
    // add borough if specified
    if (vs.isset('input:borough')) {
        o.bool.must.push(addSecondary(
            vs.var('input:borough').toString(),
            [
                'parent.borough',
                'parent.borough_a'
            ]
        ));
    }
}

function addSecLocality(vs, o) {
    // add locality if specified
    if (vs.isset('input:locality')) {
        o.bool.must.push(addSecondary(
            vs.var('input:locality').toString(),
            [
                'parent.locality',
                'parent.locality_a',
                'parent.localadmin',
                'parent.localadmin_a'
            ]
        ));
    }
}

function addSecCounty(vs, o) {
    // add county if specified
    if (vs.isset('input:county')) {
        o.bool.must.push(addSecondary(
            vs.var('input:county').toString(),
            [
                'parent.county',
                'parent.county_a',
                'parent.macrocounty',
                'parent.macrocounty_a'
            ]
        ));
    }
}

function addSecRegion(vs, o) {
    // add region if specified
    if (vs.isset('input:region')) {
        o.bool.must.push(addSecondary(
            vs.var('input:region').toString(),
            [
                'parent.region',
                'parent.region_a',
                'parent.macroregion',
                'parent.macroregion_a'
            ]
        ));
    }
}

function addSecCountry(vs, o) {
    // add country if specified
    if (vs.isset('input:country')) {
        o.bool.must.push(addSecondary(
            vs.var('input:country').toString(),
            [
                'parent.country',
                'parent.country_a',
                'parent.dependency',
                'parent.dependency_a'
            ]
        ));
    }
}


function addQuery(vs) {
    var o = addPrimary(
        vs.var('input:query').toString(),
        'venue',
        [
            'phrase.default'
        ],
        false
    );

    addSecNeighbourhood(vs, o);
    addSecBorough(vs, o);
    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addUnitAndHouseNumberAndStreet(vs) {
    var o = {
        bool: {
            _name: 'fallback.address',
            must: [
                match_phrase('address_parts.unit', vs.var('input:unit')),
                match_phrase('address_parts.number', vs.var('input:housenumber')),
                fuzzy_street_match(vs)
            ],
            should: [],
            filter: {
                term: {
                    layer: 'address'
                }
            }
        }
    };

    if (vs.isset('boost:address')) {
        o.bool.boost = vs.var('boost:address');
    }

    addSecPostCode(vs, o);
    addSecNeighbourhood(vs, o);
    addSecBorough(vs, o);
    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;
}

function addHouseNumberAndStreet(vs) {
    var o = {
        bool: {
            _name: 'fallback.address',
            must: [
                match_phrase('address_parts.number', vs.var('input:housenumber')),
                fuzzy_street_match(vs)
            ],
            should: [],
            filter: {
                term: {
                    layer: 'address'
                }
            }
        }
    };

    if (vs.isset('boost:address')) {
        o.bool.boost = vs.var('boost:address');
    }

    addSecPostCode(vs, o);
    addSecNeighbourhood(vs, o);
    addSecBorough(vs, o);
    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addStreet(vs) {
    var o = {
        bool: {
            _name: 'fallback.street',
            must: [
                fuzzy_street_match(vs)
            ],
            should: [],
            filter: {
                term: {
                    layer: 'street'
                }
            }
        }
    };

    if (vs.isset('boost:street')) {
        o.bool.boost = vs.var('boost:street');
    }

    addSecPostCode(vs, o);
    addSecNeighbourhood(vs, o);
    addSecBorough(vs, o);
    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addNeighbourhood(vs) {
    var o = addPrimary(
        vs.var('input:neighbourhood').toString(),
        'neighbourhood',
        [
            'parent.neighbourhood',
            'parent.neighbourhood_a'
        ],
        false
    );

    addSecBorough(vs, o);
    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addBorough(vs) {
    var o = addPrimary(
        vs.var('input:borough').toString(),
        'borough',
        [
            'parent.borough',
            'parent.borough_a'
        ],
        false
    );

    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addLocality(vs) {
    var o = addPrimary(vs.var('input:locality').toString(),
        'locality', ['parent.locality', 'parent.locality_a'], false);

    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addLocalAdmin(vs) {
    var o = addPrimary(vs.var('input:locality').toString(),
        'localadmin', ['parent.localadmin', 'parent.localadmin_a'], false);

    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addCounty(vs) {
    var o = addPrimary(
        vs.var('input:county').toString(),
        'county',
        [
            'parent.county',
            'parent.county_a'
        ],
        false
    );

    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addMacroCounty(vs) {
    var o = addPrimary(
        vs.var('input:county').toString(),
        'macrocounty',
        [
            'parent.macrocounty',
            'parent.macrocounty_a'
        ],
        false
    );

    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}

function addRegion(vs) {
    var o = addPrimary(
        vs.var('input:region').toString(),
        'region',
        [
            'parent.region',
            'parent.region_a'
        ],
        true
    );

    addSecCountry(vs, o);

    return o;

}

function addMacroRegion(vs) {
    var o = addPrimary(
        vs.var('input:region').toString(),
        'macroregion',
        [
            'parent.macroregion',
            'parent.macroregion_a'
        ],
        true
    );

    addSecCountry(vs, o);

    return o;

}

function addDependency(vs) {
    var o = addPrimary(
        vs.var('input:country').toString(),
        'dependency',
        [
            'parent.dependency',
            'parent.dependency_a'
        ],
        true
    );

    return o;

}

function addCountry(vs) {
    var o = addPrimary(
        vs.var('input:country').toString(),
        'country',
        [
            'parent.country',
            'parent.country_a'
        ],
        true
    );

    return o;

}

function addPostCode(vs) {
    var o = addPrimary(
        vs.var('input:postcode').toString(),
        'postalcode',
        [
            'parent.postalcode'
        ],
        false
    );

    // same position in hierarchy as borough according to WOF
    // https://github.com/whosonfirst/whosonfirst-placetypes#here-is-a-pretty-picture
    addSecLocality(vs, o);
    addSecCounty(vs, o);
    addSecRegion(vs, o);
    addSecCountry(vs, o);

    return o;

}


Layout.prototype.render = function( vs ){
    var q = Layout.base( vs );

    var funcScoreShould = q.query.function_score.query.bool.should;

    if (vs.isset('input:query')) {
        funcScoreShould.push(addQuery(vs));
    }
    if (vs.isset('input:unit') && vs.isset('input:housenumber') && vs.isset('input:street')) {
        funcScoreShould.push(addUnitAndHouseNumberAndStreet(vs));
    }
    else if (vs.isset('input:housenumber') && vs.isset('input:street')) {
        funcScoreShould.push(addHouseNumberAndStreet(vs));
    }
    if (vs.isset('input:postcode')) {
        funcScoreShould.push(addPostCode(vs));
    }
    if (vs.isset('input:street')) {
        funcScoreShould.push(addStreet(vs));
    }
    if (vs.isset('input:neighbourhood')) {
        funcScoreShould.push(addNeighbourhood(vs));
    }
    if (vs.isset('input:borough')) {
        funcScoreShould.push(addBorough(vs));
    }
    if (vs.isset('input:locality')) {
        funcScoreShould.push(addLocality(vs));
        funcScoreShould.push(addLocalAdmin(vs));
    }
    if (vs.isset('input:county')) {
        funcScoreShould.push(addCounty(vs));
        funcScoreShould.push(addMacroCounty(vs));
    }
    if (vs.isset('input:region')) {
        funcScoreShould.push(addRegion(vs));
        funcScoreShould.push(addMacroRegion(vs));
    }
    if (vs.isset('input:country')) {
        funcScoreShould.push(addDependency(vs));
        funcScoreShould.push(addCountry(vs));
    }

    // handle scoring views under 'query' section (both 'must' & 'should')
    if( this._score.length ){
        this._score.forEach( function( view ){
            var rendered = view( vs );
            if( rendered ){
                q.query.function_score.functions.push( rendered );
            }
        });
    }

    // handle filter views under 'filter' section (only 'must' is allowed here)
    if( this._filter.length ){
        this._filter.forEach( function( view ){
            var rendered = view( vs );
            if( rendered ){
                if( !q.query.function_score.query.bool.hasOwnProperty( 'filter' ) ){
                    q.query.function_score.query.bool.filter = {
                        bool: {
                            must: []
                        }
                    };
                }
                q.query.function_score.query.bool.filter.bool.must.push( rendered );
            }
        });
    }

    return q;
};

Layout.base = function( vs ){
    var baseQueryCopy = _.cloneDeep(baseQuery);

    baseQueryCopy.size = vs.var('size');
    baseQueryCopy.track_scores = vs.var('track_scores');

    return baseQueryCopy;

};

module.exports = Layout;
