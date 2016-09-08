var _ = require('lodash');
var labelGenerator = require('../helper/labelGenerator');
var nameExpansions = require('../helper/nameExpansions');

function setup() {
  return addLabels;
}

function addLabels(req, res, next) {
  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  var lang;
  if (req.clean) {
    lang = req.clean.lang;
  }
  lang = lang || 'default';

  var data = res.data;

  // create initial labels
  data.forEach(function(place) {
    place.label = labelGenerator(place);
  });

  // then check duplicates and add details until (hopefully) all unique
  var todo = [];
  for (var ci = 0; ci < data.length; ci++) {
    todo.push(ci);  // indices of unprocessed items
  }

  while(todo.length>0) {
    var current = []; // indices of the next set of identical labels to process
    current.push(todo.pop()); // order does not matter, just take the last
    var label = data[current[0]].label;
    var len = todo.length;
    var j = 0; // current index in todo arr
    for (var i=0; i<len; i++) {
      var val = todo[j];
      if(data[val].label === label) {
        current.push(val);
        todo.splice(j, 1);
      } else {
        j++; // move to next index
      }
    }

    for(var exp = 0; exp < nameExpansions.lenght; exp++) {
      len = current.length;
      if(len < 2 ) { // single item is unique, nothing to do
        break;
      }

      var referenceSet = []; // some expansions might wish to know other items
      for(var ri=0; ri<current.length; ri++) {
        referenceSet.push(data[current[ri]]);
      }

      var expandedNames = nameExpansions[exp](referenceSet, lang);

      // see if that helped - if all still identical, skip the useless expansion
      if (!differentArrayItems(expandedNames)) {
        continue;
      }

      // assign expanded names to docs
      for(var ei=0; ei<current.length; ei++) {
        data[current[ei]].name = expandedNames[current[ei]];
      }

      // regenerate labels for unique cases and  remove them from current set
      j = 0;
      len=current.length;
      for (var k=0; k<len; k++) {
        var cj = current[j];
        if(uniqueArrayItem(expandedNames, cj)) {
          data[cj].label = labelGenerator(data[cj]);
          current.splice(j, 1);
        } else {
          j++; // next index
        }
      }
    }

    // all expansions done. Assign expanded labels although there can be non-unique cases
    for(var li=0; li<current.length; li++) {
      data[current[li]].label = labelGenerator(data[current[li]]);
    }
  }

  next();
}

function differentArrayItems(arr) {
  var len = arr.length;
  for(var i=0; i<len; i++) {
    for(var j=i+1; j<len; j++) {
      if(arr[i] !== arr[j]) {
        return true;
      }
    }
  }
  // all identical
  return false;
}

function uniqueArrayItem(arr, i) {
  for(var j=0; j<arr.length; j++) {
    if(i !== j && arr[i] === arr[j]) {
      return false;
    }
  }
  return true;
}

module.exports = setup;
