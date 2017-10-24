'use strict';

const _ = require('lodash');
const is_intersection_layer = require('../../../../controller/predicates/is_intersection_layer');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
    test('valid interface', t => {
        t.ok(_.isFunction(is_intersection_layer), 'is_intersection_layer is a function');
        t.end();
    });
};

module.exports.tests.true_conditions = (test, common) => {
    test('"Main & Broadway" should return true', t => {
        const req = {};
        req.query = {};
        req.query.text = 'Main & Broadway';

        t.ok(is_intersection_layer(req));
        t.end();
    });

    test('"23rd and 5th" should return true', t => {
        const req = {};
        req.query = {};
        req.query.text = '23rd and 5th';

        t.ok(is_intersection_layer(req));
        t.end();
    });

    test('"73rd& Bay pkwy" should return true', t => {
        const req = {};
        req.query = {};
        req.query.text = '73rd& Bay pkwy';

        t.ok(is_intersection_layer(req));
        t.end();
    });

    test('"73rd&Broadway" should return true', t => {
        const req = {};
        req.query = {};
        req.query.text = '73rd&Bay pkwy';

        t.ok(is_intersection_layer(req));
        t.end();
    });
};

module.exports.tests.false_conditions = (test, common) => {
    test('undefined request should return false', t => {
        t.notOk(is_intersection_layer(undefined));
        t.end();
    });

    test('"Nostrand Avenue" should return false', t => {
        const req = {};
        req.query = {};
        req.query.text = 'Nostrand Avenue';

        t.notOk(is_intersection_layer(req));
        t.end();
    });
};

module.exports.all = (tape, common) => {
    function test(name, testFunction) {
        return tape(`GET /is_intersection_layer ${name}`, testFunction);
    }

    for( const testCase in module.exports.tests ){
        module.exports.tests[testCase](test, common);
    }
};