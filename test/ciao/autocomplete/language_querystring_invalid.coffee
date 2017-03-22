
#> language
path: '/v1/autocomplete?lang=example&text=example'

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
json.geocoding.warnings.should.eql [ 'invalid language provided via querystring' ]

#? language
json.geocoding.query['lang'].should.eql {
  name: 'English',
  iso6391: 'en',
  iso6393: 'eng',
  defaulted: true
}
