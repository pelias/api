const peliasQuery = require('pelias-query');

module.exports = function (adminFields) {
  const subview = peliasQuery.view.admin_multi_match(adminFields, 'peliasAdmin');

  return (vs) => {

    // check which of the possible admin_properties are actually set
    // from the query
    var valid_admin_properties = adminFields.filter(admin_property => {
      return admin_property &&
        vs.isset('input:' + admin_property) &&
        vs.isset('admin:' + admin_property + ':field');
    });

    if (valid_admin_properties.length === 0) {
      return null;
    }

    // the actual query text is simply taken from the first valid admin field
    // this assumes all the values would be the same, which is probably not true
    // TODO: handle the case where not all admin area input values are the same
    var tokens = vs.var('input:' + valid_admin_properties[0]).get().split(/\s+/g);

    // no valid tokens to use, fail now, don't render this view.
    if (!tokens || tokens.length < 2) { return null; }

    // make a copy Vars so we don't mutate the original
    var vsCopy = new peliasQuery.Vars(vs.export());

    // change field mappings
    vsCopy.var('admin:add_name_to_multimatch:field', 'phrase.default');
    adminFields.forEach(field => {
      if( vsCopy.isset(`admin:${field}:field`) ){
        vsCopy.var(`admin:${field}:field`, vsCopy.var(`admin:${field}:field`).get().replace('.ngram', ''));
      }
    });

    adminFields.forEach(field => {
      // set the admin variables in the copy to only the last token
      vsCopy.var(`input:${field}`).set(tokens.slice(0, -1).join(' '));
    });

    return subview(vsCopy);
  };
};
