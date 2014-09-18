
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/suggest'),
  require('./controller/search'),
  require('./sanitiser/sanitise'),
  require('./query/indeces'),
  require('./query/suggest'),
  require('./query/search')
];

tests.map(function(t) {
  t.all(tape, common);
});