var iso3166 = require('../../../helper/iso3166');

module.exports.tests = {};

module.exports.tests.recognizingISOCodes = function(test, common) {
  test('Recognizes iso2 codes', function(t) {
    t.true(iso3166.isISO2Code('US'));
    t.true(iso3166.isISO2Code('Us'));
    t.false(iso3166.isISO2Code('xx'));
    t.end();
  });

  test('Recognizes iso3 codes', function(t) {
    t.true(iso3166.isISO3Code('USA'));
    t.true(iso3166.isISO3Code('UsA'));
    t.false(iso3166.isISO3Code('xxx'));
    t.end();
  });
};

module.exports.tests.convertingISOCodes = function(test, common) {
  test('converts iso2 to iso3', function(t) {
    t.equal('USA', iso3166.convertISO2ToISO3('uS'));
    t.equal('FRA', iso3166.convertISO2ToISO3('FR'));
    t.equal('FRA', iso3166.convertISO2ToISO3('Fr'));
    t.equal(undefined, iso3166.convertISO2ToISO3('uSa'));
    t.equal(undefined, iso3166.convertISO2ToISO3('xx'));
    t.end();
  });

  test('converts iso3 to iso2', function(t) {
    t.equal('US', iso3166.convertISO3ToISO2('uSa'));
    t.equal('FR', iso3166.convertISO3ToISO2('fra'));
    t.equal('FR', iso3166.convertISO3ToISO2('frA'));
    t.equal(undefined, iso3166.convertISO3ToISO2('xxx'));
    t.equal(undefined, iso3166.convertISO3ToISO2('fr'));
    t.end();
  });
};

module.exports.tests.getISO3Code = function(test, common) {
  test('Gets iso 3 code for iso 2 code', function(t) {
    t.equal('USA', iso3166.iso3Code('uS'));
    t.equal('FRA', iso3166.iso3Code('fr'));
    t.equal(undefined, iso3166.iso3Code('xxx'));
    t.end();
  });

  test('Recognizes and returns existing ISO 3 code', function(t) {
    t.equal('USA', iso3166.iso3Code('USA'));
    t.equal('FRA', iso3166.iso3Code('FRA'));
    t.end();
  });

  test('Upcases given ISO3 code if needed', function(t) {
    t.equal('USA', iso3166.iso3Code('UsA'));
    t.equal('USA', iso3166.iso3Code('usa'));
    t.equal('FRA', iso3166.iso3Code('FRa'));
    t.end();
  });
};

module.exports.all = function (test, common) {
  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
