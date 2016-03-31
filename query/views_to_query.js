function addViewsToQuery(views, query, viewLib) {

  // Note: 'views' config values below are not sanitized. Api should stop if conf is bad.
  for(var type in views) { // type = score | filter
    var viewSet = views[type];
    for(var i=0; i<viewSet.length; i++) {
      var params = viewSet[i];

      // parse parameters from an array with the following format:
      //   [0]=view name, [1]=view's parameter (string or func)
      //   [2]=bool to select func in [1], [3]=optional scoring type
      var viewName = params[0];
      var param = null, option=null;
      if(params.length >= 2) {
	param = params[1];
      }
      if(params.length >= 3) {
        if (param && params[2]) {  // param is name of a function parameter
          param =  viewLib[param]; // name to function
	}
      }
      if(params.length >= 4) {
	option = params[3]; // must | should ...
      }
      if(param) {
	query[type]( viewLib[viewName](param), option );
      } else {
	query[type]( viewLib[viewName], option );
      }
    }
  }
}

module.exports = addViewsToQuery;
