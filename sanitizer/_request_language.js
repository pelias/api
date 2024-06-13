// this sanitizer exists solely to allow `lang` as a request parameter
function _sanitize( raw, clean ){
  // error & warning messages
  return { errors: [], warnings: [] };
}

function _expected(){
  return [{ 'name': 'lang' },
          { 'name': 'queryByLang'}];
}

// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
