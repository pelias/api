// Prevent search engines from attempting to index the API
// https://developers.google.com/search/reference/robots_meta_tag#xrobotstag

function middleware(req, res, next) {
  res.header('X-Robots-Tag', 'none');
  next();
}

module.exports = middleware;
