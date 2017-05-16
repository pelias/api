const sortResponseData = require('../../../middleware/sortResponseData');

module.exports.tests = {};

module.exports.tests.doIt = (test, common) => {
  test('{} should be passed to comparator when req is unavailable', (t) => {
    const comparator = (clean) => {
      t.deepEquals(clean, { });
      return () => {
        throw Error('should not have been called');
      };
    };

    const sort = sortResponseData(comparator);

    const res = {
      data: [ {} ]
    };

    sort(undefined, res, () => {
      t.end();
    });

  });

  test('{} should be passed to comparator when req.clean is unavailable', (t) => {
    const comparator = (clean) => {
      t.deepEquals(clean, { });
      return () => {
        throw Error('should not have been called');
      };
    };

    const sort = sortResponseData(comparator);

    const req = {};

    const res = {
      data: [ {} ]
    };

    sort(req, res, () => {
      t.end();
    });

  });

  test('req.clean should be passed to sort', (t) => {
    const comparator = (clean) => {
      t.deepEquals(clean, { a: 1 });
      return () => {
        throw Error('should not have been called');
      };
    };

    const sort = sortResponseData(comparator);

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

  test('undefined res should return without interacting with comparator', (t) => {
    const comparator = () => {
      throw Error('should not have been called');
    };

    const sort = sortResponseData(comparator);

    sort(undefined, undefined, () => {
      t.end();
    });

  });

  test('undefined res.data should return without interacting with comparator', (t) => {
    const comparator = () => {
      throw Error('should not have been called');
    };

    const sort = sortResponseData(comparator);

    const res = {};

    sort(undefined, res, () => {
      t.deepEquals(res, {});
      t.end();
    });

  });

  test('empty res.data should not cause problems', (t) => {
    const comparator = () => {
      throw Error('should not have been called');
    };

    const sort = sortResponseData(comparator);

    const res = {
      data: []
    };

    sort(undefined, res, () => {
      t.deepEquals(res.data, [], 'res.data should still be empty');
      t.end();
    });

  });

  test('comparator should be consulted for sorting res.data when defined', (t) => {
    const comparator = () => {
      return (a, b) => {
        return a.key > b.key;
      };
    };

    const sort = sortResponseData(comparator);

    const res = {
      data: [
        { key: 3 },
        { key: 2 },
        { key: 1 },
      ]
    };

    sort(undefined, res, () => {
      t.deepEquals(res.data.shift(), { key: 1 });
      t.deepEquals(res.data.shift(), { key: 2 });
      t.deepEquals(res.data.shift(), { key: 3 });
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
