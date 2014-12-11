
/**

  cmd can be any valid ES suggest command

**/

function service( backend, cmd, cb ){
  // query new backend
  backend().client.suggest( cmd, function( err, data ){
    // handle backend errors
    if( err ){ return cb( err ); }
    
    // map returned documents
    
    var docs = [];
    var unique_ids = [];
    var num_keys = Object.keys(data).length;
    var has_docs = function(obj) {
      return Array.isArray( obj ) && obj.length && obj[0].options && obj[0].options.length;
    };
    for (var i=1, j=0; i<num_keys && j<num_keys; i++) {
      var keys = 'pelias_'+i;
      if ( has_docs(data[keys]) ){
        docs[i] = docs[i] || [];
        var res = data[keys][0].options[0];
        if (unique_ids.indexOf(res.text) === -1) {
          docs[i].push(res);
          unique_ids.push(res.text);
        } 
        data[keys][0].options.splice(0,1);
      } else {
        j++;
      }
      i = i === num_keys-1 ? 1 : i;
    }

    // fire callback
    return cb( null, docs);
  });

}

module.exports = service;