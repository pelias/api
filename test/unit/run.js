
var tape = require('tape');
var common = {};

var tests = [
  require('./controller/index'),
  require('./controller/suggest')
];

tests.map(function(t) {
  t.all(tape, common);
});