'use strict';

module.exports = class MockQuery {
  constructor() {
    this._score_functions = [];
    this._sort_functions = [];
    this._filter_functions = [];
  }

  render(vs) {
    return {
      vs: vs,
      score_functions: this._score_functions,
      sort_functions: this._sort_functions,
      filter_functions: this._filter_functions
    };
  }

  score(view) {
    this._score_functions.push(view);
    return this;
  }

  sort(view) {
    this._sort_functions.push(view);
    return this;
  }

  filter(view) {
    this._filter_functions.push(view);
    return this;
  }

};
