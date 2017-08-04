var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = false;
var RECT_IS_REQUIRED = false;

// validate inputs, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_point( 'focus.point', clean, raw, LAT_LON_IS_REQUIRED );
    geo_common.sanitize_rect( 'boundary.rect', clean, raw, RECT_IS_REQUIRED );
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
}

function _expected(){
  return [
  { name: 'focus.point.lat' },
  { name: 'focus.point.lon' },
  { name: 'boundary.rect.min_lat' },
  { name: 'boundary.rect.max_lat' },
  { name: 'boundary.rect.min_lon' },
  { name: 'boundary.rect.max_lon' }];
}

module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
