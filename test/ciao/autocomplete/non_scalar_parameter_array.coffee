
#> define two sources
path: '/v1/autocomplete?text=A&sources=A&sources=B'

#? 200 ok
response.statusCode.should.be.equal 400
response.should.have.header 'charset', 'utf8'
response.should.have.header 'content-type', 'application/json; charset=utf-8'

#? valid geocoding block
should.exist json.geocoding
should.exist json.geocoding.version
should.exist json.geocoding.attribution
should.exist json.geocoding.query
should.exist json.geocoding.engine
should.exist json.geocoding.engine.name
should.exist json.geocoding.engine.author
should.exist json.geocoding.engine.version
should.exist json.geocoding.timestamp

#? valid geojson
json.type.should.be.equal 'FeatureCollection'
json.features.should.be.instanceof Array

#? expected warnings
#should.not.exist json.geocoding.warnings
json.geocoding.warnings.should.eql ['performance optimization: excluding \'address\' layer']

#? expected errors
should.exist json.geocoding.errors
json.geocoding.errors.should.eql [ '\'sources\' parameter can only have one value' ]
