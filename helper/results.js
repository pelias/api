
var picker = function( results, size ){
  var combined = [];
  var num_results = 0;

  for (var i=0; i<results.length && num_results<size; i++) {
    if (results[i] && results[i].length) {
      combined[i] = combined[i] || [];
      combined[i].push(results[i][0]);
      results[i].splice(0,1);
      num_results++;
    } else {
      results.splice(i,1);
      i--;
    }
    
    if (i === results.length-1) {
      i=0;
    }
  }
  return (combined.length > 0) ? sort_by_score(combined) : combined;
};

var dedup = function(arr) {
  var unique_ids = [];
  return arr.filter(function(item, pos) {
    if (unique_ids.indexOf(item.name.default) === -1) {
      unique_ids.push(item.name.default);
      return true;
    }
    return false;
  });
};

var sort_by_score = function(arr) {
  return arr.map(function(doc) {
    return doc.sort(function(a,b) {
      return b.score - a.score;
    });
  }).reduce(function(a,b) { //flatten
    return a.concat(b);
  });
};

module.exports = {
  picker: picker,
  dedup: dedup
};