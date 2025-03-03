
#> bounding gid
path: '/v1/autocomplete?text=a&boundary.gid=abc::'

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

#? expected errors
json.geocoding.errors.should.eql [
  'abc:: does not follow source:layer:id format'
]

#? expected warnings
#should.not.exist json.geocoding.warnings
json.geocoding.warnings.should.eql ['performance optimization: excluding \'address\' layer']

#? inputs
json.geocoding.query['text'].should.eql 'a'
json.geocoding.query['size'].should.eql 10
should.not.exist json.geocoding.query['boundary.gid']
