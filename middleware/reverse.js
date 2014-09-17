// middleware
function middleware(req, res, next){
  req.required_query = "reverse";
  next();
}

module.exports = middleware;