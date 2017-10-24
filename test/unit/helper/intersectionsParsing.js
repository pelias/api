'use strict';

const _ = require('lodash');
var intersectionsParser = require('../../../helper/intersectionsParsing');

module.exports.tests = {};

module.exports.tests.interface = function (test) {
    test('valid interface', t => {
        t.equal(typeof intersectionsParser, 'function', 'parseIntersections is a function');
        t.end();
    });
};

module.exports.tests.intersectionsParser = function (test) {

    test('parseIntersections', t => {
        t.deepEqual(intersectionsParser('72 and 18'), { street1: '72nd', street2: '18th'},
            'intersectionsParser parsed "72 and 18" correctly!');
        t.end();
    });

    test('parseIntersections', t => {
       t.deepEqual(intersectionsParser('61 & Bay'), { street1: '61st', street2: 'bay'},
            'intersectionsParser parsed "61 and Bay" correctly!');
       t.end();
    });

    test('parseIntersections', t => {
        t.deepEqual(intersectionsParser('73 & e5'), {street1: '73rd', street2: 'East 5th'},
            'intersectionsParser parsed "73 and e5" correctly!');
        t.end();
    });

    test('parseIntersections', t => {
        t.deepEqual(intersectionsParser('25 & w5'), { street1: '25th', street2: 'West 5th'},
            'intersectionsParser parsed "25 and w5" correctly!');
        t.end();
    });

    test('parseIntersections', t => {
        t.deepEqual(intersectionsParser('ne26 & nw5'), { street1: 'Northeast 26th', street2: 'Northwest 5th'},
            'intersectionsParser parsed "26 and nw5" correctly!');
        t.end();
    });

    test('parseIntersections', t => {
        t.deepEqual(intersectionsParser('se26 & sw5'), { street1: 'Southeast 26th', street2: 'Southwest 5th'},
            'intersectionsParser parsed "26 and nw5" correctly!');
         t.end();
    });

};

module.exports.all = (tape, common) => {

    // this part I am not sure about. Subject to review
    function test(name, testFunction) {
        return tape(`intersections: ${name}`, testFunction);
    }

    for( const testCase in module.exports.tests ){
        module.exports.tests[testCase](test, common);
    }
};