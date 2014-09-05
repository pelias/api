
var app = require('./express');

// api root
app.get( '/', require('./controller/index' ) );

app.listen( process.env.PORT || 3100 );