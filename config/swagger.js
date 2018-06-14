const options = { 
    'swaggerDefinition' : {
    'info': {
        'description': 'Swagger documentation for Pelias API',
        'title': 'Pelias API',
        'version': '1.0.0'
    }
    },
    'basePath': __dirname,
    'apis': ['./routes/*.js']
};

module.exports = options;