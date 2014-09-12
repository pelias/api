
// handle not found errors
function middleware(req, res) {
  res.header('Cache-Control','public,max-age=300'); // 5 minute cache
  res.status(404).json({ error: 'not found: invalid path' });
}

module.exports = middleware;