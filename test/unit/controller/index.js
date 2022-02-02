var setup = require('../../../controller/markdownToHtml');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.equal(typeof setup({}, './public/apiDoc.md'), 'function', 'setup returns a controller');
    t.end();
  });
};

module.exports.tests.info_html = function(test, common) {
  test('returns server info in html', function(t) {
    var filePath = './foo.md';

    var style = '<style>html { font-family:monospace; }</style>';
    var mockText = 'this text should show up in the html content';
    var fsMock = {
      readFileSync: function (path, format) {
        t.equal(path, filePath, 'open specified file');
        t.equal(format, 'utf8', 'file format');
        return mockText;
      }
    };

    var proxyquire = require('proxyquire');
    var setup = proxyquire('../../../controller/markdownToHtml', { 'fs': fsMock });

    var config = { version: '1.1.1' };

    var controller = setup(config, filePath);
    var req = {
      accepts: function () {
        return true;
      }
    };
    var res = { send: function( content ){
      t.equal(typeof content, 'string', 'returns string');
      t.assert(content.includes(style), 'style set');
      t.assert(content.includes(mockText), 'file content added');
      t.end();
    }};
    controller( req, res );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('GET / ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
