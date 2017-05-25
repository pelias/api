const _ = require('lodash');
const proxyquire =  require('proxyquire').noCallThru();
const mock_logger = require('pelias-mock-logger');

const sortResponseData = require('../../../middleware/sortResponseData');

module.exports.tests = {};

module.exports.tests.should_execute_failure = (test, common) => {
  test('should_execute returning false should call next w/o invoking comparator', (t) => {
    t.plan(2, 'this ensures that should_execute was invoked');

    const comparator = () => {
      throw Error('should not have been called');
    };

    const should_execute = (req, res) => {
      t.deepEquals(req, { a: 1 });
      t.deepEquals(res, { b: 2 });
      return false;
    };

    const sort = sortResponseData(comparator, should_execute);

    const req = { a: 1 };
    const res = { b: 2 };

    sort(req, res, () => {
      t.end();
    });

  });

};

module.exports.tests.general_tests = (test, common) => {
  test('req.clean should be passed to sort', (t) => {
    t.plan(1, 'this ensures that comparator was invoked');

    const comparator = (clean) => {
      t.deepEquals(clean, { a: 1 });
      return () => {
        throw Error('should not have been called');
      };
    };

    const sort = sortResponseData(comparator, _.constant(true));

    const req = {
      clean: {
        a: 1
      }
    };

    const res = {
      data: [ {} ]
    };

    sort(req, res, () => {
      t.end();
    });

  });

  test('undefined res.data should return without interacting with comparator', (t) => {
    const comparator = () => {
      throw Error('should not have been called');
    };

    const sort = sortResponseData(comparator, _.constant(true));

    const req = {};
    const res = {};

    sort(req, res, () => {
      t.deepEquals(res, {});
      t.end();
    });

  });

  test('empty res.data should return without interacting with comparator', (t) => {
    const comparator = () => {
      throw Error('should not have been called');
    };

    const sort = sortResponseData(comparator, _.constant(true));

    const req = {};
    const res = {
      data: []
    };

    sort(req, res, () => {
      t.deepEquals(res.data, [], 'res.data should still be empty');
      t.end();
    });

  });

};

module.exports.tests.successful_sort = (test, common) => {
  test('comparator should be sort res.data', (t) => {
    const logger = mock_logger();

    const comparator = () => {
      return (a, b) => {
        return a._id > b._id;
      };
    };

    const sortResponseData = proxyquire('../../../middleware/sortResponseData', {
      'pelias-logger': logger
    });

    const sort = sortResponseData(comparator, _.constant(true));

    const req = {
      clean: {
        field: 'value'
      }
    };
    const res = {
      data: [
        { _id: 3 },
        { _id: 2 },
        { _id: 1 },
      ]
    };

    sort(req, res, () => {
      t.deepEquals(res.data.shift(), { _id: 1 });
      t.deepEquals(res.data.shift(), { _id: 2 });
      t.deepEquals(res.data.shift(), { _id: 3 });

      t.ok(logger.isDebugMessage(
        'req.clean: {"field":"value"}, pre-sort: [3,2,1], post-sort: [1,2,3]'));

      t.end();
    });

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`[middleware] sortResponseData: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
