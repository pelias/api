var fieldsToRemove = ['text', 'focus.point.lat', 'focus.point.lon',
  'boundary.circle.lat', 'boundary.circle.lon', 'point.lat', 'point.lon'];

function isDNT(req) {
  if (!req.headers) {
    return false;
  }
  return req.headers.DNT || req.headers.dnt || req.headers.do_not_track;
}

function removeFields(query) {
  fieldsToRemove.forEach(function(field) {
    if (query[field]) {
      query[field] = '[removed]';
    }
  });

  return query;
}

module.exports = {
  isDNT: isDNT,
  removeFields: removeFields
};
