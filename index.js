
var app = require('./express');

// api root
app.get( '/', require('./controller/index') );

// suggest API
app.get( '/suggest', require('./sanitiser/suggest'), require('./controller/suggest') );

app.listen( process.env.PORT || 3100 );