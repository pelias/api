const options = { 
    'swaggerDefinition' : {
    'info': {
        'description': 'Swagger documentation for Pelias API',
        'title': 'Pelias API',
        'version': '1.0.0'
    },
    'schemes': ['http','https'],
    'securityDefinitions': { 
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'security': [
       { 'Bearer': []} 
    ]
    },
    'basePath': __dirname,
    'apis': ['./routes/*.js']
};

module.exports = options;