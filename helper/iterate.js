var _ = require('lodash');

// iterate(array1, array2, ..., cb)
// If array1 is an array, then iterate over the arrays, passing them and the
// index to the callback. If array1 is not an array, all arguments are assumed
// to be singletons, and the callback is just called once.
function iterate() {
  var args = Array.prototype.slice.call(arguments);
  var cb = args.pop();

  if(Array.isArray(args[0])) {
    args[0].forEach(function(unused, n) {
      // Get the nth item from each array. Basically zip, but not all
      // precomputed.
      var cbArgs = args.map(function(arr) { return arr && arr[n]; });
      // Add the index in case the callback cares.
      cbArgs.push(n);
      var signal = cb.apply(cb, cbArgs);
      if(signal === false) {
        return;
      }
    });
  } else {
    args.push(0);
    cb.apply(cb, args);
  }
}

module.exports = iterate;
