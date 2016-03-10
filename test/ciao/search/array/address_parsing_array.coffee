
#> address parsing
path: '/v1/search'
method: 'POST'
headers:
  'Accept': 'application/json'
  'Content-Type': 'application/json'
body: [
  { text: '30 w 26th st, ny' },
  { text: '35 w 25th st, ny', size: 5 }
]

#? 400 bad request
response.statusCode.should.be.equal 200
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
json[1].type.should.be.equal 'FeatureCollection'
json[0].features.should.be.instanceof Array
json[1].features.should.be.instanceof Array

#? expected errors
should.not.exist json[0].geocoding.errors
should.not.exist json[1].geocoding.errors

#? expected warnings
should.not.exist json[0].geocoding.warnings
should.not.exist json[1].geocoding.warnings

#? inputs
json[0].geocoding.query['text'].should.eql '30 w 26th st, ny'
json[0].geocoding.query['size'].should.eql 10
json[1].geocoding.query['text'].should.eql '35 w 25th st, ny'
json[1].geocoding.query['size'].should.eql 5


#? address parsing
json[0].geocoding.query.parsed_text['name'].should.eql '30 w 26th st'
json[0].geocoding.query.parsed_text['number'].should.eql '30'
json[0].geocoding.query.parsed_text['street'].should.eql 'w 26th st'
json[0].geocoding.query.parsed_text['state'].should.eql 'NY'
json[0].geocoding.query.parsed_text['regions'].should.eql []
json[0].geocoding.query.parsed_text['admin_parts'].should.eql "ny"

json[1].geocoding.query.parsed_text['name'].should.eql '35 w 25th st'
json[1].geocoding.query.parsed_text['number'].should.eql '35'
json[1].geocoding.query.parsed_text['street'].should.eql 'w 25th st'
json[1].geocoding.query.parsed_text['state'].should.eql 'NY'
json[1].geocoding.query.parsed_text['regions'].should.eql []
json[1].geocoding.query.parsed_text['admin_parts'].should.eql "ny"
