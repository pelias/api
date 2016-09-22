
function setup(){
  return query;
}

function query( clean ){
  return {
    type: 'mock',
    body: clean
  };
}

module.exports = setup;