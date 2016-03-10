
#> layer alias
path: '/v1/search'
method: 'POST'
headers:
  'Accept': 'application/json'
  'Content-Type': 'application/json'
body: [
  { text: 'a' },
  { text: 'b', layers: 'badlayer'}
]

#? 400 bad request
response.statusCode.should.be.equal 400
response.should.have.header 'charset', 'utf8'
response.should.have.header 'content-type', 'application/json; charset=utf-8'

#? valid geocoding block
json.should.be.instanceof Array
should.exist json[0].geocoding
should.exist json[0].geocoding.version
should.exist json[0].geocoding.attribution
should.exist json[0].geocoding.query
should.exist json[0].geocoding.engine
should.exist json[0].geocoding.engine.name
should.exist json[0].geocoding.engine.author
should.exist json[0].geocoding.engine.version
should.exist json[0].geocoding.timestamp

should.exist json[1].geocoding
should.exist json[1].geocoding.version
should.exist json[1].geocoding.attribution
should.exist json[1].geocoding.query
should.exist json[1].geocoding.engine
should.exist json[1].geocoding.engine.name
should.exist json[1].geocoding.engine.author
should.exist json[1].geocoding.engine.version
should.exist json[1].geocoding.timestamp

#? valid geojson
json[0].type.should.be.equal 'FeatureCollection'
json[0].features.should.be.instanceof Array
json[1].type.should.be.equal 'FeatureCollection'
json[1].features.should.be.instanceof Array

#? expected errors
should.not.exist json[0].geocoding.errors
should.exist json[1].geocoding.errors
json[1].geocoding.errors.should.eql [ '\'badlayer\' is an invalid layers parameter. Valid options: coarse,address,venue,country,region,county,locality,continent,macrocountry,dependency,localadmin,macrohood,neighbourhood,microhood,disputed' ]

#? expected warnings
should.not.exist json[0].geocoding.warnings
should.not.exist json[1].geocoding.warnings

#? inputs
json[0].geocoding.query['text'].should.eql 'a'
json[0].geocoding.query['size'].should.eql 10
json[1].geocoding.query['text'].should.eql 'b'
json[1].geocoding.query['size'].should.eql 10
