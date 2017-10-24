var tape = require('tape'),
    diff = require('difflet')({ indent : 2, comment : true });

var common = {
    // a visual deep diff rendered using console.error()
    diff: function( actual, expected ){
        console.error( diff.compare( actual, expected ) );
    }
};

var tests = [
    require('./helper/intersectionsParsing'),
    require('./controller/predicates/is_intersection_layer')
];

tests.map(function(t) {
    t.all(tape, common);
});
