
#> bounding rectangle
path: '/v1/search?text=a&boundary.rect.max_lat=-40.659&boundary.rect.min_lat=-41.614&boundary.rect.min_lon=174.612&boundary.rect.max_lon=176.333'

#? 200 ok
response.statusCode.should.be.equal 200
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
should.not.exist json.geocoding.errors

#? expected warnings
should.not.exist json.geocoding.warnings

#? inputs
json.geocoding.query['text'].should.eql 'a'
json.geocoding.query['size'].should.eql 10
json.geocoding.query['boundary.rect.min_lat'].should.eql -41.614
json.geocoding.query['boundary.rect.max_lat'].should.eql -40.659
json.geocoding.query['boundary.rect.min_lon'].should.eql 174.612
json.geocoding.query['boundary.rect.max_lon'].should.eql 176.333
